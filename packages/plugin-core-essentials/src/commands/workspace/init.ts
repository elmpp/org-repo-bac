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
import { xfs } from "@business-as-code/fslib";
import { BacError, MessageName } from "../../../../pkg-error/src";


export class WorkspaceInit extends BaseCommand<typeof WorkspaceInit> {
  static override description = "Creates an empty workspace";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    name: Flags.string({
      char: "n",
      description: "Workspace name",
      required: true,
    }),
    destinationPath: Flags.string({
      char: "d",
      description: "Workspace name",
      required: true,
    }),
    configPath: Flags.string({
      char: "c",
      description: "Relative or absolute path to a workspace configuration",
      required: false,
    }),
  };

  static override args = {
    // path: Args.string({
    //   char: "d",
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  async execute(context: ContextCommand<typeof WorkspaceInit>) {
    // console.log(`execute:context :>> `, context)
    // context.services.myService.somethingelse()

    // const { args } = await this.parse(WorkspaceInit);
    // console.log(
    //   `context.cliOptions.args.path :>> `,
    //   context.cliOptions.args.path
    // );
    // console.log(`context.cliOptions :>> `, context.cliOptions);
    // const poo = ParserOutput<T['flags'], T['flags'], T['args']>
    // type DD = WorkspaceInit['flags']
    // type DDd = WorkspaceInit['args']

    let workspacePath = addr.parsePath(context.cliOptions.flags.destinationPath!);
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
    if (!(await xfs.existsPromise(workspacePath.address))) {
      const workspacePathParent = addr.pathUtils.dirname(workspacePath);
      if (!(await xfs.existsPromise(workspacePathParent.address))) {
        throw new BacError(
          MessageName.FS_PATH_FORMAT_ERROR,
          `Parent path '${workspacePathParent.original}' must be present when creating workspace at '${workspacePath.original}'`
        );
      }
      await xfs.mkdirpPromise(workspacePath.address);
    }

    // console.log(`context.services :>> `, context.services);


    const res = await context.services.schematics.run({
      address: `@business-as-code/plugin-core-essentials#namespace=workspace-init`,
      context,
      options: {
        name: context.cliOptions.flags.name,
        destinationPath: context.cliOptions.flags.destinationPath,
        configPath: context.cliOptions.flags.configPath,
        // name: 'cunt',
        // author: 'boloerguie',



      },
      destinationPath: workspacePath,
      dryRun: false,
      force: true,
    });

    console.log(`:>> FINISHED`);
    console.log(`res :>> `, res)


    if (!assertIsOk(res)) {
      switch (res.res.reportCode) {
        case MessageName.SCHEMATICS_ERROR:
          context.logger(res.res.message, "error");
          break;
        case MessageName.SCHEMATICS_INVALID_ADDRESS:
          context.logger(res.res.message, "error");
          break;
        case MessageName.SCHEMATICS_NOT_FOUND:
          context.logger(res.res.message, "error");
          break;
      }
    } else {
      context.logger(`Finished ok. Scaffolded into '${res.res.original}'`, "info");
    }

    //   override async run(): Promise<void> {
    //     }

    //     // this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
    //     this.log(`Creating a new workspace at '${workspacePath.original}'`)
    //   }
  }
}
