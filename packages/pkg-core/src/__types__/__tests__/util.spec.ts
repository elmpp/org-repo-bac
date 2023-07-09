import { expectTypeOf } from "expect-type";
import { IncludeMatchingProperties, NullishToOptional, Simplify } from "../util";

describe('util', () => {
  it('includeMatchingProperties understanding', () => {
    type Wider = 'B' | undefined
    type Narrower = undefined

    type NarrowerExtendsWider = [Wider] extends [Narrower] ? true : false
    expectTypeOf<Wider>().not.toMatchTypeOf<Narrower>()
    expectTypeOf<NarrowerExtendsWider>().not.toEqualTypeOf<true>()

    type WiderExtendsNarrower = [Narrower] extends [Wider] ? true : false
    expectTypeOf<Narrower>().toMatchTypeOf<Wider>()
    expectTypeOf<WiderExtendsNarrower>().toEqualTypeOf<true>()
  })
  it('includeMatchingProperties', () => {
    type Tester = { a: "a" | undefined; b?: "b"; c: "c" }
    type Included = IncludeMatchingProperties<Tester, undefined>
    // type DDDs = IncludeMatchingProperties<undefined, Tester>
    expectTypeOf<Included>().toEqualTypeOf<{
      a: "a" | undefined;
      b?: "b" | undefined;
    }>();
  })
  it('nullishToOptional', () => {
    type Tester = { a: "a" | undefined; b?: "b"; c: "c" }
    type NullishToOptionalTest = Simplify<
      NullishToOptional<Tester>
    >;
    expectTypeOf<NullishToOptionalTest>().toEqualTypeOf<{
      a?: "a";
      b?: "b";
      c: "c";
    }>();
  })
})
