
import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  ConfigureWorkspaceLifecycleBase,
} from "@business-as-code/core";
import { Config } from "prettier";

// declare global {
//   namespace Bac {
//     interface Lifecycles {
//       git: {
//       configureWorkspace: {
//           insType: ConfigureWorkspaceLifecycle;
//           staticType: typeof ConfigureWorkspaceLifecycle;
//         };
//       }
//     }
//   }
// }

export class ConfigureWorkspaceLifecycle extends ConfigureWorkspaceLifecycleBase<typeof ConfigureWorkspaceLifecycle> {

  static title = 'git' as const

  override configureWorkspace():
    ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        config?: Config | undefined;
      }) => Promise<{
        b: "b",
      }>) {
    return async ({ context }) => {
      return {
        b: "b",
      };
    };
  }
}

// type DDD = Bac.Lifecycles['configureWorkspace']['insType']['configureWorkspace']
