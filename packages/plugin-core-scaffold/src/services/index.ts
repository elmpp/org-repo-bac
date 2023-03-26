import { ServiceStaticInterface } from '@business-as-code/core'
import {SchematicsService} from './schematics-service'

// declare global {
//   interface Bac {
//     "@business-as-code/plugin-core-essentials": {
//       services: typeof services
//     };
//   }
// }

export const services: ServiceStaticInterface[] = [SchematicsService]
