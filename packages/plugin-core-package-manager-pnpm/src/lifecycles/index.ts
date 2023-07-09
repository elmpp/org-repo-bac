import { RunWorkspacePackageManagerPnpmLifecycle } from "./run-workspace-package-manager-pnpm-lifecycle";

/** we must define them in one place due to augmentation limitations */
declare global {
  namespace Bac {
    interface Lifecycles {
      packageManagerPnpm: {
        as: 'packageManager';
        runWorkspace: {
          insType: RunWorkspacePackageManagerPnpmLifecycle;
          staticType: typeof RunWorkspacePackageManagerPnpmLifecycle;
        };
      };
    }
  }
}

export {
  RunWorkspacePackageManagerPnpmLifecycle,
};
