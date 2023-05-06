import {
  addr,
  assertIsAddressPath,
  assertIsAddressPathAbsolute,
  assertIsAddressPathRelative,
} from "@business-as-code/address";
import {
  assertIsOk,
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
} from "@business-as-code/core";
import { BacError, MessageName } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";
import path from "path";


export class BacTestsRepoCreate extends BaseCommand<typeof BacTestsRepoCreate> {
  static override description = "Creates the tests git repositories";

//   static override examples = [
//     `$ oex hello friend --from oclif
// Produces the repos in the fixtures directory
// `,
//   ];

  static override flags = {
    // name: Flags.string({
    //   description: "Repository name",
    //   required: true,
    // }),
    repositoriesPath: Flags.string({
      description: "Repositories name",
      required: false,
    }),
    workspacePath: Flags.string({
      description: "Workspace name",
      required: false,
    }),
    // configPath: Flags.string({
    //   description: "Relative or absolute path to a workspace configuration",
    //   required: false,
    // }),
  };

  static override args = {
    // path: Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  async execute(context: ContextCommand<typeof BacTestsRepoCreate>) {

    let repositoriesPath = addr.parsePath(context.cliOptions.flags.repositoriesPath! ?? path.resolve(__dirname, '../../../../pkg-tests-specs-fixtures/repositories'));
    if (!assertIsAddressPath(repositoriesPath)) {
      throw new BacError(
        MessageName.FS_PATH_FORMAT_ERROR,
        `Path '${context.cliOptions.args.path.path}' cannot be parsed as a path`
      );
    }
    if (assertIsAddressPathRelative(repositoriesPath)) {
      repositoriesPath = addr.pathUtils.join(
        addr.parsePath(process.cwd()),
        repositoriesPath
      );
    }
    if (!assertIsAddressPathAbsolute(repositoriesPath)) {
      throw new BacError(
        MessageName.FS_PATH_FORMAT_ERROR,
        `Path '${repositoriesPath.original}' must be absolute/relative`
      );
    }
    if (!(await xfs.existsPromise(repositoriesPath.address))) {
      const repositoriesPathParent = addr.pathUtils.dirname(repositoriesPath);
      if (!(await xfs.existsPromise(repositoriesPathParent.address))) {
        throw new BacError(
          MessageName.FS_PATH_FORMAT_ERROR,
          `Parent path '${repositoriesPathParent.original}' must be present when creating workspace at '${repositoriesPath.original}'`
        );
      }
      await xfs.mkdirpPromise(repositoriesPath.address);
    }
// console.log(`repositoriesPath :>> `, repositoriesPath)
    // const repositoriesPath = addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('../../../../pkg-tests-specs-fixtures/repositories'))
    // console.log(`context.services :>> `, context.services);
    const schematicsService = await context.serviceFactory('schematics', {context, destinationPath: repositoriesPath, workingPath: '.'})

    const res = await schematicsService.runSchematic({
      address: `@business-as-code/plugin-core-tests#namespace=repositories-create`,
      context,
      options: {},
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

    return res

    //   override async run(): Promise<void> {
    //     }

    //     // this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
    //     this.log(`Creating a new workspace at '${workspacePath.original}'`)
    //   }
  }
}
