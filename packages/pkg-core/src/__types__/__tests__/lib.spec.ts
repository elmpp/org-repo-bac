import { expectTypeOf } from "expect-type";
import { IncludeMatchingProperties, NullishToOptional, Simplify } from "../lib";
import { InferOkResult, Result, ok } from "../type-utils";

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

describe('result', () => {
  it('infers an ok branch of a result', () => {
    const okRes = ok('blah' as const)
    type OKBranch = InferOkResult<typeof okRes>
    expectTypeOf<OKBranch>().toEqualTypeOf<{success: true, res: 'blah'}>()
  })
  it('infers an ok branch of a result that has been inferred as a union of the result branches', () => {
    type Res = Result<'blah', {error: Error}>
    // type OKBranch = InferOkResult<typeof okRes>
    type OKBranch = InferOkResult<Res>
    expectTypeOf<OKBranch>().toEqualTypeOf<{success: true, res: 'blah'}>() // does not include the fail branch
  })
})
