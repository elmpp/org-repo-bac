import { expectTypeOf } from "expect-type";
import { NullishToOptional, Simplify } from "../util";

type NullishToOptionalTest = Simplify<
  NullishToOptional<{ a: "a" | undefined; b?: "b"; c: "c" }>
>;
expectTypeOf<NullishToOptionalTest>().toEqualTypeOf<{
  a?: "a";
  b?: "b";
  c: "c";
}>();
