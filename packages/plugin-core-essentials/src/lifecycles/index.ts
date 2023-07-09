// import { ConfigureWorkspaceLifecycle } from "./configure-workspace-lifecycle";
import { InitialiseWorkspaceLifecycle } from "./initialise-workspace-lifecycle";
import { RunWorkspaceMoonLifecycle } from "./run-workspace-moon-lifecycle";
import { RunWorkspaceNodeLifecycle } from "./run-workspace-node-lifecycle";
import { RunProjectNodeLifecycle } from "./run-project-node-lifecycle";

/** we must define them in one place due to augmentation limitations */
declare global {
  namespace Bac {
    interface Lifecycles {
      core: {
        initialiseWorkspace: {
          insType: InitialiseWorkspaceLifecycle;
          staticType: typeof InitialiseWorkspaceLifecycle;
        };
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
  InitialiseWorkspaceLifecycle,
  RunWorkspaceMoonLifecycle,
  RunWorkspaceNodeLifecycle,
  RunProjectNodeLifecycle,
};
// export { ConfigureWorkspaceLifecycle, InitialiseWorkspaceLifecycle };
