import type { ContextCommand, ContextPrivate, Services } from "@business-as-code/core";
import { expectTypeOf } from "expect-type";

describe("types", () => {
  describe("main types", () => {
    it("services", () => {
      expectTypeOf<Services>().toMatchTypeOf<{ // instance side
        myService: {
          somethingelse: Function
        };
        yourService: {
          somethingelse: Function
        };
        schematicsService: {
          somethingelse: Function
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
    });
    it("context", () => {
      expectTypeOf<ContextCommand>().toMatchTypeOf<{
        /** @oclif/main#ParserOutput */
        cliOptions: {
          args: any;
          argv: any;
          raw: any;
          metadata: any;
          nonExistentFlags: any;
        };
        services: Services
      }>();
    });
    it("contextPrivate", () => {
      expectTypeOf<ContextPrivate>().toMatchTypeOf<{
        /** @oclif/main#ParserOutput */
        cliOptions: {
          args: any;
          argv: any;
          raw: any;
          metadata: any;
          nonExistentFlags: any;
        };
      }>();
    });
  });
});
