// declare global {
//   interface Bac {
//     "@business-as-code/plugin-core-essentials": {
//       services: {
//         myService: {
//           // plugin: "@business-as-code/plugin-core-essentials";
//           insType: typeof MyService;
//           staticType: MyService;
//         };
//       };
//     };
//   }
// }

import { addr, AddressPathRelative } from '@business-as-code/address'
import { ServiceInitialiseCommonOptions } from '@business-as-code/core'
import { spawn, SpawnOptions } from 'child_process'

declare global {
  namespace Bac {
    interface Services {
      myService: {
        insType: MyService
        staticType: typeof MyService
      }
    }
  }
  // export interface BacServices {
  //   myService: MyService;
  // }
}

// type Options = { context: Context; destinationPath: AddressPathAbsolute, workingDirectory: AddressPathRelative };

export class MyService {
  static title = 'myService' as const
  static async initialise(options: ServiceInitialiseCommonOptions) {
    return new MyService(options)
  }

  constructor(protected options: ServiceInitialiseCommonOptions) {}

  get ctor(): typeof MyService {
    return this.constructor as unknown as typeof MyService
  }
  get title(): (typeof MyService)['title'] {
    return (this.constructor as any)
      .title as unknown as (typeof MyService)['title']
  }

  static staticFunc1() {}
  async func1({
    someRandomProps,
    workingPath = addr.pathUtils.dot
  }: {
    someRandomProps: string
    workingPath?: AddressPathRelative
  }) {
    const execute = (args: string[], ignoreErrorStream?: boolean) => {
      const outputStream = 'ignore'
      const errorStream = ignoreErrorStream ? 'ignore' : process.stderr
      const spawnOptions: SpawnOptions = {
        stdio: [process.stdin, outputStream, errorStream],
        shell: true,
        cwd: addr.pathUtils.join(
          this.options.context.workspacePath,
          workingPath
        ).original,
        env: {}
      }

      return new Promise<void>((resolve, reject) => {
        spawn('git', args, spawnOptions).on('close', (code: number) => {
          if (code === 0) {
            resolve()
          } else {
            reject(code)
          }
        })
      })
    }

    const hasCommand = await execute(['--version']).then(
      () => true,
      () => false
    )
    if (!hasCommand) {
      return
    }

    const insideRepo = await execute(
      ['rev-parse', '--is-inside-work-tree'],
      true
    ).then(
      () => true,
      () => false
    )
    if (insideRepo) {
      this.options.context.logger.debug(
        `
        Directory is already under version control.
        Skipping initialization of git.
      `
      )

      return
    }

    // if git is not found or an error was thrown during the `git`
    // init process just swallow any errors here
    // NOTE: This will be removed once task error handling is implemented
    try {
      await execute(['init'])
      await execute(['add', '.'])

      // if (options.commit) {
      //   const message = options.message || 'initial commit';

      //   await execute(['commit', `-m "${message}"`]);
      // }

      this.options.context.logger.debug('Successfully initialized git.')
    } catch {}
  }
}
