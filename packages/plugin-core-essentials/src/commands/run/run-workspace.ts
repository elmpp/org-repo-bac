import {
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
} from "@business-as-code/core";

export class RunWorkspace extends BaseCommand<typeof RunWorkspace> {
  static override description = "Runs commands against workspace";

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
    /** Moon scopes - https://tinyurl.com/2ek7rph4 . @todo - validate this better here */
    query: Flags.string({
      description: "query to select projects",
      required: true,
    }),
    command: Flags.string({
      description: "Arbitrary command to run",
      required: true,
    }),
    // command:

    // workspacePath: Flags.string({
    //   description: "Workspace name",
    //   required: true,
    // }),
    // configPath: Flags.string({
    //   description: "Relative or absolute path to a workspace configuration",
    //   required: false,
    // }),
    // cliVersion: Flags.string({
    //   description: "Specify a Bac cli version",
    //   required: false,
    //   default: "*",
    // }),
    // registry: Flags.string({
    //   description: "Specify a package manager registry to load the Bac cli",
    //   required: false,
    //   default: "http://localhost:4873",
    // }),
  };

  static override args = {
    // path: Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  async execute(context: ContextCommand<typeof RunWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    // let workspacePath = addr.parsePath(context.cliOptions.flags.workspacePath!);
    // let workspacePath = await this.getWorkspacePath()

    const workingPaths: string[] = []

    const res = await context.lifecycles.run.runWorkspace({
      context,
      workingPaths,
      // destinationPath: workspacePath,
      // workingPath: ".",
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
    //   address: `@business-as-code/plugin-core-essentials#namespace=initialise-workspace`,
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
