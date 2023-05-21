import {
  addr,
  assertIsAddressPath,
  assertIsAddressPathAbsolute,
  assertIsAddressPathRelative,
} from "@business-as-code/address";
import {
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
} from "@business-as-code/core";
import { BacError, MessageName } from "@business-as-code/error";

export class InitialiseWorkspace extends BaseCommand<typeof InitialiseWorkspace> {
  static override description = "Creates an empty workspace";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    name: Flags.string({
      description: "Workspace name",
      required: true,
    }),
    workspacePath: Flags.string({
      description: "Workspace name",
      required: true,
    }),
    configPath: Flags.string({
      description: "Relative or absolute path to a workspace configuration",
      required: false,
    }),
    cliVersion: Flags.string({
      description: "Specify a Bac cli version",
      required: false,
      default: "latest",
    }),
    cliRegistry: Flags.string({
      description: "Specify a package manager registry to load the Bac cli",
      required: false,
      // default: "http://localhost:4873",
    }),
  };

  static override args = {
    // firstArg: Args.string(
    //   {
    //     name: 'workspace',               // name of arg to show in help and reference with args[name]
    //     required: false,            // make the arg required with `required: true`
    //     description: 'output file', // help description
    //     hidden: true,               // hide this arg from help
    //     // parse: input => 'output',   // instead of the user input, return a different value
    //     default: 'world',           // default value if no arg input
    //     options: ['a', 'b'],        // only allow input to be from a discrete set
    //   }
    // ),
    // path: Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  async execute(context: ContextCommand<typeof InitialiseWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    let workspacePath = addr.parsePath(context.cliOptions.flags.workspacePath!);
    if (!assertIsAddressPath(workspacePath)) {
      throw new BacError(
        MessageName.FS_PATH_FORMAT_ERROR,
        `Path '${context.cliOptions.args.path.path}' cannot be parsed as a path`
      );
    }
    if (assertIsAddressPathRelative(workspacePath)) {
      workspacePath = addr.pathUtils.join(
        addr.parsePath(process.cwd()),
        workspacePath
      );
    }
    if (!assertIsAddressPathAbsolute(workspacePath)) {
      throw new BacError(
        MessageName.FS_PATH_FORMAT_ERROR,
        `Path '${workspacePath.original}' must be absolute/relative`
      );
    }

    const res = await context.lifecycles.initialise.initialiseWorkspace({
      context,
      workspacePath,
      workingPath: ".",
    });
    return res;

    // if (!(await xfs.existsPromise(workspacePath.address))) {
    //   const workspacePathParent = addr.pathUtils.dirname(workspacePath);
    //   if (!(await xfs.existsPromise(workspacePathParent.address))) {
    //     throw new BacError(
    //       MessageName.FS_PATH_FORMAT_ERROR,
    //       `Parent path '${workspacePathParent.original}' must be present when creating workspace at '${workspacePath.original}'`
    //     );
    //   }
    //   await xfs.mkdirpPromise(workspacePath.address);
    // }

    // // console.log(`context.services :>> `, context.services);

    // const schematicsService = await context.serviceFactory('schematics', {context, destinationPath: context.workspacePath, workingPath: '.'})

    // const res = await schematicsService.runSchematic({
    //   address: `@business-as-code/plugin-core-essentials#namespace=workspace-init`,
    //   context,
    //   options: {
    //     ...context.cliOptions.flags,
    //     // name: context.cliOptions.flags.name,
    //     // // destinationPath: context.cliOptions.flags.workspacePath,
    //     // configPath: context.cliOptions.flags.configPath,

    //     // name: 'cunt',
    //     // author: 'boloerguie',

    //   },
    //   // destinationPath: workspacePath,
    //   // dryRun: false,
    //   // force: true,
    //   // workingPath: addr.pathUtils.dot,
    // });

    // if (!assertIsOk(res)) {
    //   switch (res.res.error.reportCode) {
    //     case MessageName.SCHEMATICS_ERROR:
    //       context.logger.error(res.res.error.message);
    //       break;
    //     case MessageName.SCHEMATICS_INVALID_ADDRESS:
    //       context.logger.error(res.res.error.message);
    //       break;
    //     case MessageName.SCHEMATICS_NOT_FOUND:
    //       context.logger.error(res.res.error.message);
    //       break;
    //   }
    // }

    // // if (!assertIsOk(res)) {
    // //   switch (res.res.reportCode) {
    // //     case MessageName.SCHEMATICS_ERROR:
    // //       context.logger(res.res.message, "error");
    // //       break;
    // //     case MessageName.SCHEMATICS_INVALID_ADDRESS:
    // //       context.logger(res.res.message, "error");
    // //       break;
    // //     case MessageName.SCHEMATICS_NOT_FOUND:
    // //       context.logger(res.res.message, "error");
    // //       break;
    // //   }
    // // } else {
    // //   context.logger(`Finished ok. Scaffolded into '${res.res.destinationPath.original}'`, "info");
    // // }

    // return res

    //   override async run(): Promise<void> {
    //     }

    //     // this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
    //     this.log(`Creating a new workspace at '${workspacePath.original}'`)
    //   }
  }
}
