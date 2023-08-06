import {
  addr,
  AddressPathAbsolute,
  AddressPathRelative,
  assertIsAddressPath,
  assertIsAddressPathAbsolute,
  assertIsAddressPathRelative,
} from "@business-as-code/address";
import {
  fsUtils,
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
  Config,
  configSchema,
} from "@business-as-code/core";
import {
  BacError,
  BacErrorWrapper,
  MessageName,
} from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

export class ConfigureWorkspace extends BaseCommand<
  typeof ConfigureWorkspace
> {
  static override description = "Performs the configuration expansion";

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
  };

  static override args = {};


  async execute(context: ContextCommand<typeof ConfigureWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    let workspacePath = this.getWorkspacePath()

    // const {config, path: configPath} = await this.getConfig(context);

    const res = await context.lifecycles.configureWorkspace.executeConfigureWorkspace([{
      provider: 'core',
      options: {
        context,
        workspacePath,
        // workingPath: ".",
        options: {
          name: context.cliOptions.flags.name,
          config,
          configPath: configPath.original,
          cliVersion: context.cliOptions.flags.cliVersion,
          cliRegistry: context.cliOptions.flags.cliRegistry,
          cliPath: context.cliOptions.flags.cliPath,
          // options: {
          //   a: 'a',
          // }, // <!-- typed as any atm ¯\_(ツ)_/¯
        }
    }}]);

    return res.res; // we eschew the provider wrapping for our solitary initialWorkspace
  }
}
