import { expectTypeOf } from "expect-type";
import { AsyncSeriesBailHook, AsyncSeriesHook, AsyncSeriesWaterfallHook, Hook } from "tapable";
import { InferHookReturn } from "../__types__";

describe("types", () => {
  describe("Inference", () => {
    it("infer hook returns - series", () => {
      const hook = new AsyncSeriesHook<
        {a: 'a'},
        {b: 'b'}
      >(["options"])
      type ReturnType = InferHookReturn<
        typeof hook
      >;
      expectTypeOf<ReturnType>().toEqualTypeOf<void>() // <!--- note Async/Sync Hook don't return
    });
    it("infer hook returns - BailSeries", () => {
      const hook = new AsyncSeriesBailHook<
        {a: 'a'},
        {b: 'b'}
      >(["options"])
      type ReturnType = InferHookReturn<
        typeof hook
      >;
      expectTypeOf<ReturnType>().toEqualTypeOf<{b: 'b'}>()
    });
    it("infer hook returns - WaterfallSeries", () => {
      const hook = new AsyncSeriesWaterfallHook<
        {a: 'a'},
        {b: 'b'}
      >(["options"])
      type ReturnType = InferHookReturn<
        typeof hook
      >;
      expectTypeOf<ReturnType>().toEqualTypeOf<{a: 'a'}>() // <!--- note Waterfall Hooks return same type as options.
    });
  });
});
