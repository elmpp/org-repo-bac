import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  LifecycleMethods,
  LifecycleOptionsByMethodKeyedByProviderArray,
  LifecycleOptionsByMethodKeyedByProviderSingular,
  LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray,
  LifecycleOptionsByMethodKeyedByProviderWithoutCommonSingular,
} from "../../__types__";

export const mapLifecycleOptionsByMethodKeyedByProviderWithoutCommon = <
  // LMethod extends LifecycleImplementedMethods
  LMethod extends LifecycleMethods
>(options: {
  common: {
    context: Context;
    workspacePath: AddressPathAbsolute;
  };
  options: LifecycleOptionsByMethodKeyedByProviderWithoutCommonSingular<LMethod>;
}): LifecycleOptionsByMethodKeyedByProviderSingular<LMethod> => {
  return {
    // ...options.common,
    ...options.options,
    options: {
      // ...options.options.options,
      // ...options.options,
      ...options.common,
      // @ts-ignore
      options: options.options.options,
    },
  } as LifecycleOptionsByMethodKeyedByProviderSingular<LMethod>;
};

export const mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray = <
  // LMethod extends LifecycleImplementedMethods
  LMethod extends LifecycleMethods
>(options: {
  common: {
    context: Context;
    workspacePath: AddressPathAbsolute;
  };
  options: LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<LMethod>;
}): LifecycleOptionsByMethodKeyedByProviderArray<LMethod> => {
  return options.options.map((anOptions) =>
    mapLifecycleOptionsByMethodKeyedByProviderWithoutCommon({
      common: options.common,
      options: anOptions,
    })
  ) as LifecycleOptionsByMethodKeyedByProviderArray<LMethod>;
};
