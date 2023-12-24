import('@business-as-code/cli')

// export {}

// declare global {

//   /**
//    namespace Bac {
//       namespace '@business-as-code/cli' {
//         interface Services {
//            myService: {
//              config: typeof MyService
//            }
//         }
//       }
//    }
//    */
//   namespace Bac {
//     services: {

//     },
//   }
// }

declare global {
  namespace Bac {
    interface Services {}
    interface Lifecycles {}
    // interface ConfigProjectSource {

    // }
    // interface Projects {

    // }
    // interface InitialiseWorkspaceHook {
    // }
    // interface InitialiseProjectHook {
    // }
  }
}
