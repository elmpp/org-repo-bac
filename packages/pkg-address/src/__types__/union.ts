import { AddressType } from "."
import { AddressDescriptor } from "./main"


export type AddressGroupUnion = 'path' | 'url' | 'package' | 'other'

// type ValueOf<T> = T[keyof T]

// export type AddressDescriptorUnion = ValueOf<{
//   [K in keyof AddressType]: AddressDescriptor<K>
//   // [K in keyof AddressType]: AddressType[K][0]
// }>
export type AddressDescriptorUnion = AddressDescriptor<keyof AddressType>
