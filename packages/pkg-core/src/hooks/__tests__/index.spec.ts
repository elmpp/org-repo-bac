import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { expectTypeOf } from "expect-type";
import { Context, LifecycleReturnsByMethod, Result } from "../../__types__";
import { AsyncHook } from "../index";
import { InferAsyncHookOptions, InferAsyncHookReturn } from "../__types__";

describe("Hook", () => {

  describe.only("callLifecycleBailAsync", () => {
    it("returns tapped return", async () => {
      const hook = new AsyncHook<
        {
          context: Context;
          workspacePath: AddressPathAbsolute;
          workingPath: string;
          options: unknown;
        },
        Result<
          {
            destinationPath: AddressPathAbsolute;
          },
          {
            error: BacError;
          }
        >,
        "runWorkspace"
      >(["options"], "runWorkspace", "beforeRunWorkspace");

      hook.tapAsync("moon", (options: { provider: "moon"; options: any }) => {
        return {
          provider: "moon",
          res: "blah",
        };
      });
      // hook.tapAsync("test2", () => {});
      // hook.tapAsync("test3", () => {}, { before: "test2" });

      expect(hook.taps[0].nameOrProvider).toBe("moon");
      // hook.tapAsync("test4", () => {}, { after: "test3" });
      // expect(hook.taps[2].name).toBe("test4");
      // hook.tap("test5", () => {}, { after: "unknown" });
      // expect(hook.taps[hook.taps.length - 1].name).toBe("test5");

      const res = await hook.callLifecycleBailAsync({
        options: [
        {
          provider: "moon",
          options: {
            context: { logger: { debug: jest.fn() } } as unknown as Context,
            // workingPath: ".",
            workspacePath: addr.parsePath(".") as AddressPathAbsolute,
            options: {
              command: "my command",
              platform: "node",

            },
          },
        },
      ]});

      console.log(`res :>> `, res);
      expect(res).toEqual({
        provider: "moon",
        res: "blah",
      });
      expectTypeOf(res).toEqualTypeOf<
        LifecycleReturnsByMethod<"runWorkspace">
      >();
    });
    it("throws when options do not match tap providers", async () => {
      const hook = new AsyncHook<
        {
          context: Context;
          workspacePath: AddressPathAbsolute;
          workingPath: string;
          options: unknown;
        },
        Result<
          {
            destinationPath: AddressPathAbsolute;
          },
          {
            error: BacError;
          }
        >,
        "runWorkspace"
      >(["options"], "runWorkspace", "beforeRunWorkspace");

      hook.tapAsync("moon", (options: { provider: "moon"; options: any }) => {
        return {
          provider: "moon",
          res: "blah",
        };
      });
      // hook.tapAsync("test2", () => {});
      // hook.tapAsync("test3", () => {}, { before: "test2" });

      expect(hook.taps[0].nameOrProvider).toBe("moon");
      // hook.tapAsync("test4", () => {}, { after: "test3" });
      // expect(hook.taps[2].name).toBe("test4");
      // hook.tap("test5", () => {}, { after: "unknown" });
      // expect(hook.taps[hook.taps.length - 1].name).toBe("test5");

      await expect(
        hook.callLifecycleBailAsync({options: [
          {
            // @ts-expect-error:
            provider: "notMoon",
            options: {
              context: { logger: { debug: jest.fn() } } as unknown as Context,
              // workingPath: ".",
              workspacePath: addr.parsePath(".") as AddressPathAbsolute,
              options: {
                command: "my command",
                platform: "node",
              },
            },
          },
        ]})
      ).rejects.toThrowError();
    });
    it("can be inferred", async () => {
      type Options = {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: {a: 'a'};
      };
      type Return = Result<
        {
          destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError;
        }
      >;
      const hook = new AsyncHook<Options, Return, "runWorkspace">(
        ["options"],
        "runWorkspace",
        "beforeRunWorkspace" // name
      );

      type InferredOptions = InferAsyncHookOptions<typeof hook>;
      type InferredReturn = InferAsyncHookReturn<typeof hook>;

      expectTypeOf<InferredOptions>().toEqualTypeOf<Options>;
      expectTypeOf<InferredReturn>().toEqualTypeOf<Return>;
    });
  });
});

describe("AsyncHook", () => {
  // it("create", () => {
  //   expect(() => new AsyncHook()).not.toThrow();
  //   expect(() => new AsyncHook(["hi"], "hello")).not.toThrow();
  //   expect(new AsyncHook(["hi", "there"], "hello").name).toBe(
  //     `async hello(hi, there)`
  //   );
  // });

  // it("tap", () => {
  //   const hook = new AsyncHook(["meep"], "hi");
  //   const fn = jest.fn();
  //   hook.tap("test", fn);
  //   expect(fn).not.toHaveBeenCalled();
  // });

  // it("tapAsync", () => {
  //   const hook = new AsyncHook(["meep"], "hi");
  //   const fn = jest.fn();
  //   hook.tapAsync("test", fn);
  //   expect(fn).not.toHaveBeenCalled();
  // });
});
