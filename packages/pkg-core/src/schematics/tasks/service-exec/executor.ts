import { SchematicContext, TaskExecutor } from '@angular-devkit/schematics';
import { assertUtils } from '../../../utils';
import { ServiceMap } from '../../../__types__';
import {
  ServiceExecTaskFactoryOptions,
  ServiceExecTaskOptions
} from './options';

export function serviceExecExecutor<SName extends keyof ServiceMap>(
  _?: ServiceExecTaskFactoryOptions,
): TaskExecutor<ServiceExecTaskOptions<SName>> {

  return async (options: ServiceExecTaskOptions<SName> = {} as ServiceExecTaskOptions<SName>, _schematicContext: SchematicContext) => {

    // if (!options) {
    //   throw new Error(`How is this supposed to work then huh!!`)
    // }

    // if (options == {}) {
    //   throw new Error(`How is this supposed to work then huh!!`)
    // }
    assertUtils.assertNonEmpty(options)

    const {serviceName, initialiseOptions, cb, context} = options

    const service = await context!.serviceFactory(serviceName, initialiseOptions)

    return cb({service, serviceName})

    // return

    // const authorName = options.authorName;
    // const authorEmail = options.authorEmail;

    // const execute = (args: string[], ignoreErrorStream?: boolean) => {
    //   const outputStream = 'ignore';
    //   const errorStream = ignoreErrorStream ? 'ignore' : process.stderr;
    //   const spawnOptions: SpawnOptions = {
    //     stdio: [process.stdin, outputStream, errorStream],
    //     shell: true,
    //     cwd: path.join(rootDirectory, options.workingDirectory || ''),
    //     env: {
    //       ...process.env,
    //       ...(authorName ? { GIT_AUTHOR_NAME: authorName, GIT_COMMITTER_NAME: authorName } : {}),
    //       ...(authorEmail
    //         ? { GIT_AUTHOR_EMAIL: authorEmail, GIT_COMMITTER_EMAIL: authorEmail }
    //         : {}),
    //     },
    //   };

    //   return new Promise<void>((resolve, reject) => {
    //     spawn('git', args, spawnOptions).on('close', (code: number) => {
    //       if (code === 0) {
    //         resolve();
    //       } else {
    //         reject(code);
    //       }
    //     });
    //   });
    // };

    // const hasCommand = await execute(['--version']).then(
    //   () => true,
    //   () => false,
    // );
    // if (!hasCommand) {
    //   return;
    // }

    // const insideRepo = await execute(['rev-parse', '--is-inside-work-tree'], true).then(
    //   () => true,
    //   () => false,
    // );
    // if (insideRepo) {
    //   context.logger.info(tags.oneLine`
    //     Directory is already under version control.
    //     Skipping initialization of git.
    //   `);

    //   return;
    // }

    // // if git is not found or an error was thrown during the `git`
    // // init process just swallow any errors here
    // // NOTE: This will be removed once task error handling is implemented
    // try {
    //   await execute(['init']);
    //   await execute(['add', '.']);

    //   if (options.commit) {
    //     const message = options.message || 'initial commit';

    //     await execute(['commit', `-m "${message}"`]);
    //   }

    //   context.logger.info('Successfully initialized git.');
    // } catch {}
  };
}
