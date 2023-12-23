import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  ConfigureWorkspaceLifecycleBase,
  Config,
  ConfigProjectConfig,
} from "@business-as-code/core";

export class ConfigureWorkspaceCoreLifecycle extends ConfigureWorkspaceLifecycleBase<
  typeof ConfigureWorkspaceCoreLifecycle
> {
  static override title = "core" as const;

  // override get ctor(): typeof ConfigureWorkspaceLifecycle {
  //   return this.constructor as any;
  // }

  /**
   * Atm, let's not implement the provider-specific configuration lifecyles and
   * just expand the initialised configs to a configured form.
   */
  override afterConfigureWorkspace(): (options: {
    common: {
      context: Context;
      workspacePath: AddressPathAbsolute;
    },
    // workingPath: string;
    // config: Config;
    options: {
      // poo: 'a'
      configuredConfig: ConfigProjectConfig
    },
  }) => Promise<{

    // a: "a";
  }> {
    return async ({ common: {context}, options: {configuredConfig} }) => {

    // // this is the outputs of the configure providers but in a LifecycleOptionsByMethodKeyedByProviderWithoutCommon format
    // const configuredConfig = configuredConfig.res.map((c) => {
    //   expectIsOk(c.res)
    //   return {
    //     provider: c.provider,
    //     options: {
    //       ...c.res.res,
    //     },
    //   };
    // }) as LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<'configureWorkspace'>;
    // await xfs.writeFileSync(
    //   addr.pathUtils.join(
    //     workspacePath,
    //     addr.parsePath(constants.RC_FOLDER),
    //     addr.parsePath(constants.RC_CONFIGURED_FILENAME)
    //   ).address,
    //   formatUtils.JSONStringify(configuredConfig, true),
    //   "utf-8"
    // );



      return {
        // a: "a",
      };
    };
  }
}

// type DDD = Bac.Lifecycles['configureWorkspace']['insType']['configureWorkspace']
