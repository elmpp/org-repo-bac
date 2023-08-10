import {
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
} from "@business-as-code/core";

export class SynchroniseWorkspace extends BaseCommand<
  typeof SynchroniseWorkspace
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

  async execute(context: ContextCommand<typeof SynchroniseWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    // let workspacePath = await this.getWorkspacePath()

    const res = await context.lifecycles.synchroniseWorkspace.executeSynchroniseWorkspace([{
      provider: 'git',
      options: {
        context,
        workspacePath: context.workspacePath,
        // workingPath: ".",
        options: {
          a: 'a',
          // name: context.cliOptions.flags.name,
          // config,
          // configPath: configPath.original,
          // cliVersion: context.cliOptions.flags.cliVersion,
          // cliRegistry: context.cliOptions.flags.cliRegistry,
          // cliPath: context.cliOptions.flags.cliPath,
        }, // <!-- typed as any atm ¯\_(ツ)_/¯
      }
    }]);
    return res.res;
  }
}
