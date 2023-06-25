import {
  Context,
  ContextCommand,
  Flags,
  LifecycleImplementedMethods,
  LifecycleOptionsByProvider,
  LifecycleReturnsByProvider,
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
      it("integrity", () => {
        expectTypeOf<ServiceMap>().toMatchTypeOf<{
          // instance side
          myService: {
            func1: Function;
          };
          yourService: {
            func1: Function;
          };
          schematics: {
            runSchematic: Function;
          };
          bac: {
            run: Function;
          };
          git: {
            getRepository: Function;
          };
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
      })

      it("can derive a union of lifecycle method return types with provider key", () => {
        // type InitialiseWorkspaceInitialiseMethodMap =
        type InitialiseWorkspaceReturn =
          LifecycleReturnsByProvider<"initialiseWorkspace">;
        expectTypeOf<InitialiseWorkspaceReturn>().not.toBeAny();
        expectTypeOf<InitialiseWorkspaceReturn>().toMatchTypeOf<
          | { provider: "core"; options: { } }
          | { provider: "git"; options: { b: "b" } }
        >();
      });
      it("can derive a union of lifecycle option types with provider key", () => {
        // type InitialiseWorkspaceInitialiseMethodMap =
        type InitialiseWorkspaceOptions =
          LifecycleOptionsByProvider<"initialiseWorkspace">;
        expectTypeOf<InitialiseWorkspaceOptions>().not.toBeAny();
        expectTypeOf<InitialiseWorkspaceOptions>().toMatchTypeOf<
          | { provider: "core"; options: { } }
          | { provider: "git"; options: { } }
        >();

        type AllProviders =
          LifecycleOptionsByProvider<LifecycleImplementedMethods>;
        type NonImplementers = Extract<AllProviders, { options: never }>;
        expectTypeOf<NonImplementers>().toBeNever();

        expectTypeOf<keyof AllProviders>().toEqualTypeOf<
          "options" | "provider" | "_method"
        >();
        expectTypeOf<AllProviders["options"]>().toMatchTypeOf<{}>();
        expectTypeOf<AllProviders["options"]>().not.toBeAny();
        // expectTypeOf<AllProviders["options"]>().not.toMatchTypeOf<{
        //   eriugheiug: "iwegfoaerfgw";
        // }>();
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
