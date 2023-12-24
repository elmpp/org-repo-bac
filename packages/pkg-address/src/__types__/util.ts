import { AddressType } from '.'
import { AddressGroupUnion } from './union'

type ValueOf<T> = T[keyof T]
/** more elegant way of excluding - https://tinyurl.com/yhzkmmxp */
type ExcludeMatchingProperties<T, V> = Pick<
  T,
  { [K in keyof T]-?: T[K] extends V ? never : K }[keyof T]
>

export type AddressTypeByGroup<TGroup extends AddressGroupUnion> = ValueOf<
  ExcludeMatchingProperties<
    {
      [AddType in keyof AddressType]: AddressType[AddType][1] extends TGroup
        ? AddType & keyof AddressType
        : never
    },
    never
  >
>
// export type AddressGroupByType<AddName extends keyof AddressType> =
//   AddressType[AddName] extends [object, AddressGroupUnion] ? AddressType[AddName][1] : never
// export type AddressGroupTypesByType<AddName extends keyof AddressType> = AddressTypeByGroup<AddressGroupByType<AddName>>
