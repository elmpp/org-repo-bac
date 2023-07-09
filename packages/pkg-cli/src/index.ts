import "@business-as-code/core";
import "@business-as-code/plugin-core-essentials";
import "@business-as-code/plugin-core-git";
import "@business-as-code/plugin-core-package-manager-pnpm";
import "@business-as-code/plugin-core-package-manager-yarn";
import "@business-as-code/plugin-dev-changesets";

// if (process.env.NODE_ENV === 'development') {
  //   import "@business-as-code/plugin-dev-tests";
  //   import "@business-as-code/plugin-dev-changesets";
  //   import "@business-as-code/plugin-dev-essentials";
// }

// all plugins must be imported here
declare global {
  namespace Bac {
    interface Services {
    }
    interface Lifecycles {
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
//           staticType: CliService;
//         };
//       };
//     };
//   }
// }

// class CliService {}

export {};
