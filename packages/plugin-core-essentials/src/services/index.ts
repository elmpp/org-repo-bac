import { ServiceStaticInterface } from '@business-as-code/core'
import {MyService} from './my-service'
import {YourService} from './your-service'

// declare global {
//   interface Bac {
//     "@business-as-code/plugin-core-essentials": {
//       services: typeof services
//     };
//   }
// }

export const services: ServiceStaticInterface[] = [MyService, YourService]
