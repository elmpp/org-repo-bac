import { ConfigureWorkspaceGitLifecycle } from "./configure-workspace-git-lifecycle";
import { SynchroniseWorkspaceGitLifecycle } from "./synchronise-workspace-git-lifecycle";
import { FetchContentGitLifecycle } from "./fetch-content-git-lifecycle";
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
        fetchContent: {
          insType: FetchContentGitLifecycle;
          staticType: typeof FetchContentGitLifecycle;
        };
        synchroniseWorkspace: {
          insType: SynchroniseWorkspaceGitLifecycle;
          staticType: typeof SynchroniseWorkspaceGitLifecycle;
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
  FetchContentGitLifecycle,
  SynchroniseWorkspaceGitLifecycle,
  // ConfigureWorkspaceGitCallbackLifecycle,
  // InitialiseWorkspaceLifecycle,
};
