import { AddressPathAbsolute } from "@business-as-code/address";
import type { ContextCommand, ServiceInitialiseCommonOptions, ServiceInitialiseOptions, Services } from "@business-as-code/core";
import { expectTypeOf } from "expect-type";

describe("types", () => {
  describe("main types", () => {
    describe("services", () => {
      it('integrity', () => {
        expectTypeOf<Services>().toMatchTypeOf<{ // instance side
          myService: {
            func1: Function
          };
          yourService: {
            func1: Function
          };
          schematics: {
            runSchematic: Function
          };
          bac: {
            run: Function
          };
          git: {
            getRepository: Function
          };
        }>();
        expectTypeOf<Services>().not.toMatchTypeOf<{ // not the static side
          myService: {
            title: string
            initialise: Function
          };
          yourService: {
            title: string
            initialise: Function
          };
        }>();
      })
      it('service options', () => {
        type SchematicInitialiseOptions = ServiceInitialiseOptions<'schematics'>
        type BacInitialiseOptions = ServiceInitialiseOptions<'bac'>

        expectTypeOf<SchematicInitialiseOptions>().toMatchTypeOf<ServiceInitialiseCommonOptions>()
        expectTypeOf<SchematicInitialiseOptions>().toMatchTypeOf<{dryRun?: boolean}>()

        expectTypeOf<BacInitialiseOptions>().toMatchTypeOf<ServiceInitialiseCommonOptions>()
        expectTypeOf<BacInitialiseOptions>().toMatchTypeOf<{workspacePath: AddressPathAbsolute}>()
      })
    });
    describe('contexts', () => {
      it("contextCommand", () => {
        expectTypeOf<ContextCommand<any>>().toMatchTypeOf<{
          /** @oclif/main#ParserOutput */
          cliOptions: {
            args: any;
            flags: {
              ['log-level']: string, // base flags
            };
            argv: any;
            raw: any;
            metadata: any;
            nonExistentFlags: any;
          };
          serviceFactory: Function
          logger: {
            debug: Function
          },
          oclifConfig: object
          workspacePath: object
        }>();
      });
      it("context", () => {
        expectTypeOf<ContextCommand<any>>().toMatchTypeOf<{
          /** @oclif/main#ParserOutput */
          cliOptions: {
            flags: {
              ['log-level']: string, // base flags
            }
          };
          serviceFactory: Function
          logger: {
            debug: Function
          },
          oclifConfig: object
          workspacePath: object
        }>();
      });
    })
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
});
