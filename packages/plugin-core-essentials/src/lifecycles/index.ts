// import { ConfigureWorkspaceLifecycle } from "./configure-workspace-lifecycle";
import { InitialiseWorkspaceCoreLifecycle } from "./initialise-workspace-core-lifecycle";
// import { SynchroniseWorkspaceCoreLifecycle } from "./synchronise-workspace-core-lifecycle";
import { RunWorkspaceMoonLifecycle } from "./run-workspace-moon-lifecycle";
import { RunWorkspaceNodeLifecycle } from "./run-workspace-node-lifecycle";
import { RunProjectNodeLifecycle } from "./run-project-node-lifecycle";

/** we must define them in one place due to augmentation limitations */
declare global {
  namespace Bac {
    interface Lifecycles {
      core: {
        initialiseWorkspace: {
          insType: InitialiseWorkspaceCoreLifecycle;
          staticType: typeof InitialiseWorkspaceCoreLifecycle;
        };
        // synchroniseWorkspace: {
        //   insType: SynchroniseWorkspaceCoreLifecycle;
        //   staticType: typeof SynchroniseWorkspaceCoreLifecycle;
        // };
      };
      moon: {
        runWorkspace: {
          insType: RunWorkspaceMoonLifecycle;
          staticType: typeof RunWorkspaceMoonLifecycle;
        };
      };
      node: {
        runWorkspace: {
          insType: RunWorkspaceNodeLifecycle;
          staticType: typeof RunWorkspaceNodeLifecycle;
        };
        runProject: {
          insType: RunProjectNodeLifecycle;
          staticType: typeof RunProjectNodeLifecycle;
        };
      };
    }
  }
}

export {
  InitialiseWorkspaceCoreLifecycle,
  // SynchroniseWorkspaceCoreLifecycle,
  RunWorkspaceMoonLifecycle,
  RunWorkspaceNodeLifecycle,
  RunProjectNodeLifecycle,
};
// export { ConfigureWorkspaceLifecycle, InitialiseWorkspaceLifecycle };
