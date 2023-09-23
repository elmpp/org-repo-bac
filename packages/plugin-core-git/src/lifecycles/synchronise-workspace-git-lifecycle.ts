import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Config,
  Context,
  ok,
  ServiceMap,
  SynchroniseWorkspaceLifecycleBase,
} from "@business-as-code/core";

// declare global {
//   namespace Bac {
//     interface Lifecycles {
//       core: {
//       // ['@business-as-code/plugin-core-essentials']: {
//       synchroniseWorkspace: {
//           insType: SynchroniseWorkspaceLifecycle;
//           staticType: typeof SynchroniseWorkspaceLifecycle;
//         };
//       }
//     }
//   }
// }

export class SynchroniseWorkspaceGitLifecycle extends SynchroniseWorkspaceLifecycleBase<
  typeof SynchroniseWorkspaceGitLifecycle
> {
  static override title = "git" as const;

  // override get ctor(): typeof SynchroniseWorkspaceLifecycle {
  //   return this.constructor as any;
  // }

  override synchroniseWorkspace(): (options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    // workingPath: string;
    options: {
      // a: "a";
      // name: string;
      config: Config;
      // configPath: string;
      // cliVersion: string;
      // cliRegistry: string;
      // cliPath?: string;
    };
  }) => ReturnType<ServiceMap["schematics"][number]["runSchematic"]> {
    return async ({ context, workspacePath, options: { config } }) => {
      // const config = await fsUtils.loadConfig(workspacePath);

      console.log(
        `config :>> `,
        require("util").inspect(config, {
          showHidden: false,
          depth: undefined,
          colors: true,
        })
      );

      return ok({
        destinationPath: workspacePath,
      });

      // is the configured config up to date
      // if ()

      // console.log(`context.cliOptions.flags :>> `, context.cliOptions.flags);
      // console.log(`configPath, cliVersion, cliRegistry :>> `, configPath, cliVersion, cliRegistry)

      // return res;
    };
  }
}

// type DDD = Bac.Lifecycles['synchroniseWorkspace']['insType']['synchroniseWorkspace']
