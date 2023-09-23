import { UnwrapPromise } from "./lib";

export function assertIsOk<R, E extends {error: Error}>(
// export function assertIsOk<R, E extends Error | {error: Error}>(
  res: Result<R, E>
): res is Extract<Result<R, E>, { success: true }> {
  if (res?.success === undefined)
    throw new Error(
      `assertIsSuccess: res is not valid Result object. res: '${require("util").inspect(
        res,
        { showHidden: false, depth: 2, colors: true }
      )}'`
    );
  return !!res.success;
}
export function assertIsResult<R, E extends {error: Error}>(res: any): res is Result<R, E> {
// export function assertIsResult<R, E extends Error | {error: Error}>(res: any): res is Result<R, E> {
  if (res?.success !== true && res?.success !== false)
    throw new Error(
      `assertIsResult: res is not valid Result object. res: '${require("util").inspect(
        res,
        { showHidden: false, depth: 2, colors: true }
      )}'`
    );
  return true;
}

export function expectIsOk<T extends Result<any, {error: Error}>>(
// export function expectIsOk<T extends Result<any, Error | {error: Error}>>(
  res: T
): asserts res is Extract<T, { success: true }> {
  if (assertIsOk(res)) {
    return res.res;
  }
  // fail(new Error(`res is not successful`)) // can't use jest fail() - https://tinyurl.com/2hu8zcpo
  // throw new Error(`Expected res to be successful. '${JSON.stringify(res)}'`)

  if ((res.res as {error: Error}).error instanceof Error) {
    throw (res.res as {error: Error}).error
  }

  throw res.res;
}
export function expectIsFail<T extends Result<any, {error: Error}>>(
// export function expectIsFail<T extends Result<any, Error | {error: Error}>>(
  res: T
): asserts res is Extract<T, { success: false }> {
  if (!assertIsOk(res)) {
    return;
  }
  // fail(new Error(`res is not successful`)) // can't use jest fail() - https://tinyurl.com/2hu8zcpo
  throw new Error(
    `Expected res to be fail. Successful result: '${JSON.stringify(res)}'`
  );
  // throw new BacErrorWrapper(undefined, `Expected res to be fail.`, res)
}

/** poor man's neverthrow - https://tinyurl.com/2xuoxzp5 */
type Ok<Res> = {
  success: true;
  res: Res;
};
type Fail<Err extends Error | {error: Error}> = {
  success: false;
  res: Err;
};
export type Result<Res, Err extends {error: Error}> = Ok<Res> | Fail<Err>;
// export type Result<Res, Err extends Error | {error: Error}> = Ok<Res> | Fail<Err>;
export type ResultPromiseAugment<Res extends Promise<Result<any, any>>, Add extends Record<string, unknown>> = Promise<ResultAugment<UnwrapPromise<Res>, Add>>
export type ResultAugment<Res extends Result<any, any>, Add extends Record<string, unknown>> = Res extends Result<infer XOk, infer XFail> ? Res extends {success: true} ? Ok<XOk & Add> : Fail<XFail> : never
export const ok = <T>(res: T): Ok<T> => {
  return {
    success: true,
    res,
  };
};
export type InferOkResult<R extends Result<unknown, any>> = Extract<R, {success: true}>
// export type InferOkResult<R extends Result<unknown, any>> = R extends Result<infer T, any> ? Exclude<T, {} : never
export const fail = <T extends Error | {error: Error}>(res: T): Fail<T> => {
  return {
    success: false,
    res,
  };
};
