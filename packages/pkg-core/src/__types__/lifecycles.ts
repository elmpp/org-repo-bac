import { AddressPathAbsolute } from "@business-as-code/address";
import { Context, ContextCommand } from ".";
import {
  IsEmptyObject,
  SafeGet,
  Simplify,
  UnionToIntersection,
  UnwrapPromise,
  ValueOf,
} from "./util";

/** instance types of all loaded services */

// export type Lifecycles<
//   LName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = {
//   [PluginName in keyof Bac.Lifecycles[LName]]: Bac.Lifecycles[LName][PluginName];
// [PluginName in keyof Bac.Lifecycles[LName]]: {
//   // [LName in keyof Bac.Lifecycles[LName][PluginName]]: Bac.Lifecycles[PluginName][LName];
//   // [LName in keyof Lifecycles[PluginName]]: Bac.Lifecycles[PluginName][LName]["insType"];
// };
// };
// export type Lifecycles = {
//   [PluginName in keyof Bac.Lifecycles]: {
//     [LName in keyof Lifecycles[PluginName]]: Bac.Lifecycles[PluginName][LName];
//     // [LName in keyof Lifecycles[PluginName]]: Bac.Lifecycles[PluginName][LName]["insType"];
//   };
// };

// type D1 = Lifecycles<'initialiseWorkspace'>

// /** instance types of all loaded lifecycles */
// export type LifecyclesStatic = {
//   [LName in keyof Bac.Lifecycles]: Bac.Lifecycles[LName]["staticType"];
// };

export type LifecycleInitialiseCommonOptions = {
  context: Context;
  /** lifecycle instances are recreated when targeting different directories */
  workspacePath: AddressPathAbsolute;
  /** relative path that is joined to destinationPath. Useful for cwd() of clients, e.g. git, pwd */
  workingPath: string;
};

// export type LifecycleInitialiseOptions<LName extends keyof Lifecycles> =
//   Parameters<LifecyclesStatic[LName]["initialise"]>[0];

// export type LifecycleInitialiseLiteOptions<LName extends keyof Lifecycles> =
//   Omit<Parameters<LifecyclesStatic[LName]["initialise"]>[0], "workspacePath">; // workspacePath found inside the context

export type LifecycleStaticInterface = {
  lifecycleTitle: string; // the lifecycle title; e.g. 'initialiseWorkspace'
  title: string; // the implementation title; e.g. 'core', 'github' etc
  as?: string; // allows aliasing to another title, e.g. packageManagerPnpm -> packageManager
  /** the initialise method will be defined on the base and set up tapable with any implemented lifecycle methods; @internal*/
  initialise: (options: { context: ContextCommand<any> }) => void;
  /** the tapable hooks. @internal */
  hooks: Record<string, unknown>;
};

/** gives a map of implementations for a particular method of a lifecycle */
// export type LifecycleMethodMap<LName> = {
//   [LProvider in keyof Bac.Lifecycles as Bac.Lifecycles[LProvider] extends unknown
//     ? LProvider
//     : never]: {
//     [AnLName in keyof Bac.Lifecycles[LProvider] as Extract<
//       Bac.Lifecycles[LProvider][AnLName],
//       LName
//     > extends never
//       ? never
//       : AnLName]: Bac.Lifecycles[LProvider][AnLName];
//   };
// };
// export type LifecycleMethodMap<LName extends keyof Bac.Lifecycles> = {
//   [MName in keyof Bac.Lifecycles[LName] as Bac.Lifecycles[LName][MName] extends (
//     ...args: any[]
//   ) => any
//     ? ReturnType<Bac.Lifecycles[LName][MName]> extends void
//       ? never
//       : MName
//     : never]: Bac.Lifecycles[LName][MName] extends (...args: any[]) => any ? UnwrapPromise<ReturnType<Exclude<ReturnType<Bac.Lifecycles[LName][MName]>, void>>> : never;
// };
// export type LifecycleMethodMap<LName extends keyof Lifecycles> = {
//   [AMName in keyof Lifecycles[LName] as Lifecycles[LName][AMName] extends (
//     ...args: any
//   ) => unknown
//     ? ReturnType<Lifecycles[LName][AMName]> extends void
//       ? never
//       : AMName
//     : never]: Lifecycles[LName][AMName] extends (...args: any) => any ? UnwrapPromise<ReturnType<Exclude<ReturnType<Lifecycles[LName][AMName]>, void>>> : never;
// };

// type DDD1 = Bac.Lifecycles['git']
// type DDD2 = Bac.Lifecycles['core']
// type DDD3 = keyof UnionToIntersection<Bac.Lifecycles[keyof Bac.Lifecycles]>
// type DDD4 = LifecycleStaticMap["configureWorkspace"];
// type DDD5 = LifecycleStaticMap["initialiseWorkspace"];
// type DDD6 = LifecycleMap["configureWorkspace"];
// type DDD7 = LifecycleMap["initialiseWorkspace"];
// type DDD5 = keyof UnionToIntersection<Bac.Lifecycles[keyof Bac.Lifecycles]>
// type DDD = keyof ValueOf<Bac.Lifecycles>

// type LifecycleInsType4<LMethod extends keyof _LifecycleMethodMap, LProvider extends keyof Bac.Lifecycles = keyof Bac.Lifecycles> = Pick<Bac.Lifecycles, LProvider>
// type LifecycleInsType4<LMethod extends keyof _LifecycleMethodMap, LProvider extends keyof Bac.Lifecycles = keyof Bac.Lifecycles> = {
//   [ALProvider in keyof Pick<Bac.Lifecycles, LProvider>]: {
//     beforeConfigureWorkspace: LifecycleInsType<'beforeConfigureWorkspace', ALProvider>
//     configureWorkspace: LifecycleInsType<'configureWorkspace', ALProvider>
//     afterConfigureWorkspace: LifecycleInsType<'afterConfigureWorkspace', ALProvider>
//     beforeInitialiseWorkspace: LifecycleInsType<'beforeInitialiseWorkspace', ALProvider>
//     initialiseWorkspace: LifecycleInsType<'initialiseWorkspace', ALProvider>
//     afterInitialiseWorkspace: LifecycleInsType<'afterInitialiseWorkspace', ALProvider>
//   }
// }

// type BBB = UnionToIntersection<Bac.Lifecycles[keyof Bac.Lifecycles]> extends {
//   initialiseWorkspace: any;
// }
//   ? Extract<
//       Bac.Lifecycles[keyof Bac.Lifecycles],
//       { initialiseWorkspace: any }
//     >["initialiseWorkspace"]["insType"]
//   : never;

// /** MUST be kept up to date with lifecycle base classes. Also need to add new lifecycles within BaseCommand#setupContext */
type LifecycleMap<
  LProvider extends keyof BacLifecyclesNormalised = keyof BacLifecyclesNormalised
> =
  // ExcludeMatchingProperties<
  {
    initialiseWorkspace: UnionToIntersection<
      BacLifecyclesNormalised[LProvider]
    > extends {
      initialiseWorkspace: any;
    }
      ? Pick<
          Extract<
            BacLifecyclesNormalised[LProvider],
            { initialiseWorkspace: any }
          >["initialiseWorkspace"]["insType"],
          "initialiseWorkspace"
        >
      : never;
    configureWorkspace: UnionToIntersection<
      BacLifecyclesNormalised[LProvider]
    > extends {
      configureWorkspace: any;
    }
      ? Pick<
          Extract<
            BacLifecyclesNormalised[LProvider],
            { configureWorkspace: any }
          >["configureWorkspace"]["insType"],
          "configureWorkspace"
        >
      : never;
    configureProject: UnionToIntersection<
      BacLifecyclesNormalised[LProvider]
    > extends {
      configureProject: any;
    }
      ? Pick<
          Extract<
            BacLifecyclesNormalised[LProvider],
            { configureProject: any }
          >["configureProject"]["insType"],
          "configureProject"
        >
      : never;
    synchroniseWorkspace: UnionToIntersection<
      BacLifecyclesNormalised[LProvider]
    > extends {
      synchroniseWorkspace: any;
    }
      ? Pick<
          Extract<
            BacLifecyclesNormalised[LProvider],
            { synchroniseWorkspace: any }
          >["synchroniseWorkspace"]["insType"],
          "synchroniseWorkspace"
        >
      : never;
    runWorkspace: UnionToIntersection<
      BacLifecyclesNormalised[LProvider]
    > extends {
      runWorkspace: any;
    }
      ? Pick<
          Extract<
            BacLifecyclesNormalised[LProvider],
            { runWorkspace: any }
          >["runWorkspace"]["insType"],
          "runWorkspace"
        >
      : never;
    runProject: UnionToIntersection<
      BacLifecyclesNormalised[LProvider]
    > extends {
      runProject: any;
    }
      ? Pick<
          Extract<
            BacLifecyclesNormalised[LProvider],
            { runProject: any }
          >["runProject"]["insType"],
          "runProject"
        >
      : never;
  };
//   never
// >;

type LifecycleReturnsByProviderMap = {
  [ALMethod in _LifecycleAllMethods]: {
    [ALProvider in _LifecycleAllProviders]: {
      provider: ALProvider;
      res: LifecycleMethodType<ALMethod, ALProvider> extends never
        ? never
        : LifecycleReturnType<LifecycleMethodType<ALMethod, ALProvider>>;
      _method?: ALMethod;
    };
  };
};
type LifecycleOptionsByProviderMap = {
  [ALMethod in _LifecycleAllMethods]: {
    [ALProvider in _LifecycleAllProviders]: {
      provider: ALProvider;
      _method?: ALMethod;
      options: LifecycleMethodType<ALMethod, ALProvider> extends never
        ? never
        : LifecycleOptionsType<LifecycleMethodType<ALMethod, ALProvider>>;
    };
  };
};
type LifecycleOptionsWithoutCommonByProviderMap = {
  [ALMethod in _LifecycleAllMethods]: {
    [ALProvider in _LifecycleAllProviders]: {
      provider: ALProvider;
      _method?: ALMethod;
      options: LifecycleMethodType<ALMethod, ALProvider> extends never
        ? never
        : LifecycleOptionsType<LifecycleMethodType<ALMethod, ALProvider>>['options'];
    };
  };
};

// just the options.options
// type LifecycleOptionsByProviderMap = {
//   [ALMethod in _LifecycleAllMethods]: {
//     [ALProvider in _LifecycleAllProviders]: {
//       provider: ALProvider;
//       options: LifecycleMethodType<ALMethod, ALProvider> extends never
//         ? never
//         : LifecycleOptionsType<LifecycleMethodType<ALMethod, ALProvider>>;
//       _method?: ALMethod;
//     };
//   };
// };

// export type _LifecycleOptionsByMethodMinusComplex<T extends {provider: string, options: {context: Context}}> = Omit<T, 'options'> & {options: Omit<T['options'], 'context'>}

/** Full mapped result. Returned from hook.map (when all options are called) */
export type LifecycleMappedReturnByMethod<
LMethod extends LifecycleMethods = LifecycleMethods
> = Array<Exclude<
ValueOf<LifecycleReturnsByProviderMap[LMethod]>,
// ValueOf<LifecycleReturnsByProviderMap[LMethod]>,
{ res: never }
>>;
/** a singular result. Returned from hook.callBail (when first positive provider shortcircuits the other options) */
export type LifecycleSingularReturnByMethod<
  LMethod extends LifecycleMethods = LifecycleMethods
> = Exclude<
  ValueOf<LifecycleReturnsByProviderMap[LMethod]>,
  // ValueOf<LifecycleReturnsByProviderMap[LMethod]>,
  { res: never }
>;
export type LifecycleSingularReturnByMethodAndProvider<
  LMethod extends LifecycleMethods = LifecycleMethods,
  LProvider extends _LifecycleAllProviders = _LifecycleAllProviders
> = Extract<
  Exclude<ValueOf<LifecycleReturnsByProviderMap[LMethod]>, { options: never }>,
  { provider: LProvider }
>;

/** a union of method options that are keyed by provider. Suitable for calling Bail hook types - https://tinyurl.com/2deua67q */
export type LifecycleOptionsByMethodKeyedByProvider<
  LMethod extends LifecycleMethods = LifecycleMethods
> = Exclude<
  ValueOf<LifecycleOptionsByProviderMap[LMethod]>,
  { options: never }
>;
export type LifecycleOptionsByMethodKeyedByProviderWithoutCommon<
  LMethod extends LifecycleMethods = LifecycleMethods
> = Extract<Exclude<
  ValueOf<LifecycleOptionsWithoutCommonByProviderMap[LMethod]>,
  { options: never }
>, {options: any}>;
export type LifecycleOptionsByMethodKeyedByProviderArray<
  LMethod extends LifecycleMethods = LifecycleMethods
> = Exclude<
  ValueOf<LifecycleOptionsByProviderMap[LMethod]>,
  { options: never }
> extends never
  ? never
  : Exclude<
      ValueOf<LifecycleOptionsByProviderMap[LMethod]>,
      { options: never }
    >[];
/** a specific options object for a provider method. Suitable for lifecycles with a single provider */
export type LifecycleOptionsByMethodAndProvider<
  LMethod extends LifecycleMethods = LifecycleMethods,
  LProvider extends _LifecycleAllProviders = _LifecycleAllProviders
> = SafeGet<
  Extract<
    Exclude<
      ValueOf<LifecycleOptionsByProviderMap[LMethod]>,
      { options: never }
    >,
    { provider: LProvider }
  >,
  "options"
>;
export type LifecycleMethods = _LifecycleAllMethods;
export type LifecycleProviders = _LifecycleAllProviders;
export type LifecycleImplementedMethods = NonNullable<
  Exclude<
    ValueOf<LifecycleOptionsByProviderMap[LifecycleMethods]>,
    { options: never }
  >["_method"]
>;

// type PPP = Simplify<Bac.Lifecycles>
// export type LifecycleProvidersForAsByMethod<LMethod extends _LifecycleAllMethods, LProviderAs extends LifecycleProviders> = LifecycleReturnsByMethodAndProvider<LMethod, LProviderAs>
// type LifecycleProvidersForAsByMethod<LMethod extends _LifecycleAllMethods, LProviderAs extends LifecycleProviders> = Extract<ValueOf<Bac.Lifecycles>, {as: LProviderAs}>
export type LifecycleProvidersForAsByMethod<
  LProviderAs extends LifecycleProviders
> = keyof {
  [LProvider in keyof Bac.Lifecycles as Bac.Lifecycles[LProvider] extends {
    as: LProviderAs;
  }
    ? LProvider
    : never]: unknown;
};
// type YAAA = Bac.Lifecycles['']
// type DDDD = LifecycleProvidersForAsByMethod<'runWorkspace', 'packageManager'>
// type BBB = ValueOf<LifecycleOptionsByProviderMap[LifecycleMethods]>

// type NBNB = LifecycleReturnsByProviderMap["initialiseWorkspace"];
// type Dbbb1 = LifecycleMethodType<"initialiseWorkspace", "core">;
// type Dbbb2 = LifecycleReturnType<Dbbb1>;
// type Dbbb11 = LifecycleMethodType<"initialiseWorkspace", _LifecycleAllProviders>;
// type Dbbb22 = LifecycleReturnType<Dbbb11>;
// type Dbbb3 = LifecycleMethodType<"beforeConfigureWorkspace", "core">;
// type Dbbb4 = LifecycleReturnType<Dbbb3>;
// type Dbbb5 = LifecycleMethodType<"configureWorkspace">;
// type Dbbb6 = LifecycleReturnType<Dbbb3>;

// type HHH = LifecycleReturnsByProviderMap['initialiseWorkspace'][_LifecycleAllProviders]
// type HHH2 = LifecycleOptionsByProviderMap['initialiseWorkspace'][_LifecycleAllProviders]

type LifecycleReturnType<
  T extends () => ((...args: any[]) => any) | undefined
> = UnwrapPromise<ReturnType<NonNullable<ReturnType<T>>>>;
type LifecycleOptionsType<
  T extends () => ((...args: any[]) => any) | undefined
> = "options" extends keyof Parameters<NonNullable<ReturnType<T>>>[0]
  ? true extends IsEmptyObject<
      Parameters<NonNullable<ReturnType<T>>>[0]["options"]
    >
    ? Record<string, never>
    : Parameters<NonNullable<ReturnType<T>>>[0] // note that we omit the complex common types
  : // : Parameters<ReturnType<T>>[0]["options"]
    Record<string, never>; // we use the convention of providers needing their tapable options through .options

type BacLifecyclesNormalised = {
  [LProvider in keyof Bac.Lifecycles as Bac.Lifecycles[LProvider] extends {
    as: any;
  }
    ? Bac.Lifecycles[LProvider]["as"]
    : LProvider]: Omit<
    {
      [LMethod in keyof Bac.Lifecycles[LProvider]]: Bac.Lifecycles[LProvider][LMethod];
    },
    "as"
  >;
};

// type AAAA = BacLifecyclesNormalised['packageManager']

type LifecycleMethodType<
  LMethod extends _LifecycleAllMethods,
  LProvider extends _LifecycleAllProviders = _LifecycleAllProviders
> = LMethod extends keyof BacLifecyclesNormalised[LProvider]
  ? "insType" extends keyof BacLifecyclesNormalised[LProvider][LMethod]
    ? LMethod extends keyof BacLifecyclesNormalised[LProvider][LMethod]["insType"]
      ? BacLifecyclesNormalised[LProvider][LMethod]["insType"][LMethod] extends () =>
          | ((...args: any) => any)
          | undefined
        ? BacLifecyclesNormalised[LProvider][LMethod]["insType"][LMethod]
        : never
      : never
    : never
  : never;

// type NNN = LifecycleMethodType<'runWorkspace', 'packageManager'>
// type UUU = NonNullable<BacLifecyclesNormalised['packageManager']['runWorkspace']['insType']['runWorkspace']>
// type LifecycleMethodType<
//   LMethod extends _LifecycleAllMethods,
//   LProvider extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = LMethod extends keyof Bac.Lifecycles[LProvider]
//   ? "insType" extends keyof Bac.Lifecycles[LProvider][LMethod]
//     ? LMethod extends keyof Bac.Lifecycles[LProvider][LMethod]["insType"]
//       ? Bac.Lifecycles[LProvider][LMethod]["insType"][LMethod] extends () => (
//           ...args: any
//         ) => any
//         ? Bac.Lifecycles[LProvider][LMethod]["insType"][LMethod]
//         : never
//       : never
//     : never
//   : never;
// type LifecycleInsType<
//   LMethod extends _LifecycleAllMethods,
//   LProvider extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = LMethod extends keyof Bac.Lifecycles[LProvider]
//   ? "insType" extends keyof Bac.Lifecycles[LProvider][LMethod]
//     ? Bac.Lifecycles[LProvider][LMethod]["insType"]
//     : never
//   : never;
// type LifecycleStaticType<
//   LMethod extends _LifecycleAllMethods,
//   LProvider extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = LMethod extends keyof Bac.Lifecycles[LProvider]
//   ? "staticType" extends keyof Bac.Lifecycles[LProvider][LMethod]
//     ? Bac.Lifecycles[LProvider][LMethod]["staticType"]
//     : never
//   : never;
// type VV = keyof InitialiseWorkspaceLifecycle;
// type HHH = keyof Simplify<
//   UnionToIntersection<ValueOf<LifecycleMap<keyof Bac.Lifecycles>>>
// >;

type _LifecycleAllMethods = Simplify<
  keyof LifecycleMap<keyof BacLifecyclesNormalised>
>;
type _LifecycleAllProviders = keyof {
  [LMethod in keyof BacLifecyclesNormalised as BacLifecyclesNormalised[LMethod] extends {
    as: any;
  }
    ? BacLifecyclesNormalised[LMethod]["as"]
    : LMethod]: unknown;
};
// type _LifecycleAllProviders = Simplify<keyof Bac.Lifecycles>;

// // type _LifecycleMethodMap<LProvider extends keyof Bac.Lifecycles = keyof Bac.Lifecycles> = UnionToIntersection<ValueOf<
// //   LifecycleMap<LProvider>
// // >>;
// // type _LifecycleProviderMap =
// export type LifecycleMethodInsMap = {
//   beforeConfigureWorkspace: LifecycleInsType<"beforeConfigureWorkspace">;
//   configureWorkspace: LifecycleInsType<"configureWorkspace">;
//   afterConfigureWorkspace: LifecycleInsType<"afterConfigureWorkspace">;
//   beforeInitialiseWorkspace: LifecycleInsType<"beforeInitialiseWorkspace">;
//   initialiseWorkspace: LifecycleInsType<"initialiseWorkspace">;
//   afterInitialiseWorkspace: LifecycleInsType<"afterInitialiseWorkspace">;
// };
// export type LifecycleMethodStaticMap = {
//   beforeConfigureWorkspace: LifecycleStaticType<"beforeConfigureWorkspace">;
//   configureWorkspace: LifecycleStaticType<"configureWorkspace">;
//   afterConfigureWorkspace: LifecycleStaticType<"afterConfigureWorkspace">;
//   beforeInitialiseWorkspace: LifecycleStaticType<"beforeInitialiseWorkspace">;
//   initialiseWorkspace: LifecycleStaticType<"initialiseWorkspace">;
//   afterInitialiseWorkspace: LifecycleStaticType<"afterInitialiseWorkspace">;
// };
// export type LifecycleMethodProviderReturnsMap = {
//   beforeConfigureWorkspace: LifecycleInsType<"beforeConfigureWorkspace">["beforeConfigureWorkspace"];
//   configureWorkspace: LifecycleInsType<"configureWorkspace">["configureWorkspace"];
//   afterConfigureWorkspace: LifecycleInsType<"afterConfigureWorkspace">["afterConfigureWorkspace"];
//   beforeInitialiseWorkspace: LifecycleInsType<"beforeInitialiseWorkspace">["beforeInitialiseWorkspace"];
//   initialiseWorkspace: LifecycleInsType<"initialiseWorkspace">["initialiseWorkspace"];
//   afterInitialiseWorkspace: LifecycleInsType<"afterInitialiseWorkspace">["afterInitialiseWorkspace"];
// };

// type OOOOIns = LifecycleMethodInsMap["initialiseWorkspace"];
// type OOOOStatic = LifecycleMethodStaticMap["initialiseWorkspace"]["title"];
// type OOOOMethodProvider =
//   LifecycleMethodProviderReturnsMap["initialiseWorkspace"];

// expectTypeOf<
//   keyof LifecycleMethodInsMap
// >().toEqualTypeOf<_LifecycleAllMethods>();
// expectTypeOf<
//   keyof LifecycleMethodStaticMap
// >().toEqualTypeOf<_LifecycleAllMethods>();

// // /** MUST be kept up to date with lifecycle base classes */
// export type LifecycleMap<
//   LProvider extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = {
//   configureWorkspace: Omit<
//     Extract<
//       Bac.Lifecycles[LProvider],
//       { configureWorkspace: any }
//     >["configureWorkspace"]["insType"],
//     "ctor"
//   >;
//   initialiseWorkspace: Omit<
//     Extract<
//       Bac.Lifecycles[LProvider],
//       { initialiseWorkspace: any }
//     >["initialiseWorkspace"]["insType"],
//     "ctor"
//   >;
// };
// // export type LifecycleOptionsByProvider<
// //   LMethod extends keyof LifecycleMethodInsMap = keyof LifecycleMethodInsMap
// // > = {
// //   [LProvider in keyof Bac.Lifecycles]: {};
// //   // configureWorkspace: Omit<Extract<Bac.Lifecycles[LProvider], {configureWorkspace: any}>['configureWorkspace']['insType'], 'ctor'>
// //   // initialiseWorkspace: Omit<Extract<Bac.Lifecycles[LProvider], {initialiseWorkspace: any}>['initialiseWorkspace']['insType'], 'ctor'>
// // };

// // export type LifecycleMethodMap<LProvider extends keyof Bac.Lifecycles = keyof Bac.Lifecycles> = UnionToIntersection<ValueOf<
// //   LifecycleMap<LProvider>
// // >>;

// /** MUST be kept up to date with lifecycle base classes */
// export type LifecycleStaticMap<
//   LProvider extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = {
//   configureWorkspace: Extract<
//     Bac.Lifecycles[LProvider],
//     { configureWorkspace: any }
//   >["configureWorkspace"]["staticType"];
//   initialiseWorkspace: Extract<
//     Bac.Lifecycles[LProvider],
//     { initialiseWorkspace: any }
//   >["initialiseWorkspace"]["staticType"];
// };
// export type LifecycleMethods = Exclude<
//   keyof UnionToIntersection<
//     ValueOf<UnionToIntersection<ValueOf<Bac.Lifecycles>>>["insType"]
//   >,
//   "ctor"
// >;
// // export type LifecycleMethods = ValueOf<{
// //   [LName in keyof LifecycleMap]: Exclude<ValueOf<{
// //     [MName in keyof LifecycleMap[LName]]: MName;
// //   }>, 'ctor'>;
// // }>;

// // type _LifecycleImplementations<LName extends keyof LifecycleMap> = {
// //   [LProvider in keyof Bac.Lifecycles as Bac.Lifecycles[LProvider] extends unknown
// //   ? LProvider
// //   : never]: {
// //   [AnLName in keyof Bac.Lifecycles[LProvider] as AnLName extends LName
// //     ? AnLName
// //     : never]: Bac.Lifecycles[LProvider][LName];
// // };
// // }

// // type _LifecycleImplementations = {
// //   [LProvider in keyof Bac.Lifecycles]: {
// //     [LName in keyof Bac.Lifecycles[LProvider]]: Bac.Lifecycles[LProvider][LName] extends {insType: unknown} ? {
// //         [LMethod in keyof Bac.Lifecycles[LProvider][LName]['insType'] as Bac.Lifecycles[LProvider][LName]['insType'][LMethod] extends () => (...args: any[]) => any ? LMethod : never]: Bac.Lifecycles[LProvider][LName]['insType'][LMethod]
// //     } : never
// //   }
// // }
// // type _LifecycleImplementations = {
// //   [LProvider in keyof Bac.Lifecycles]: {
// //     [LName in keyof Bac.Lifecycles[LProvider]]: Bac.Lifecycles[LProvider][LName] extends {insType: unknown} ? {
// //         [LMethod in keyof Bac.Lifecycles[LProvider][LName]['insType']]: Bac.Lifecycles[LProvider][LName]['insType'][LMethod] extends (...args: any) => any ?
// //         (...args: any) => void extends ReturnType<Bac.Lifecycles[LProvider][LName]['insType'][LMethod]> ? never : Bac.Lifecycles[LProvider][LName]['insType'][LMethod]
// //         : never
// //       } : never
// //         // [InsType in keyof Bac.Lifecycles[LProvider][LName] as Bac.Lifecycles[LProvider][LName] extends {insType: unknown} ? InsType : never]: {
// //         //   [LMethod in keyof Bac.Lifecycles[LProvider][LName]['insType']]: {

// //         //   }
// //         // }
// //         // // [MName in keyof Bac.Lifecycles[LProvider][AnLName] as LMethod extends MName ? MName : never]: number
// //         // [MName in keyof Bac.Lifecycles[LProvider][AnLName] as LMethod extends MName ? MName : never]: Bac.Lifecycles[LProvider][AnLName]
// //       };
// //   }
// // type _LifecycleImplementations = {
// //   [LProvider in keyof Bac.Lifecycles]: {
// //     [LName in keyof Bac.Lifecycles[LProvider]]: {
// //         [LMethod in keyof Bac.Lifecycles[LProvider][LName]['insType']]
// //         // [MName in keyof Bac.Lifecycles[LProvider][AnLName] as LMethod extends MName ? MName : never]: number
// //         [MName in keyof Bac.Lifecycles[LProvider][AnLName] as LMethod extends MName ? MName : never]: Bac.Lifecycles[LProvider][AnLName]
// //       };
// //   }
// // }

// type _LifecycleMethodImplementations<LMethod extends LifecycleMethods> = {
//   [LProvider in keyof Bac.Lifecycles]: {
//     [AnLName in keyof Bac.Lifecycles[LProvider]]: {
//       // [MName in keyof Bac.Lifecycles[LProvider][AnLName] as LMethod extends MName ? MName : never]: number
//       [MName in keyof Bac.Lifecycles[LProvider][AnLName] as LMethod extends MName
//         ? MName
//         : never]: Bac.Lifecycles[LProvider][AnLName];
//     };
//   };
// };

// // type DDD00 = Bac.Lifecycles['@business-as-code/plugin-core-essentials']['initialiseWorkspace']['insType']['initialiseWorkspace']
// // type DDD01 = Bac.Lifecycles['@business-as-code/plugin-core-essentials']['initialiseWorkspace']['insType']['beforeInitialiseWorkspace']
// // type DDD1 = Bac.Lifecycles[keyof Bac.Lifecycles][keyof LifecycleMap]['insType']['initialiseWorkspace']
// // type DDD2 = Exclude<Bac.Lifecycles[keyof Bac.Lifecycles][keyof LifecycleMap]['insType']['initialiseWorkspace'], () => void>

// // // type KK = _LifecycleImplementations<'initialiseWorkspace'>
// // type KKK = _LifecycleMethodImplementations<'initialiseWorkspace'>

// /** the .title property of all implementations of a lifecycle method */
// export type LifecycleProviders<LMethod extends LifecycleMethods> = ValueOf<{
//   [LProvider in keyof Bac.Lifecycles]: ValueOf<{
//     [LName in keyof Bac.Lifecycles[LProvider]]: Bac.Lifecycles[LProvider][LName] extends {
//       insType: unknown;
//     }
//       ? ValueOf<{
//           [AnLMethod in keyof Bac.Lifecycles[LProvider][LName]["insType"] as AnLMethod extends LMethod
//             ? Bac.Lifecycles[LProvider][LName]["insType"][AnLMethod] extends () => (
//                 ...args: any[]
//               ) => any
//               ? AnLMethod
//               : never
//             : never]: LProvider;
//         }>
//       : never;
//   }>;
// }>;

// export type LifecycleMethodReturn<LMethod extends keyof LifecycleMethodInsMap> =
//   UnwrapPromise<
//     // export type LifecycleMethodReturn<LMethod extends keyof LifecycleMethodMap, LProvider extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//     // export type LifecycleMethodReturn<LMethod extends LifecycleMethods, LProvider extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//     ReturnType<
//       Exclude<
//         ReturnType<
//           LifecycleMethodInsMap[LMethod]
//           // LifecycleMethodMap[LMethod]
//           // ValueOf<Bac.Lifecycles>[LMethod]
//           // ValueOf<LifecycleMap>[LMethod]
//           // Bac.Lifecycles[LProvider][keyof LifecycleMap]["insType"][LMethod]
//         >,
//         void
//       >
//     >
//   >;
// export type LifecycleMethodReturnWithProviderKey<
//   LMethod extends keyof LifecycleMethodInsMap
// > = UnwrapPromise<
//   // export type LifecycleMethodReturn<LMethod extends keyof LifecycleMethodMap, LProvider extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//   // export type LifecycleMethodReturn<LMethod extends LifecycleMethods, LProvider extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//   ReturnType<
//     Exclude<
//       ReturnType<
//         LifecycleMethodInsMap[LMethod]
//         // LifecycleMethodMap[LMethod]
//         // ValueOf<Bac.Lifecycles>[LMethod]
//         // ValueOf<LifecycleMap>[LMethod]
//         // Bac.Lifecycles[LProvider][keyof LifecycleMap]["insType"][LMethod]
//       >,
//       void
//     >
//   >
// >;

// export type LifecycleMethodOptions<
//   LMethod extends keyof LifecycleMethodInsMap
// > = UnwrapPromise<
//   // export type LifecycleMethodReturn<LMethod extends keyof LifecycleMethodMap, LProvider extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//   // export type LifecycleMethodReturn<LMethod extends LifecycleMethods, LProvider extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//   Parameters<
//     Exclude<
//       ReturnType<
//         LifecycleMethodInsMap[LMethod]
//         // LifecycleMethodMap[LMethod]
//         // ValueOf<Bac.Lifecycles>[LMethod]
//         // ValueOf<LifecycleMap>[LMethod]
//         // Bac.Lifecycles[LProvider][keyof LifecycleMap]["insType"][LMethod]
//       >,
//       void
//     >
//   >[0]
// >;

// type DDDD = LifecycleMethodMap['initialiseWorkspace']
// type DDDD2 = keyof LifecycleMethodMap

// type D1 = GetReturnTypes<'initialiseWorkspace'>
// type D2 = GetReturnTypes<'beforeInitialiseWorkspace'>
// type D3 = GetReturnTypes<'afterInitialiseWorkspace'>

// type DD = Simplify<keyof Bac.Lifecycles>
// type MapInitialiseWorkspace = LifecycleMethodMap<'initialiseWorkspace'>
// type D = Simplify<LifecycleMethodMap<>>

// type InitialiseWorkspaceInitialiseReturns = MapInitialiseWorkspace['']
