import { Plugin } from '@business-as-code/core'
import { PackageManagerBunService } from './services/package-manager-bun-service'
import {
  RunWorkspacePackageManagerBunLifecycle,
} from "./lifecycles";

export const plugin = {
  services: [PackageManagerBunService],
  lifecycles: [
    RunWorkspacePackageManagerBunLifecycle,
  ],
} satisfies Plugin
