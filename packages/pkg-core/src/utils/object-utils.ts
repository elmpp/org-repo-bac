import { deepmerge } from "deepmerge-ts";

/** when the iteratee returns same type as its input (with no skip), the overall returnType can be the same as Obj */
export function objectMapAndFilter<
  Obj extends Record<string, any>,
  Key extends keyof Obj
>(
  obj: Obj,
  iteratee: (value: Obj[Key], key: Key, idx: number) => Obj[Key]
  // ): Obj {
): Obj;
/** when the iteratee returns different type to its input, the overall returnType can't be the same as the Obj */
export function objectMapAndFilter<
  Obj extends Record<string, any>,
  Key extends keyof Obj,
  Out extends string | number | Record<string, any> | Function
>(
  obj: Obj,
  iteratee: (value: Obj[Key], key: Key, idx: number) => Out
): { [K in keyof Obj]: Out };
/** when the iteratee returns a type that includes a skip, the overall returnType can be partial (cannot do 'Obj[key]: never' though it appears) */
export function objectMapAndFilter<
  Obj extends Record<string, any>,
  Key extends keyof Obj
  // Out extends Record<string, any> | Symbol
>(
  obj: Obj,
  iteratee: (value: Obj[Key], key: Key, idx: number) => any | Symbol
): Obj;
export function objectMapAndFilter<
  Obj extends Record<string, any>,
  Key extends keyof Obj,
  Out
>(obj: Obj, iteratee: any): { [K in keyof Obj]: Out | never } {
  let key: Key; // this is how to avoid string inference of keys yay!
  let returnObj = {} as {
    [K in keyof Obj]: Out | never;
  };
  let i = 0;
  for (key of Object.keys(obj) as unknown as Key[]) {
    const val = obj[key];
    const ret = iteratee(val, key, i);
    if (ret !== objectMapAndFilterSkip) {
      returnObj[key] = ret;
    }
    i++;
  }
  return returnObj;
}
const objectMapAndFilterSkip = Symbol();
objectMapAndFilter.skip = objectMapAndFilterSkip;

/** when the iteratee returns same type as its input (with no skip), the overall returnType can be the same as Obj */
export async function objectMapAndFilterPromise<
  Obj extends Record<string, any>,
  Key extends keyof Obj
>(
  obj: Obj,
  iteratee: (value: Obj[Key], key: Key, idx: number) => Promise<Obj[Key]>
  // ): Obj {
): Promise<Obj>;
/** when the iteratee returns different type to its input, the overall returnType can't be the same as the Obj */
export async function objectMapAndFilterPromise<
  Obj extends Record<string, any>,
  Key extends keyof Obj,
  Out extends Record<string, any>
>(
  obj: Obj,
  iteratee: (value: Obj[Key], key: Key, idx: number) => Promise<Out>
): Promise<{ [K in keyof Obj]: Out }>;
/** when the iteratee returns a type that includes a skip, the overall returnType can be partial (cannot do 'Obj[key]: never' though it appears) */
export async function objectMapAndFilterPromise<
  Obj extends Record<string, any>,
  Key extends keyof Obj
  // Out extends Record<string, any> | typeof objectMapAndFilterPromiseSkip
>(
  obj: Obj,
  iteratee: (value: Obj[Key], key: Key, idx: number) => Promise<any | Symbol>
): Promise<Partial<Obj>>;
export async function objectMapAndFilterPromise<
  Obj extends Record<string, any>,
  Key extends keyof Obj,
  // Key extends keyof Obj & string,
  // In extends Obj[Key],
  Out
>(obj: Obj, iteratee: any): Promise<{ [K in keyof Obj]: any | never }> {
  let key: Key; // this is how to avoid string inference of keys yay!
  let returnObj = {} as {
    [K in keyof Obj]: Out | never;
  };
  let i = 0;
  for (key of Object.keys(obj) as unknown as Key[]) {
    const val = obj[key];
    const ret = await iteratee(val, key, i);
    if (ret !== objectMapAndFilterPromiseSkip) {
      returnObj[key] = ret;
    }
    i++;
  }
  return returnObj;
}
const objectMapAndFilterPromiseSkip = Symbol();
objectMapAndFilterPromise.skip = objectMapAndFilterPromiseSkip;

export {
  /** deepmerge-ts - https://tinyurl.com/25u3odeh */
  deepmerge as deepMerge,
};
