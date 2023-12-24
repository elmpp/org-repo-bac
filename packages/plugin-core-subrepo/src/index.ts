import { Plugin } from '@business-as-code/core'
// import { GitService } from './services/git-service'
import { services } from './services'
import { ConfigureWorkspaceGitLifecycle } from './lifecycles'
import { FetchContentGitLifecycle } from './lifecycles'
// import {SynchroniseWorkspaceGitLifecycle} from './lifecycles'

// declare global {
//   interface Bac {
//     "@business-as-code/plugin-core-essentials": {
//       services: typeof services
//     };
//   }
// }

// export const services: ServiceStaticInterface[] = [GitService]

export const plugin = {
  services,
  lifecycles: [
    ConfigureWorkspaceGitLifecycle,
    FetchContentGitLifecycle
    // SynchroniseWorkspaceGitLifecycle,
    // InitialiseWorkspaceLifecycle,
  ]
  // initialise: ({context}) => {

  // },
} satisfies Plugin
