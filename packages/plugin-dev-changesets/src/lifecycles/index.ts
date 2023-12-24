import { SynchroniseWorkspaceSnapshotDevLifecycle } from './synchronise-workspace-snapshot-dev-lifecycle'

declare global {
  namespace Bac {
    interface Lifecycles {
      // snapshotDev: {
      //   synchroniseWorkspace: {
      //     insType: SynchroniseWorkspaceSnapshotDevLifecycle;
      //     staticType: typeof SynchroniseWorkspaceSnapshotDevLifecycle;
      //   };
      // };
    }
  }
}

export { SynchroniseWorkspaceSnapshotDevLifecycle }
