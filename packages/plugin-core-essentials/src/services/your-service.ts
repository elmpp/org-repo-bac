
// declare global {
//   interface Bac {
//     "@business-as-code/plugin-core-essentials": {
//       services: {
//         // yourService: {
//         //   // plugin: "@business-as-code/plugin-core-essentials";
//         //   insType: typeof YourService;
//         //   clzType: YourService;
//         // };
//         yourService: YourService;
//       };
//     };
//   }
// }

import { ServiceInitialiseOptions } from "@business-as-code/core";

declare global {
  namespace Bac {
    interface Services {
      yourService: {
        insType: YourService;
        clzType: typeof YourService;
      },
    }
  }
}
// declare global {
//   interface BacServices {
//     yourService: YourService;

//   }
// }


export class YourService {
  static title = 'yourService'
  static async initialise(options: ServiceInitialiseOptions) {
    return new YourService(options)
  }

  constructor(protected options: ServiceInitialiseOptions) {

  }


  static staticFunc1() {

  }
  async func1() {

  }
}