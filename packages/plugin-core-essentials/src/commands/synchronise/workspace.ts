import {
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
} from "@business-as-code/core";

export class SyncroniseWorkspace extends BaseCommand<
  typeof SyncroniseWorkspace
> {
  static override description = "Ensures workspace state matches the FS";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    workspacePath: Flags.string({
      description: "Workspace name",
      required: true,
    }),
  };

  static override args = {
  };

  async execute(context: ContextCommand<typeof SyncroniseWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    // let workspacePath = await this.getWorkspacePath()


    const res = await context.lifecycles.configureWorkspace.executeConfigureWorkspace({
      context,
      workspacePath: context.workspacePath,
      workingPath: ".",
      options: {}, // <!-- typed as any atm ¯\_(ツ)_/¯
    });
    return res;
  }
}
