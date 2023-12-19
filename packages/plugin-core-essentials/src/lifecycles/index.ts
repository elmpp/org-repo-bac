// import { ConfigureWorkspaceLifecycle } from "./configure-workspace-lifecycle";
import { InitialiseWorkspaceCoreLifecycle } from "./initialise-workspace-core-lifecycle";
// import { ConfigureWorkspaceCoreLifecycle } from "./configure-workspace-core-lifecycle";
import { RunWorkspaceMoonLifecycle } from "./run-workspace-moon-lifecycle";
import { RunWorkspaceExecLifecycle } from "./run-workspace-exec-lifecycle";
// import { RunProjectNodeLifecycle } from "./run-project-node-lifecycle";

/** we must define them in one place due to augmentation limitations */
declare global {
  namespace Bac {
    interface Lifecycles {
      core: {
        initialiseWorkspace: {
          insType: InitialiseWorkspaceCoreLifecycle;
          staticType: typeof InitialiseWorkspaceCoreLifecycle;
        };
        // configureWorkspace: {
        //   insType: ConfigureWorkspaceCoreLifecycle;
        //   staticType: typeof ConfigureWorkspaceCoreLifecycle;
        // };
      };
      moon: {
        runWorkspace: {
          insType: RunWorkspaceMoonLifecycle;
          staticType: typeof RunWorkspaceMoonLifecycle;
        };
      };
      exec: {
        runWorkspace: {
          insType: RunWorkspaceExecLifecycle;
          staticType: typeof RunWorkspaceExecLifecycle;
        };
        // runProject: {
        //   insType: RunProjectNodeLifecycle;
        //   staticType: typeof RunProjectNodeLifecycle;
        // };
      };
    }
  }
}

export {
  InitialiseWorkspaceCoreLifecycle,
  // ConfigureWorkspaceCoreLifecycle,
  RunWorkspaceMoonLifecycle,
  RunWorkspaceExecLifecycle,
  // RunProjectNodeLifecycle,
};
// export { ConfigureWorkspaceLifecycle, InitialiseWorkspaceLifecycle };
