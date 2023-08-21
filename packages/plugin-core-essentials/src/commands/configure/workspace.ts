import {
  fsUtils,
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
  LifecycleOptionsByMethodKeyedByProviderArray,
  ok,
} from "@business-as-code/core";

export class ConfigureWorkspace extends BaseCommand<typeof ConfigureWorkspace> {
  static override description = "Performs the configuration expansion";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    // name: Oclif.Flags.string({
    //   description: "Workspace name",
    //   required: true,
    // }),
    workspacePath: Oclif.Flags.directory({
  exists: true,
      description: "Workspace name",
      required: true,
    }),
  };

  static override args = {};

  async execute(context: ContextCommand<typeof ConfigureWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    // let workspacePath = await this.getWorkspacePath(context.cliOptions.flags.workspacePath);

    // const {config, path: configPath} = await this.getConfig(context);

    const config = fsUtils.loadConfig(context.workspacePath);
    const lifecycleOptions: LifecycleOptionsByMethodKeyedByProviderArray<"configureWorkspace"> =
      config.projectSource.map((ps) => ({
        ...ps,
        options: {
          workspacePath: context.workspacePath,
          context,
          options: {
            ...ps.options,
          },
        },
      }));

    const res =
      await context.lifecycles.configureWorkspace.executeConfigureWorkspace(
        lifecycleOptions
      );

    return ok(res);
  }
}
