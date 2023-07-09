
import { AddressPathAbsolute, AddressUrlGitString } from "@business-as-code/address";
import {
  Config,
  ConfigureWorkspaceLifecycleBase, Context
} from "@business-as-code/core";

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

export class ConfigureWorkspaceGitLifecycle extends ConfigureWorkspaceLifecycleBase<typeof ConfigureWorkspaceGitLifecycle> {

  static override title = 'git' as const

  override configureWorkspace():
    ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        config?: Config | undefined;
        options: {
          address: AddressUrlGitString, // standard git lifecycle has no callback semantics
        }
      }) => Promise<{
        address: AddressUrlGitString
      }>) {
    return async ({ context, config, options }) => {

      // possibly do stuff - validate / actual import?

      // if (options.)

      return {
        address: options.address,
      };
    };
  }
}

// type DDD = Bac.Lifecycles['configureWorkspace']['insType']['configureWorkspace']
