
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

  get ctor(): typeof YourService {
    return this.constructor as unknown as typeof YourService;
  }
  get title(): (typeof YourService)['title'] {
    return (this.constructor as any).title as unknown as (typeof YourService)['title']
  }

  constructor(protected options: ServiceInitialiseCommonOptions) {

  }


  static staticFunc1() {

  }
  async func1() {

  }
}