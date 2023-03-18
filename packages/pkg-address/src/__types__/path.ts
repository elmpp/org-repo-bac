import { AddressDescriptor } from "./main"
import { AddressTypeByGroup } from "./util"

export type AddressPath = AddressDescriptor<AddressTypeByGroup<'path'>>

export type AddressPathAbsolute = AddressDescriptor<'portablePathPosixAbsolute'> | AddressDescriptor<'portablePathWindowsAbsolute'>
export type AddressPathRelative = AddressDescriptor<'portablePathPosixRelative'> | AddressDescriptor<'portablePathWindowsRelative'> | AddressDescriptor<'portablePathFilename'>
export type AddressPathFilename = AddressDescriptor<'portablePathFilename'>