import {
  ContextCommand,
  Flags,
  LogLevel,
  ServiceInitialiseCommonOptions,
  ServiceInitialiseOptions,
  Services,
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
        expectTypeOf<Services>().toMatchTypeOf<{
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
        expectTypeOf<Services>().not.toMatchTypeOf<{
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
      expectTypeOf<Pick<ParserOutputType['flags'], 'logLevel'>>().toEqualTypeOf<{logLevel: LogLevel | undefined}>(); // we keep the required nullishness as we use ParserOutput inside Commands as well as outside-in
      expectTypeOf<Pick<ParserOutputType['flags'], 'json'>>().toEqualTypeOf<{json: boolean | undefined}>(); // json is a base type, not derived from baseFlags in BaseCommand - vscode://eamodio.gitlens/link/r/deb373f5256b936edc18b2f0d0353a1f590bb9ff?url=git%40github.com%3Aelmpp%2Forg-repo-bac.git
    });
  });
});
