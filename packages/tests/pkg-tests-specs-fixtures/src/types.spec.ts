import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  ContextCommand,
  Flags,
  LifecycleImplementedMethods,
  LifecycleOptionsByMethodKeyedByProvider,
  LifecycleOptionsByMethodKeyedByProviderArray,
  LifecycleOptionsByMethodAndProvider,
  LifecycleProvidersForAsByMethod,
  LifecycleReturnsByMethod,
  LifecycleReturnsByMethodAndProvider,
  // LifecycleMap,
  // LifecycleMethodOptions,
  // LifecycleMethodReturn,
  // LifecycleMethodReturnWithProviderKey,
  // LifecycleMethods,
  // LifecycleProviders,
  // LifecycleStaticMap,
  LogLevel,
  ServiceInitialiseCommonOptions,
  ServiceInitialiseOptions,
  ServiceMap,
  Simplify,
  LifecycleMethods,
  LifecycleOptionsByMethodKeyedByProviderWithoutCommon,
} from "@business-as-code/core";
import {
  ArgsInfer,
  BaseCommand,
  FlagsInfer,
} from "@business-as-code/core/commands/base-command";
import { ParserOutput } from "@oclif/core/lib/interfaces/parser";
import { expectTypeOf } from "expect-type";

describe("types", () => {
  describe("main types", () => {
    describe("services", () => {
      it("DEBUG", () => {
        // @ts-ignore
        type AllServices = keyof ServiceMap
      })
      it("integrity", () => {
        expectTypeOf<ServiceMap>().toMatchTypeOf<{
          // instance side
          myService: [{
            func1: Function;
          }];
          yourService: [{
            func1: Function;
          }];
          schematics: [{
            runSchematic: Function;
          }];
          bac: [{
            run: Function;
          }];
          git: [{
            getRepository: Function;
          }];
        }>();
        expectTypeOf<ServiceMap>().not.toMatchTypeOf<{
          // not the static side
          myService: {
            title: string;
            initialise: Function;
          };
          yourService: {
            title: string;
            initialise: Function;
          };
        }>();
      });
      it(`supports 'as' to group service types`, () => {
        type PackageManager = ServiceMap['packageManager']
        expectTypeOf<PackageManager>().toMatchTypeOf<[{
            title: 'packageManagerPnpm',
        } | {
          title: 'packageManagerYarn',
        }]>()
      })
      it("service options", () => {
        type SchematicInitialiseOptions =
          ServiceInitialiseOptions<"schematics">;
        type BacInitialiseOptions = ServiceInitialiseOptions<"bac">;

        expectTypeOf<SchematicInitialiseOptions>().toMatchTypeOf<ServiceInitialiseCommonOptions>();
        expectTypeOf<SchematicInitialiseOptions>().toMatchTypeOf<{
          dryRun?: boolean;
        }>();

        expectTypeOf<BacInitialiseOptions>().toMatchTypeOf<ServiceInitialiseCommonOptions>();
        // expectTypeOf<BacInitialiseOptions>().toMatchTypeOf<{workspacePath: AddressPathAbsolute}>()
      });
    });

    describe("lifecycles", () => {
      // it("integrity", () => {
      //   expectTypeOf<LifecycleMap>().toMatchTypeOf<{
      //     // instance side
      //     initialiseWorkspace: unknown,
      //   }>();

      //   expectTypeOf<LifecycleStaticMap>().toMatchTypeOf<{
      //     // static side
      //     initialiseWorkspace: {
      //       lifecycleTitle: 'initialiseWorkspace', // the Base should carry its lifecycle name always
      //     },
      //   }>();
      // });
      // it('ensure all augmentations are keyed by their correct .title and .title is a const', () => {
      //   type LNames = Simplify<keyof Bac.Lifecycles>
      //   type LTitles = ValueOf<LifecycleStaticMap>['title']
      //   type MismatchedProviders = Exclude<LNames, LTitles>
      //   expectTypeOf<MismatchedProviders>().toBeNever()
      // })
      // it("find all lifecycle methods", () => {
      //   expectTypeOf<LifecycleMethods>().not.toEqualTypeOf<string>()
      //   // expectTypeOf<InitialiseWorkspaceReturn>().not.toBeAny()
      //   expectTypeOf<'beforeInitialiseWorkspace' | 'initialiseWorkspace' | 'afterInitialiseWorkspace'>().toMatchTypeOf<LifecycleMethods>()
      // });
      // it("find all providers for a lifecycle method", () => {
      //   // type InitialiseWorkspaceInitialiseMethodMap =
      //   type Providers = LifecycleProviders<'initialiseWorkspace'>
      //   expectTypeOf<Providers>().toEqualTypeOf<'core' | 'git'>() // initialiseWorkspace only handled by core
      // });
      // it("know when there are no providers for a lifecycle method", () => {
      //   // type InitialiseWorkspaceInitialiseMethodMap =
      //   type Providers = LifecycleProviders<'beforeInitialiseWorkspace'>
      //   expectTypeOf<Providers>().toBeNever() // initialiseWorkspace only handled by core
      // });
      // it("can derive a union of lifecycle method return types", () => {
      //   // type InitialiseWorkspaceInitialiseMethodMap =
      //   type InitialiseWorkspaceReturn = LifecycleMethodReturn<'initialiseWorkspace'>
      //   expectTypeOf<InitialiseWorkspaceReturn>().not.toBeAny()
      //   expectTypeOf<InitialiseWorkspaceReturn>().toMatchTypeOf<{a: 'a'} | {b: 'b'}>()
      // });
      // it("can derive a union of lifecycle method option types", () => {
      //   // type InitialiseWorkspaceInitialiseMethodMap =
      //   type InitialiseWorkspaceOptions = LifecycleMethodOptions<'initialiseWorkspace'>
      //   expectTypeOf<InitialiseWorkspaceOptions>().not.toBeAny()
      //   expectTypeOf<InitialiseWorkspaceOptions>().toMatchTypeOf<{
      //     context: any,
      //     workspacePath: AddressPathAbsolute,
      //     workingPath: string,
      //     config?: any,
      //   }>()
      // });

      it("DEBUG", () => {
        // @ts-expect-error:
        type ALLKeys = Simplify<keyof Bac.Lifecycles>
        // @ts-expect-error:
        type ALLImplemented = LifecycleImplementedMethods
      })

      it("can derive a union of lifecycle method return types with provider key", () => {
        // type InitialiseWorkspaceInitialiseMethodMap =
        type InitialiseWorkspaceReturn =
          LifecycleReturnsByMethod<"initialiseWorkspace">;
        expectTypeOf<InitialiseWorkspaceReturn>().not.toBeAny();
        expectTypeOf<InitialiseWorkspaceReturn>().toMatchTypeOf<
          | { provider: "core"; res: { } }
          | { provider: "git"; res: { b: "b" } }
        >();
      });
      it("can derive a union of lifecycle option types with provider key without common options (context+workspacePath)", () => {
        // type InitialiseWorkspaceInitialiseMethodMap =
        type InitialiseWorkspaceOptions =
        LifecycleOptionsByMethodKeyedByProviderWithoutCommon<"initialiseWorkspace">;
        expectTypeOf<InitialiseWorkspaceOptions>().not.toBeAny();
        expectTypeOf<InitialiseWorkspaceOptions>().toMatchTypeOf<
          | { provider: "core"; options: any }
        >();
        expectTypeOf<InitialiseWorkspaceOptions>().not.toMatchTypeOf<
          | { provider: "core"; options: { options: any } }
        >();

        type AllProviders =
          LifecycleOptionsByMethodKeyedByProvider<LifecycleImplementedMethods>;
        type NonImplementers = Extract<AllProviders, { options: never }>;
        expectTypeOf<NonImplementers>().toBeNever();

        expectTypeOf<keyof AllProviders>().toEqualTypeOf<
          "options" | "provider" | "_method"
        >();
        expectTypeOf<AllProviders["options"]>().toMatchTypeOf<{}>();
        expectTypeOf<AllProviders["options"]>().not.toBeAny();

        expectTypeOf<AllProviders['options']>().toMatchTypeOf<{
          context: any
          workspacePath: AddressPathAbsolute
        }>() // all provider methods have these 3 properties
        expectTypeOf<AllProviders['options']>().not.toMatchTypeOf<{
          workingPath: string
        }>() // workingPath should be within options.options as specific
      });
      it("can derive a union of lifecycle option types with provider key 1", () => {
        // type InitialiseWorkspaceInitialiseMethodMap =
        type InitialiseWorkspaceOptions =
          LifecycleOptionsByMethodKeyedByProvider<"initialiseWorkspace">;
        expectTypeOf<InitialiseWorkspaceOptions>().not.toBeAny();
        expectTypeOf<InitialiseWorkspaceOptions>().toMatchTypeOf<
          | { provider: "core"; options: { options: any } }
          | { provider: "git"; options: { options: any } }
        >();

        type AllProviders =
          LifecycleOptionsByMethodKeyedByProvider<LifecycleImplementedMethods>;
        type NonImplementers = Extract<AllProviders, { options: never }>;
        expectTypeOf<NonImplementers>().toBeNever();

        expectTypeOf<keyof AllProviders>().toEqualTypeOf<
          "options" | "provider" | "_method"
        >();
        expectTypeOf<AllProviders["options"]>().toMatchTypeOf<{}>();
        expectTypeOf<AllProviders["options"]>().not.toBeAny();

        expectTypeOf<AllProviders['options']>().toMatchTypeOf<{
          context: any
          workspacePath: AddressPathAbsolute
        }>() // all provider methods have these 3 properties
        expectTypeOf<AllProviders['options']>().not.toMatchTypeOf<{
          workingPath: string
        }>() // workingPath should be within options.options as specific
      });
      it("can derive a union of lifecycle option types with provider key 2", () => {
        // type InitialiseWorkspaceInitialiseMethodMap =
        type Options =
          LifecycleOptionsByMethodKeyedByProvider<"runWorkspace">;
        expectTypeOf<Options>().not.toBeAny();

        // @ts-expect-error: no unused locals
        type MoonOptions = Extract<Options, {provider: 'moon'}>
        // @ts-expect-error: no unused locals
        type MoonOptionsOptions = Extract<Options, {provider: 'moon'}>['options']
        type MoonOptionsOptionsOptions = Extract<Options, {provider: 'moon'}>['options']['options']
        // @ts-expect-error: no unused locals
        type NodeOptions = Extract<Options, {provider: 'node'}>
        // type NodeOptionsOptions = Extract<Options, {provider: 'node'}>['options']
        type NodeOptionsOptionsOptions = Extract<Options, {provider: 'node'}>['options']['options']

        expectTypeOf<MoonOptionsOptionsOptions>().toMatchTypeOf<{
          query?: string
        }>()

        expectTypeOf<NodeOptionsOptionsOptions>().toMatchTypeOf<{
          execOptions: any
        }>()
        // expectTypeOf<NodeOptionsOptions>().not.toMatchTypeOf<{
        //   workingPath: string // only on runProject
        // }>()

        expectTypeOf<Options>().toMatchTypeOf<
          | { provider: "moon"; options: { options: {query?: string} } } // options should be specific to provider
          | { provider: "node"; options: { options: {execOptions: any} } } // options should be specific to provider
          | { provider: "packageManager"; options: { options: any } }
        >();
      });
      it(`accepts LifecycleAllMethods`, () => {
        const anyLifecycleMethod: LifecycleMethods = 'configureProject'
        // @ts-expect-error: no unused locals
        type ReturnType = LifecycleReturnsByMethod<typeof anyLifecycleMethod>
      })
      it("can derive a union of lifecycle option types with provider key 3", () => {

        type Options = LifecycleOptionsByMethodKeyedByProvider<LifecycleImplementedMethods> // used in the hooks; e.g. callLifecycleBailAsync
        expectTypeOf<Options>().not.toBeAny();
        type OptionsProviders = Options['provider']

        expectTypeOf<OptionsProviders>().toMatchTypeOf<'packageManager'>
        expectTypeOf<OptionsProviders>().not.toMatchTypeOf<'packageManagerPnpm'>
      });
      // it("can derive a union of lifecycle option types with the complex common properties removed", () => {

      //   type Options = _LifecycleOptionsByMethodMinusComplex<LifecycleOptionsByMethodKeyedByProvider<'initialiseWorkspace'>> // e.g. async AsyncHook#callLifecycleBailAsync
      //   expectTypeOf<Options>().not.toBeAny();
      //   expectTypeOf<Options>().not.toEqualTypeOf<never>();

      //   type OptionsOptions = Options['options']

      //   expectTypeOf<OptionsOptions>().not.toMatchTypeOf<{context: any}>() // has removed the options.context complex input format
      //   expectTypeOf<OptionsOptions>().toMatchTypeOf<{
      //     workingPath: string
      //     options: unknown
      //   }>() // leaves other options intact
      // });
      it("can derive a union of lifecycle option types in an array form", () => {

        const aLifecycleMethodNotImplemented: LifecycleMethods = 'configureProject' // ensures we still have a non-implemented lifecycle (to test the AsyncHook)
        expectTypeOf(aLifecycleMethodNotImplemented).not.toMatchTypeOf<LifecycleImplementedMethods>()

        type Options1 = LifecycleOptionsByMethodKeyedByProviderArray<typeof aLifecycleMethodNotImplemented> // e.g. async AsyncHook#callLifecycleBailAsync
        expectTypeOf<Options1>().not.toBeAny();
        expectTypeOf<Options1>().toEqualTypeOf<never>();

        const aLifecycleMethodImplemented: LifecycleMethods = 'initialiseWorkspace'
        expectTypeOf(aLifecycleMethodImplemented).toMatchTypeOf<LifecycleImplementedMethods>()

        type Options2 = LifecycleOptionsByMethodKeyedByProviderArray<typeof aLifecycleMethodImplemented> // e.g. async AsyncHook#callLifecycleBailAsync
        expectTypeOf<Options2>().not.toBeAny();
        expectTypeOf<Options2>().not.toEqualTypeOf<never>();
      });
      it(`supports 'as' to group lifecycle types`, () => {
        type PackageManagerOptions = LifecycleOptionsByMethodAndProvider<'runWorkspace', 'packageManager'>
        expectTypeOf<PackageManagerOptions>().toMatchTypeOf<{ // note how options are same for both grouped option types
            options: {
              command: string;
              filter?: string;
            }
        }>()

        type PackageManagerReturn = LifecycleReturnsByMethodAndProvider<'runWorkspace', 'packageManager'>
        expectTypeOf<PackageManagerReturn>().toMatchTypeOf<{ // note how options are same for both grouped option types
            provider: 'packageManager',
            res: unknown,
            _method?: 'runWorkspace' | undefined
        }>()
      })
      it(`can find the provider names based on the 'as' property`, () => {
        type PackageManagerProviders = LifecycleProvidersForAsByMethod<'packageManager'>
        expectTypeOf<PackageManagerProviders>().toMatchTypeOf<'packageManagerPnpm' | 'packageManagerYarn'>()
      })
      it("find particular lifecycle method return", () => {
        // type InitialiseWorkspaceInitialiseMethodMap =
        type InitialiseWorkspaceCoreOptions =
          LifecycleOptionsByMethodAndProvider<"initialiseWorkspace", 'core'>;
        expectTypeOf<InitialiseWorkspaceCoreOptions>().not.toBeAny();
        expectTypeOf<InitialiseWorkspaceCoreOptions>().toMatchTypeOf<
          {options: any}
        >();
        expectTypeOf<InitialiseWorkspaceCoreOptions>().not.toMatchTypeOf<
          | { provider: "core"; options: { options: any } }
          | { provider: "git"; options: { options: any } }
        >();
      });
      it(`find particular lifecycle method return for 'as' methods`, () => {
        // type InitialiseWorkspaceInitialiseMethodMap =
        type Options =
          LifecycleOptionsByMethodAndProvider<"runWorkspace", 'packageManager'>;
        expectTypeOf<Options>().not.toBeAny();
        expectTypeOf<Options>().toMatchTypeOf<
          {options: any}
        >();
        expectTypeOf<Options>().toMatchTypeOf<
          {options: any}
        >();

        // expectTypeOf<InitialiseWorkspaceCoreOptions>().not.toMatchTypeOf<
        //   | { provider: "core"; options: { options: any } }
        //   | { provider: "git"; options: { options: any } }
        // >();
      });
      // it("find particular lifecycle method return", () => {
      //   type InitialiseWorkspaceReturn = LifecycleMethodReturn<'initialiseWorkspace', 'git'>
      //   expectTypeOf<InitialiseWorkspaceReturn>().not.toBeAny()
      //   expectTypeOf<InitialiseWorkspaceReturn>().toMatchTypeOf<{b: 'b'}>()
      //   // type InitialiseWorkspaceInitialiseMethodMap =
      // });

      // it("service options", () => {
      //   type SchematicInitialiseOptions =
      //     ServiceInitialiseOptions<"schematics">;
      //   type BacInitialiseOptions = ServiceInitialiseOptions<"bac">;

      //   expectTypeOf<SchematicInitialiseOptions>().toMatchTypeOf<ServiceInitialiseCommonOptions>();
      //   expectTypeOf<SchematicInitialiseOptions>().toMatchTypeOf<{
      //     dryRun?: boolean;
      //   }>();

      //   expectTypeOf<BacInitialiseOptions>().toMatchTypeOf<ServiceInitialiseCommonOptions>();
      //   // expectTypeOf<BacInitialiseOptions>().toMatchTypeOf<{workspacePath: AddressPathAbsolute}>()
      // });
    });

    describe("contexts", () => {
      it("contextCommand", () => {
        expectTypeOf<ContextCommand<any>>().toMatchTypeOf<{
          /** @oclif/main#ParserOutput */
          cliOptions: {
            args: any;
            flags: {
              ["logLevel"]: string; // base flags
            };
            argv: any;
            raw: any;
            metadata: any;
            nonExistentFlags: any;
          };
          serviceFactory: Function;
          logger: {
            debug: Function;
          };
          oclifConfig: object;
          workspacePath: object;
        }>();
      });
      it("context", () => {
        expectTypeOf<ContextCommand<any>>().toMatchTypeOf<{
          /** @oclif/main#ParserOutput */
          cliOptions: {
            flags: {
              ["logLevel"]: string; // base flags
            };
          };
          serviceFactory: Function;
          logger: {
            debug: Function;
          };
          oclifConfig: object;
          workspacePath: object;
        }>();
      });
      it("ContextCommand must be assignable to Context", () => {
        expectTypeOf<ContextCommand<any>>().toMatchTypeOf<Context>(); // Context must be a subset of ContextCommand to enable the commands to use the serviceFactory
      });
    });
    // it("contextPrivate", () => {
    //   expectTypeOf<ContextPrivate>().toMatchTypeOf<{
    //     /** @oclif/main#ParserOutput */
    //     cliOptions: {
    //       args: any;
    //       argv: any;
    //       raw: any;
    //       metadata: any;
    //       nonExistentFlags: any;
    //     };
    //   }>();
    // });
  });

  describe("utils", () => {
    it("commands", () => {
      class CommandWithCustom extends BaseCommand<typeof CommandWithCustom> {
        static override flags = {
          stringFlag: Flags.string({
            description: "Workspace name",
            required: true,
          }),
        };

        /** THIS IS HOW TO DEFINE CUSTOM OPTIONS!! */
        static override baseFlags = {
          ...BaseCommand.baseFlags,
          customOptions: Flags.custom<Record<string, unknown>>({
            parse: async (...args: any[]) => ({ a: 5 } as any),
            // multiple: true,
            // summary: "Schematic ",
            // helpGroup: "GLOBAL",
            // required: true,
            default: {},
          })(),
        };
        async execute() {
          return "blah" as any;
        }
      }

      type FlagsInferred = FlagsInfer<typeof CommandWithCustom>;
      expectTypeOf<FlagsInferred>().toMatchTypeOf<{
        stringFlag: string;
        customOptions?: Record<string, unknown>;
      }>();

      type ParserOutputType = ParserOutput<
        FlagsInfer<typeof CommandWithCustom>,
        FlagsInfer<typeof CommandWithCustom>,
        ArgsInfer<typeof CommandWithCustom>
      >;
      expectTypeOf<
        Pick<ParserOutputType["flags"], "logLevel">
      >().toEqualTypeOf<{ logLevel: LogLevel | undefined }>(); // we keep the required nullishness as we use ParserOutput inside Commands as well as outside-in
      expectTypeOf<Pick<ParserOutputType["flags"], "json">>().toEqualTypeOf<{
        json: boolean | undefined;
      }>(); // json is a base type, not derived from baseFlags in BaseCommand - vscode://eamodio.gitlens/link/r/deb373f5256b936edc18b2f0d0353a1f590bb9ff?url=git%40github.com%3Aelmpp%2Forg-repo-bac.git
    });
  });
});
