
// declare global {
//   interface Bac {
//     "@business-as-code/plugin-core-essentials": {
//       services: {
//         // yourService: {
//         //   // plugin: "@business-as-code/plugin-core-essentials";
//         //   insType: typeof YourService;
//         //   staticType: YourService;
//         // };
//         yourService: YourService;
//       };
//     };
//   }
// }

import { ServiceInitialiseCommonOptions } from "@business-as-code/core";

declare global {
  namespace Bac {
    interface Services {
      yourService: {
        insType: YourService;
        staticType: typeof YourService;
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
  static title = 'yourService' as const
  static async initialise(options: ServiceInitialiseCommonOptions) {
    return new YourService(options)
  }

  constructor(protected options: ServiceInitialiseCommonOptions) {

  }


  static staticFunc1() {

  }
  async func1() {

  }
}