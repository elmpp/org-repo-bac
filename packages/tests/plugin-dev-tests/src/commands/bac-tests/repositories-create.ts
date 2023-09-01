import { addr, assertIsAddressPathAbsolute } from "@business-as-code/address";
import {
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
  assertIsOk,
  constants,
} from "@business-as-code/core";
import { BacError, MessageName } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

export class BacTestsRepoCreate extends BaseCommand<typeof BacTestsRepoCreate> {
  static override description = "Creates the tests git repositories";

  //   static override examples = [
  //     `$ oex hello friend --from oclif
  // Produces the repos in the fixtures directory
  // `,
  //   ];

  static override flags = {
    // name: Oclif.Flags.string({
    //   description: "Repository name",
    //   required: true,
    // }),
    repositoriesPath: Oclif.Flags.directory({
      description: "Repositories name",
      exists: true,
      required: false,
      default: constants.GIT_SSH_MOCK_SERVER_ROOT,
    }),
    workspacePath: Oclif.Flags.directory({
      exists: true,
      description: "Workspace name",
      required: false,
    }),
    // configPath: Oclif.Flags.string({
    //   description: "Relative or absolute path to a workspace configuration",
    //   required: false,
    // }),
  };

  static override args = {
    // path: Oclif.Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  async execute(context: ContextCommand<typeof BacTestsRepoCreate>) {
    let repositoriesPath = addr.parsePath(
      context.cliOptions.flags.repositoriesPath!
    );
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
    if (!assertIsAddressPathAbsolute(repositoriesPath)) {
      throw new BacError(
        MessageName.FS_PATH_FORMAT_ERROR,
        `Path '${repositoriesPath.original}' must be absolute/relative`
      );
    }
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
      workingPath: ".",
      workspacePath: repositoriesPath,
    });

    context.logger.info(
      `Creating repositories in '${repositoriesPath.original}'`
    );

    if (!(await xfs.existsPromise(repositoriesPath.address))) {
      context.logger.info(
        `Creating repositories directory at '${repositoriesPath.original}'`
      );
      await xfs.mkdirPromise(repositoriesPath.address);
    }

    const res = await schematicsService.runSchematic({
      address: `@business-as-code/plugin-dev-tests#namespace=repositories-create`,
      options: {},
    });

    context.logger.info(
      `Created repositories in '${repositoriesPath.original}'`
    );

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
