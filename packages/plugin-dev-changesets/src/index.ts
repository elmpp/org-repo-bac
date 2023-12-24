import { Plugin } from '@business-as-code/core'
import { ChangesetService } from './services/changeset-service'
// import { SynchroniseWorkspaceSnapshotDevLifecycle } from "./lifecycles";

export const plugin = {
  services: [ChangesetService],
  lifecycles: []
} satisfies Plugin
