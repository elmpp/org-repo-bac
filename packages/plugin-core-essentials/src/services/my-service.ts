
// declare global {
//   interface Bac {
//     "@business-as-code/plugin-core-essentials": {
//       services: {
//         myService: {
//           // plugin: "@business-as-code/plugin-core-essentials";
//           insType: typeof MyService;
//           clzType: MyService;
//         };
//       };
//     };
//   }
// }

import { ContextPrivate } from "@business-as-code/core";

declare global {
  namespace Bac {
    interface Services {
      myService: {
        insType: MyService;
        clzType: typeof MyService;
      },
    }
  }
  // export interface BacServices {
  //   myService: MyService;
  // }
}

export class MyService {
  static title = 'myService'
  static async initialise(options: ContextPrivate) {
    return new MyService()
  }

  static something() {

  }
  async somethingelse() {

  }
}