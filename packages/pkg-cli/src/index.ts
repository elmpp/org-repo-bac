import "@business-as-code/plugin-core-essentials";
import "@business-as-code/plugin-core-scaffold";

// all plugins must be imported here
declare global {
  namespace Bac {
    interface Services {
    }
  }
}



// declare global {
//   interface Bac {

//     '@business-as-code/cli': {
//       // interface Services {
//       //   myService: {
//       //     // config: typeof MyService
//       //   }
//       // }
//       services: {
//         // myService: {
//         //   // config: typeof MyService
//         // }
//       }

//     }
//   }
// }



// declare global {
//   interface Bac {
//     "@business-as-code/cli": {
//       services: {
//         cliService: {
//           // plugin: "@business-as-code/plugin-core-essentials";
//           insType: typeof CliService;
//           clzType: CliService;
//         };
//       };
//     };
//   }
// }

// class CliService {}

export {};
