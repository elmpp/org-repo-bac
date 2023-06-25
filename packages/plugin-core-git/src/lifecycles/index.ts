import { ConfigureWorkspaceGitLifecycle } from "./configure-workspace-git-lifecycle";
// import { ConfigureWorkspaceGitCallbackLifecycle } from "./configure-workspace-git-callback-lifecycle";

// import { InitialiseWorkspaceLifecycle } from "./initialise-workspace-lifecycle";

declare global {
  namespace Bac {
    interface Lifecycles {
      git: {
        configureWorkspace: {
          insType: ConfigureWorkspaceGitLifecycle;
          staticType: typeof ConfigureWorkspaceGitLifecycle;
        };
      };
      // gitCallback: {
      //   configureWorkspace: {
      //     insType: ConfigureWorkspaceGitCallbackLifecycle;
      //     staticType: typeof ConfigureWorkspaceGitCallbackLifecycle;
      //   };
      // };
    }
  }
}

export {
  ConfigureWorkspaceGitLifecycle,
  // ConfigureWorkspaceGitCallbackLifecycle,
  // InitialiseWorkspaceLifecycle,
};
