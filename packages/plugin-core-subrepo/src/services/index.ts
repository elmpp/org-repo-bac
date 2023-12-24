import { ServiceStaticInterface } from '@business-as-code/core'
import { SubrepoService } from './subrepo-service'

// declare global {
//   interface Bac {
//     "@business-as-code/plugin-core-essentials": {
//       services: typeof services
//     };
//   }
// }

export const services: ServiceStaticInterface[] = [SubrepoService]
