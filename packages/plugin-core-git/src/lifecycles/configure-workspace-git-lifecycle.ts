
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

/** simple configure lifecycle. Atm, just passes along a git descriptor. Will provide callback semantics later */
export class ConfigureWorkspaceGitLifecycle extends ConfigureWorkspaceLifecycleBase<typeof ConfigureWorkspaceGitLifecycle> {

  static override title = 'git' as const

  override configureWorkspace():
    ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        // config?: Config | undefined; // why optional
        options: {
          address: AddressUrlGitString, // standard git lifecycle has no callback semantics
          // callback?: (tree, otherBollocks) => {} // unpack and allow clients to pick out their own projects
        }
      }) => Promise<{
        address: AddressUrlGitString
      }>) {
    return async ({ context, options: {address} }) => {

      // possibly do stuff - validate / actual import?

      // if (options.)

      return {
        address,
      };
    };
  }
}

// type DDD = Bac.Lifecycles['configureWorkspace']['insType']['configureWorkspace']
