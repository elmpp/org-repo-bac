import { ConfigureWorkspaceLifecycle } from "./configure-workspace-lifecycle";
import { InitialiseWorkspaceLifecycle } from "./initialise-workspace-lifecycle";

/** we must define them in one place due to augmentation limitations */
declare global {
  namespace Bac {
    interface Lifecycles {
      core: {
        // ['@business-as-code/plugin-core-essentials']: {
        configureWorkspace: {
          // type: 'a'
          insType: ConfigureWorkspaceLifecycle;
          staticType: typeof ConfigureWorkspaceLifecycle;
        };
        initialiseWorkspace: {
          // type: 'b'
          insType: InitialiseWorkspaceLifecycle;
          staticType: typeof InitialiseWorkspaceLifecycle;
        };
      };
    }
  }
}

export { ConfigureWorkspaceLifecycle, InitialiseWorkspaceLifecycle };
