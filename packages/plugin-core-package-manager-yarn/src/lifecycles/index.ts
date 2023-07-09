import { RunWorkspacePackageManagerYarnLifecycle } from "./run-workspace-package-manager-yarn-lifecycle";

/** we must define them in one place due to augmentation limitations */
declare global {
  namespace Bac {
    interface Lifecycles {
      packageManagerYarn: {
        as: 'packageManager';
        runWorkspace: {
          insType: RunWorkspacePackageManagerYarnLifecycle;
          staticType: typeof RunWorkspacePackageManagerYarnLifecycle;
        };
      };
    }
  }
}

export {
  RunWorkspacePackageManagerYarnLifecycle,
};
