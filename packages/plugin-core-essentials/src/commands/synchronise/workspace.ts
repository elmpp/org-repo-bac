import {
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
  expectIsOk,
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
    workspacePath: Oclif.Flags.directory({
  exists: true,
      description: "Workspace name",
      required: true,
    }),
  };

  static override args = {
  };

  async execute(context: ContextCommand<typeof SynchroniseWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    // let workspacePath = await this.getWorkspacePath()

    // has the configured config file been changed?
    const moonService = await context.serviceFactory('moon', {
      context,
      workspacePath: await this.getWorkspacePath(),
      workingPath: '.',
    })
    // const configuredConfigAffected = moonService.

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

    expectIsOk(res)
    return res.res.res;
  }
}
