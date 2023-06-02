import { ConfigureWorkspaceLifecycle } from "./configure-workspace-lifecycle";
// import { InitialiseWorkspaceLifecycle } from "./initialise-workspace-lifecycle";

declare global {
  namespace Bac {
    interface Lifecycles {
      git: {
        configureWorkspace: {
          insType: ConfigureWorkspaceLifecycle;
          staticType: typeof ConfigureWorkspaceLifecycle;
        };
      };
    }
  }
}

export {
  ConfigureWorkspaceLifecycle,
  // InitialiseWorkspaceLifecycle,
};
