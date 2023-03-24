// Type-fest - https://tinyurl.com/ybucjwqz
export type Simplify<T> = {[KeyType in keyof T]: T[KeyType]}
export type ValueOf<T> = T[keyof T]
export type IsEmptyObject<T extends object> = keyof T extends '' ? true : false
/** more elegant way of excluding - https://tinyurl.com/yhzkmmxp */
export type ExcludeMatchingProperties<T, V> = Pick<T, {[K in keyof T]-?: T[K] extends V ? never : K}[keyof T]>
export type ExcludeEmptyProperties<T> = Pick<T, {[K in keyof T]-?: T[K] extends Object ? keyof T[K] extends '' ? never : K : never}[keyof T]>
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
        ? I
        : never
