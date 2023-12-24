import { Plugin } from '@business-as-code/core'
import { PackageManagerYarnService } from './services/package-manager-yarn-service'
// import { RunWorkspacePackageManagerYarnLifecycle } from "./lifecycles";

export const plugin = {
  services: [PackageManagerYarnService]
  // lifecycles: [RunWorkspacePackageManagerYarnLifecycle],
} satisfies Plugin
