import { RunWorkspacePackageManagerBunLifecycle } from "./run-workspace-package-manager-bun-lifecycle";

/** we must define them in one place due to augmentation limitations */
declare global {
  namespace Bac {
    interface Lifecycles {
      packageManagerBun: {
        as: 'packageManager';
        runWorkspace: {
          insType: RunWorkspacePackageManagerBunLifecycle;
          staticType: typeof RunWorkspacePackageManagerBunLifecycle;
        };
      };
    }
  }
}

export {
  RunWorkspacePackageManagerBunLifecycle,
};
