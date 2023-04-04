import type { ContextCommand, Services } from "@business-as-code/core";
import { expectTypeOf } from "expect-type";

describe("types", () => {
  describe("main types", () => {
    it("services", () => {
      expectTypeOf<Services>().toMatchTypeOf<{ // instance side
        myService: {
          func1: Function
        };
        yourService: {
          func1: Function
        };
        schematics: {
          run: Function
        }
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
    });
    it("context", () => {
      expectTypeOf<ContextCommand<any>>().toMatchTypeOf<{
        /** @oclif/main#ParserOutput */
        cliOptions: {
          args: any;
          argv: any;
          raw: any;
          metadata: any;
          nonExistentFlags: any;
        };
        serviceFactory: Function
        logger: Function
        oclifConfig: object
        workspacePath: object
      }>();
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
});
