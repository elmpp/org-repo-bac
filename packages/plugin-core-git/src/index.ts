import { Plugin } from '@business-as-code/core'
import { GitService } from './services/git-service'

// declare global {
//   interface Bac {
//     "@business-as-code/plugin-core-essentials": {
//       services: typeof services
//     };
//   }
// }

// export const services: ServiceStaticInterface[] = [GitService]

export const plugin = {
  services: [GitService],
  lifecycles: [
    // InitialiseWorkspaceLifecycle,
  ],
  // initialise: ({context}) => {

  // },
} satisfies Plugin
