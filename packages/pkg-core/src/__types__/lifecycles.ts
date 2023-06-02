import { AddressPathAbsolute } from "@business-as-code/address";
import { Context, ContextCommand } from ".";
import { IsEmptyObject, Simplify, UnionToIntersection, UnwrapPromise, ValueOf } from "./util";

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
  /** the initialise method will be defined on the base and set up tapable with any implemented lifecycle methods; @internal*/
  initialise: (options: { context: ContextCommand<any> }) => void;
  /** the tapable hooks. @internal */
  hooks: Record<string, unknown>;
};

/** gives a map of implementations for a particular method of a lifecycle */
// export type LifecycleMethodMap<LName> = {
//   [PName in keyof Bac.Lifecycles as Bac.Lifecycles[PName] extends unknown
//     ? PName
//     : never]: {
//     [AnLName in keyof Bac.Lifecycles[PName] as Extract<
//       Bac.Lifecycles[PName][AnLName],
//       LName
//     > extends never
//       ? never
//       : AnLName]: Bac.Lifecycles[PName][AnLName];
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

// type LifecycleInsType4<LMethod extends keyof _LifecycleMethodMap, PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles> = Pick<Bac.Lifecycles, PName>
// type LifecycleInsType4<LMethod extends keyof _LifecycleMethodMap, PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles> = {
//   [APName in keyof Pick<Bac.Lifecycles, PName>]: {
//     beforeConfigureWorkspace: LifecycleInsType<'beforeConfigureWorkspace', APName>
//     configureWorkspace: LifecycleInsType<'configureWorkspace', APName>
//     afterConfigureWorkspace: LifecycleInsType<'afterConfigureWorkspace', APName>
//     beforeInitialiseWorkspace: LifecycleInsType<'beforeInitialiseWorkspace', APName>
//     initialiseWorkspace: LifecycleInsType<'initialiseWorkspace', APName>
//     afterInitialiseWorkspace: LifecycleInsType<'afterInitialiseWorkspace', APName>
//   }
// }

// /** MUST be kept up to date with lifecycle base classes */
type LifecycleMap<
  PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
> = {
  configureWorkspace: Omit<
    Extract<
      Bac.Lifecycles[PName],
      { configureWorkspace: any }
    >["configureWorkspace"]["insType"],
    "ctor"
  >;
  initialiseWorkspace: Omit<
    Extract<
      Bac.Lifecycles[PName],
      { initialiseWorkspace: any }
    >["initialiseWorkspace"]["insType"],
    "ctor"
  >;
};

type LifecycleReturnsByProviderMap = {
  [ALMethod in _LifecycleAllMethods]: {
    [APName in _LifecycleAllProviders]: {
      provider: APName;
      options: LifecycleMethodType<ALMethod, APName> extends never
        ? never
        : LifecycleReturnType<LifecycleMethodType<ALMethod, APName>>;
      _method?: ALMethod
    };
  };
};
type LifecycleOptionsByProviderMap = {
  [ALMethod in _LifecycleAllMethods]: {
    [APName in _LifecycleAllProviders]: {
      provider: APName;
      options: LifecycleMethodType<ALMethod, APName> extends never
        ? never
        : LifecycleOptionsType<LifecycleMethodType<ALMethod, APName>>;
      _method?: ALMethod
    };
  };
};

export type LifecycleReturnsByProvider<LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods> = Exclude<ValueOf<LifecycleReturnsByProviderMap[LMethod]>, {options: never}>
export type LifecycleOptionsByProvider<LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods> = Exclude<ValueOf<LifecycleOptionsByProviderMap[LMethod]>, {options: never}>
export type LifecycleMethods = _LifecycleAllMethods
export type LifecycleImplementedMethods = NonNullable<Exclude<ValueOf<LifecycleOptionsByProviderMap[LifecycleMethods]>, {options: never}>['_method']>

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
  T extends (() => (...args: any[]) => any)
> = UnwrapPromise<ReturnType<ReturnType<T>>>;
type LifecycleOptionsType<
  T extends (() => (...args: any[]) => any)
> = 'options' extends keyof Parameters<ReturnType<T>>[0] ? true extends IsEmptyObject<Parameters<ReturnType<T>>[0]['options']> ? Record<string, never> : Parameters<ReturnType<T>>[0]['options'] : Record<string, never>; // we use the convention of providers needing their tapable options through .options

type LifecycleMethodType<
  LMethod extends _LifecycleAllMethods,
  PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
> = LMethod extends keyof Bac.Lifecycles[PName]
  ? "insType" extends keyof Bac.Lifecycles[PName][LMethod]
    ? LMethod extends keyof Bac.Lifecycles[PName][LMethod]["insType"]
      ? Bac.Lifecycles[PName][LMethod]["insType"][LMethod] extends () => (
          ...args: any
        ) => any
        ? Bac.Lifecycles[PName][LMethod]["insType"][LMethod]
        : never
      : never
    : never
  : never;
// type LifecycleInsType<
//   LMethod extends _LifecycleAllMethods,
//   PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = LMethod extends keyof Bac.Lifecycles[PName]
//   ? "insType" extends keyof Bac.Lifecycles[PName][LMethod]
//     ? Bac.Lifecycles[PName][LMethod]["insType"]
//     : never
//   : never;
// type LifecycleStaticType<
//   LMethod extends _LifecycleAllMethods,
//   PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = LMethod extends keyof Bac.Lifecycles[PName]
//   ? "staticType" extends keyof Bac.Lifecycles[PName][LMethod]
//     ? Bac.Lifecycles[PName][LMethod]["staticType"]
//     : never
//   : never;
type _LifecycleAllMethods = keyof UnionToIntersection<
  ValueOf<LifecycleMap<keyof Bac.Lifecycles>>
>;
type _LifecycleAllProviders = Simplify<keyof Bac.Lifecycles>;

// // type _LifecycleMethodMap<PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles> = UnionToIntersection<ValueOf<
// //   LifecycleMap<PName>
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
//   PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = {
//   configureWorkspace: Omit<
//     Extract<
//       Bac.Lifecycles[PName],
//       { configureWorkspace: any }
//     >["configureWorkspace"]["insType"],
//     "ctor"
//   >;
//   initialiseWorkspace: Omit<
//     Extract<
//       Bac.Lifecycles[PName],
//       { initialiseWorkspace: any }
//     >["initialiseWorkspace"]["insType"],
//     "ctor"
//   >;
// };
// // export type LifecycleOptionsByProvider<
// //   LMethod extends keyof LifecycleMethodInsMap = keyof LifecycleMethodInsMap
// // > = {
// //   [PName in keyof Bac.Lifecycles]: {};
// //   // configureWorkspace: Omit<Extract<Bac.Lifecycles[PName], {configureWorkspace: any}>['configureWorkspace']['insType'], 'ctor'>
// //   // initialiseWorkspace: Omit<Extract<Bac.Lifecycles[PName], {initialiseWorkspace: any}>['initialiseWorkspace']['insType'], 'ctor'>
// // };

// // export type LifecycleMethodMap<PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles> = UnionToIntersection<ValueOf<
// //   LifecycleMap<PName>
// // >>;

// /** MUST be kept up to date with lifecycle base classes */
// export type LifecycleStaticMap<
//   PName extends keyof Bac.Lifecycles = keyof Bac.Lifecycles
// > = {
//   configureWorkspace: Extract<
//     Bac.Lifecycles[PName],
//     { configureWorkspace: any }
//   >["configureWorkspace"]["staticType"];
//   initialiseWorkspace: Extract<
//     Bac.Lifecycles[PName],
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
// //   [PName in keyof Bac.Lifecycles as Bac.Lifecycles[PName] extends unknown
// //   ? PName
// //   : never]: {
// //   [AnLName in keyof Bac.Lifecycles[PName] as AnLName extends LName
// //     ? AnLName
// //     : never]: Bac.Lifecycles[PName][LName];
// // };
// // }

// // type _LifecycleImplementations = {
// //   [PName in keyof Bac.Lifecycles]: {
// //     [LName in keyof Bac.Lifecycles[PName]]: Bac.Lifecycles[PName][LName] extends {insType: unknown} ? {
// //         [LMethod in keyof Bac.Lifecycles[PName][LName]['insType'] as Bac.Lifecycles[PName][LName]['insType'][LMethod] extends () => (...args: any[]) => any ? LMethod : never]: Bac.Lifecycles[PName][LName]['insType'][LMethod]
// //     } : never
// //   }
// // }
// // type _LifecycleImplementations = {
// //   [PName in keyof Bac.Lifecycles]: {
// //     [LName in keyof Bac.Lifecycles[PName]]: Bac.Lifecycles[PName][LName] extends {insType: unknown} ? {
// //         [LMethod in keyof Bac.Lifecycles[PName][LName]['insType']]: Bac.Lifecycles[PName][LName]['insType'][LMethod] extends (...args: any) => any ?
// //         (...args: any) => void extends ReturnType<Bac.Lifecycles[PName][LName]['insType'][LMethod]> ? never : Bac.Lifecycles[PName][LName]['insType'][LMethod]
// //         : never
// //       } : never
// //         // [InsType in keyof Bac.Lifecycles[PName][LName] as Bac.Lifecycles[PName][LName] extends {insType: unknown} ? InsType : never]: {
// //         //   [LMethod in keyof Bac.Lifecycles[PName][LName]['insType']]: {

// //         //   }
// //         // }
// //         // // [MName in keyof Bac.Lifecycles[PName][AnLName] as LMethod extends MName ? MName : never]: number
// //         // [MName in keyof Bac.Lifecycles[PName][AnLName] as LMethod extends MName ? MName : never]: Bac.Lifecycles[PName][AnLName]
// //       };
// //   }
// // type _LifecycleImplementations = {
// //   [PName in keyof Bac.Lifecycles]: {
// //     [LName in keyof Bac.Lifecycles[PName]]: {
// //         [LMethod in keyof Bac.Lifecycles[PName][LName]['insType']]
// //         // [MName in keyof Bac.Lifecycles[PName][AnLName] as LMethod extends MName ? MName : never]: number
// //         [MName in keyof Bac.Lifecycles[PName][AnLName] as LMethod extends MName ? MName : never]: Bac.Lifecycles[PName][AnLName]
// //       };
// //   }
// // }

// type _LifecycleMethodImplementations<LMethod extends LifecycleMethods> = {
//   [PName in keyof Bac.Lifecycles]: {
//     [AnLName in keyof Bac.Lifecycles[PName]]: {
//       // [MName in keyof Bac.Lifecycles[PName][AnLName] as LMethod extends MName ? MName : never]: number
//       [MName in keyof Bac.Lifecycles[PName][AnLName] as LMethod extends MName
//         ? MName
//         : never]: Bac.Lifecycles[PName][AnLName];
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
//   [PName in keyof Bac.Lifecycles]: ValueOf<{
//     [LName in keyof Bac.Lifecycles[PName]]: Bac.Lifecycles[PName][LName] extends {
//       insType: unknown;
//     }
//       ? ValueOf<{
//           [AnLMethod in keyof Bac.Lifecycles[PName][LName]["insType"] as AnLMethod extends LMethod
//             ? Bac.Lifecycles[PName][LName]["insType"][AnLMethod] extends () => (
//                 ...args: any[]
//               ) => any
//               ? AnLMethod
//               : never
//             : never]: PName;
//         }>
//       : never;
//   }>;
// }>;

// export type LifecycleMethodReturn<LMethod extends keyof LifecycleMethodInsMap> =
//   UnwrapPromise<
//     // export type LifecycleMethodReturn<LMethod extends keyof LifecycleMethodMap, PName extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//     // export type LifecycleMethodReturn<LMethod extends LifecycleMethods, PName extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//     ReturnType<
//       Exclude<
//         ReturnType<
//           LifecycleMethodInsMap[LMethod]
//           // LifecycleMethodMap[LMethod]
//           // ValueOf<Bac.Lifecycles>[LMethod]
//           // ValueOf<LifecycleMap>[LMethod]
//           // Bac.Lifecycles[PName][keyof LifecycleMap]["insType"][LMethod]
//         >,
//         void
//       >
//     >
//   >;
// export type LifecycleMethodReturnWithProviderKey<
//   LMethod extends keyof LifecycleMethodInsMap
// > = UnwrapPromise<
//   // export type LifecycleMethodReturn<LMethod extends keyof LifecycleMethodMap, PName extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//   // export type LifecycleMethodReturn<LMethod extends LifecycleMethods, PName extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//   ReturnType<
//     Exclude<
//       ReturnType<
//         LifecycleMethodInsMap[LMethod]
//         // LifecycleMethodMap[LMethod]
//         // ValueOf<Bac.Lifecycles>[LMethod]
//         // ValueOf<LifecycleMap>[LMethod]
//         // Bac.Lifecycles[PName][keyof LifecycleMap]["insType"][LMethod]
//       >,
//       void
//     >
//   >
// >;

// export type LifecycleMethodOptions<
//   LMethod extends keyof LifecycleMethodInsMap
// > = UnwrapPromise<
//   // export type LifecycleMethodReturn<LMethod extends keyof LifecycleMethodMap, PName extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//   // export type LifecycleMethodReturn<LMethod extends LifecycleMethods, PName extends LifecycleProviders<LMethod> = LifecycleProviders<LMethod>> = UnwrapPromise<
//   Parameters<
//     Exclude<
//       ReturnType<
//         LifecycleMethodInsMap[LMethod]
//         // LifecycleMethodMap[LMethod]
//         // ValueOf<Bac.Lifecycles>[LMethod]
//         // ValueOf<LifecycleMap>[LMethod]
//         // Bac.Lifecycles[PName][keyof LifecycleMap]["insType"][LMethod]
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
