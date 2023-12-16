import { AddressType } from "."
import { AddressDescriptor } from "./main"

export type ValueOf<T> = T[keyof T]

export type AddressGroupUnion = 'path' | 'url' | 'package' | 'other'

// type ValueOf<T> = T[keyof T]

// export type AddressDescriptorUnion = ValueOf<{
//   [K in keyof AddressType]: AddressDescriptor<K>
//   // [K in keyof AddressType]: AddressType[K][0]
// }>
// export type AddressDescriptorUnion = AddressDescriptor<keyof AddressType>
export type AddressDescriptorUnion = ValueOf<{
  [K in keyof AddressType]: AddressDescriptor<K>
}>
type Simplify<T> = {[KeyType in keyof T]: T[KeyType]};
type D = Simplify<keyof AddressType>
