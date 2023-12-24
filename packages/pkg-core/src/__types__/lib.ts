import { z } from 'zod'

// Type-fest - https://tinyurl.com/ybucjwqz
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] }
export type ValueOf<T> = T[keyof T]
export type IsEmptyObject<T extends object> = keyof T extends '' ? true : false
/** more elegant way of excluding - https://tinyurl.com/yhzkmmxp */
export type ExcludeMatchingProperties<T extends Record<string, any>, V> = Pick<
  T,
  { [K in keyof T]-?: V extends T[K] ? never : K }[keyof T]
> // see test in ./util.spec!!
export type IncludeMatchingProperties<T extends Record<string, any>, V> = Pick<
  T,
  { [K in keyof T]-?: V extends T[K] ? K : never }[keyof T]
> // see test in ./util.spec!!
// export type ExcludeMatchingProperties<T, V> = Pick<T, {[K in keyof T]-?: T[K] extends V ? never : K}[keyof T]>
export type ExcludeEmptyProperties<T> = Pick<
  T,
  {
    [K in keyof T]-?: T[K] extends Object
      ? keyof T[K] extends ''
        ? never
        : K
      : never
  }[keyof T]
>
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never
export type UnwrapPromise<T> = T extends PromiseLike<infer U>
  ? UnwrapPromise<U>
  : T
export type SetRequired<BaseType, Keys extends keyof BaseType> = Pick<
  BaseType,
  Exclude<keyof BaseType, Keys>
> &
  Required<Pick<BaseType, Keys>>
export type SetOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type NullishToOptional<T extends Record<string, any>> = Partial<
  IncludeMatchingProperties<T, undefined>
> &
  ExcludeMatchingProperties<T, undefined>

export type SafeGet<T, K> = K extends keyof T ? T[K] : never

export const zodCif =
  <Z extends z.ZodTypeAny, T extends z.infer<Z>>(schema: Z) =>
  (args: T) => {
    return schema
  }
