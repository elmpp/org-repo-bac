import {
  assertIsOk,
  BaseCommand,
  ContextCommand,
  Flags,
} from "@business-as-code/core";
import { MessageName } from "@business-as-code/error";

/**
 Generic command to run any schematic. Allows testing without standing up dedicated command
 */
export class BacTestsSchematicsRun extends BaseCommand<
  typeof BacTestsSchematicsRun
> {
  static override description = "Runs arbitrary schematic";

  //   static override examples = [
  //     `$ oex hello friend --from oclif
  // Produces the repos in the fixtures directory
  // `,
  //   ];

  static override flags = {
    // payload: Flags.custom({
    //     parse: async (): Promise<any> => {},
    //     char: 'p',
    //     description: 'team to use',
    //     default: () => {},
    // }),
    workspacePath: Flags.string({
      char: "w",
      description: "Workspace name",
      required: true,
    }),
    schematicsAddress: Flags.string({
      char: "s",
      description: "Schematics Address",
      required: true,
    }),
  };

  static override args = {};

  async execute(context: ContextCommand<typeof BacTestsSchematicsRun>) {
    // let repositoriesPath = addr.parsePath(context.cliOptions.flags.repositoriesPath! ?? path.resolve(__dirname, '../../../../pkg-tests-specs-fixtures/repositories'));
    // if (!assertIsAddressPath(repositoriesPath)) {
    //   throw new BacError(
    //     MessageName.FS_PATH_FORMAT_ERROR,
    //     `Path '${context.cliOptions.args.path.path}' cannot be parsed as a path`
    //   );
    // }
    // if (assertIsAddressPathRelative(repositoriesPath)) {
    //   repositoriesPath = addr.pathUtils.join(
    //     addr.parsePath(process.cwd()),
    //     repositoriesPath
    //   );
    // }
    // if (!assertIsAddressPathAbsolute(repositoriesPath)) {
    //   throw new BacError(
    //     MessageName.FS_PATH_FORMAT_ERROR,
    //     `Path '${repositoriesPath.original}' must be absolute/relative`
    //   );
    // }
    // if (!(await xfs.existsPromise(repositoriesPath.address))) {
    //   const repositoriesPathParent = addr.pathUtils.dirname(repositoriesPath);
    //   if (!(await xfs.existsPromise(repositoriesPathParent.address))) {
    //     throw new BacError(
    //       MessageName.FS_PATH_FORMAT_ERROR,
    //       `Parent path '${repositoriesPathParent.original}' must be present when creating workspace at '${repositoriesPath.original}'`
    //     );
    //   }
    //   await xfs.mkdirpPromise(repositoriesPath.address);
    // }
    // console.log(`repositoriesPath :>> `, repositoriesPath)
    // const repositoriesPath = addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('../../../../pkg-tests-specs-fixtures/repositories'))
    // console.log(`context.services :>> `, context.services);
    const schematicsService = await context.serviceFactory("schematics", {
      context,
      destinationPath: context.workspacePath,
      workingPath: ".",
    });

    const res = await schematicsService.runSchematic({
      // address: `@business-as-code/plugin-core-tests#namespace=repositories-create`,
      address: context.cliOptions.flags.schematicsAddress,
      context,
      options: (context.cliOptions.flags as any).payload,
      // destinationPath: workspacePath,
      // dryRun: false,
      // force: true,
      // workingPath: addr.pathUtils.dot,
    });

    if (!assertIsOk(res)) {
      switch (res.res.error.reportCode) {
        case MessageName.SCHEMATICS_ERROR:
          context.logger.error(res.res.error.message);
          break;
        case MessageName.SCHEMATICS_INVALID_ADDRESS:
          context.logger.error(res.res.error.message);
          break;
        case MessageName.SCHEMATICS_NOT_FOUND:
          context.logger.error(res.res.error.message);
          break;
      }
    }

    return res;

    //   override async run(): Promise<void> {
    //     }

    //     // this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
    //     this.log(`Creating a new workspace at '${workspacePath.original}'`)
    //   }
  }
}
