import { Plugin } from '@business-as-code/core'
import { PackageManagerPnpmService } from './services/package-manager-pnpm-service'
// import {
//   RunWorkspacePackageManagerPnpmLifecycle,
// } from "./lifecycles";

export const plugin = {
  services: [PackageManagerPnpmService]
  // lifecycles: [
  //   RunWorkspacePackageManagerPnpmLifecycle,
  // ],
} satisfies Plugin
