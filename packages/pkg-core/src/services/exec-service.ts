// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import { addr, AddressPathAbsolute } from '@business-as-code/address'
import { execUtils } from '../utils'
import { ServiceInitialiseCommonOptions } from '../__types__'

declare global {
  namespace Bac {
    interface Services {
      exec: {
        insType: ExecService
        staticType: typeof ExecService
      }
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {}
type DoExecOptionsLite = Omit<
  Parameters<typeof execUtils.doExec>[0]['options'],
  'context' | 'cwd'
>

/**
 Provides programmatic way to interact with a Bac instance
 */
export class ExecService {
  static title = 'exec' as const
  // title = 'bac' as const
  options: Required<Options>

  get ctor(): typeof ExecService {
    return this.constructor as unknown as typeof ExecService
  }
  get title(): (typeof ExecService)['title'] {
    return (this.constructor as any)
      .title as unknown as (typeof ExecService)['title']
  }

  static async initialise(options: Options) {
    const ins = new ExecService(options)
    await ins.initialise(options)
    return ins
  }

  constructor(options: Options) {
    this.options = options
  }

  protected async initialise(options: Options) {}

  async run(options: {
    command: string
    options?: DoExecOptionsLite
  }): ReturnType<typeof execUtils.doExec>
  async run(options: {
    command: string
    options: DoExecOptionsLite
  }): ReturnType<typeof execUtils.doExec>
  async run(options: {
    command: string
    options?: DoExecOptionsLite
  }): Promise<any> {
    const args = {
      command: `${options.command}`,
      options: {
        shell: true,
        ...(options.options ?? {}),
        context: this.options.context,
        cwd: addr.pathUtils.join(
          this.options.workspacePath,
          addr.parsePath(this.options.workingPath)
        ) as AddressPathAbsolute
      }
    }

    return execUtils.doExec(args)
  }
}
