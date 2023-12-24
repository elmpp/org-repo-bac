import { AddressPathAbsolute } from '@business-as-code/address'
import {
  ConfigConfigured,
  Context,
  ok,
  ServiceMap,
  SynchroniseWorkspaceLifecycleBase
} from '@business-as-code/core'

// declare global {
//   namespace Bac {
//     interface Lifecycles {
//       core: {
//       // ['@business-as-code/plugin-core-essentials']: {
//       synchroniseWorkspace: {
//           insType: SynchroniseWorkspaceLifecycle;
//           staticType: typeof SynchroniseWorkspaceLifecycle;
//         };
//       }
//     }
//   }
// }

export class SynchroniseWorkspaceGitLifecycle extends SynchroniseWorkspaceLifecycleBase<
  typeof SynchroniseWorkspaceGitLifecycle
> {
  static override title = 'SubrepoService' as const

  // override get ctor(): typeof SynchroniseWorkspaceLifecycle {
  //   return this.constructor as any;
  // }

  /**
   Accepts a ConfigConfigured and makes it concrete
   */
  override synchroniseWorkspace(): (options: {
    common: {
      context: Context
      workspacePath: AddressPathAbsolute
    }
    // workingPath: string;
    options: {
      // a: "a";
      // name: string;
      config: ConfigConfigured
      // configPath: string;
      // cliVersion: string;
      // cliRegistry: string;
      // cliPath?: string;
    }
  }) => ReturnType<ServiceMap['schematics'][number]['runSchematic']> {
    return async ({
      common: { context, workspacePath },
      options: { config }
    }) => {
      // const config = await fsUtils.loadConfig(workspacePath);

      // console.log(
      //   `config :>> `,
      //   require("util").inspect(config, {
      //     showHidden: false,
      //     depth: undefined,
      //     colors: true,
      //   })
      // );

      // console.log(`config :>> `, config)

      //

      // const fetchOptions: FetchOptions = {
      //   // cacheService: await testContext.context.serviceFactory("cache", {
      //   //   context: testContext.context,
      //   //   workingPath: ".",
      //   //   workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
      //   //   rootPath: testContext.testEnvVars.workspacePath,
      //   // }),
      //   sourceAddress,
      //   destinationAddress: testContext.testEnvVars.workspacePath,
      // };

      // const fetchLifecycleRes =
      //   await testContext.context.lifecycles.fetchContent.executeFetchContent(
      //     {
      //       common: {
      //         context: testContext.context,
      //         workspacePath: testContext.testEnvVars.workspacePath,
      //       },
      //       options: [
      //         {
      //           provider: "git",
      //           options: fetchOptions,
      //         },
      //       ],
      //     }
      //   );

      return ok({
        destinationPath: workspacePath
      })

      // is the configured config up to date
      // if ()

      // console.log(`context.cliOptions.flags :>> `, context.cliOptions.flags);
      // console.log(`configPath, cliVersion, cliRegistry :>> `, configPath, cliVersion, cliRegistry)

      // return res;
    }
  }
}

// type DDD = Bac.Lifecycles['synchroniseWorkspace']['insType']['synchroniseWorkspace']
