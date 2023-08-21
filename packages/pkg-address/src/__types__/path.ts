import { AddressDescriptor } from "./main"
import { AddressTypeByGroup } from "./util"

export type AddressPath = AddressDescriptor<AddressTypeByGroup<'path'>>

export type AddressPathAbsolute = AddressDescriptor<'portablePathPosixAbsolute'> | AddressDescriptor<'portablePathWindowsAbsolute'>
export type AddressPathRelative = AddressDescriptor<'portablePathPosixRelative'> | AddressDescriptor<'portablePathWindowsRelative'> | AddressDescriptor<'portablePathFilename'>
export type AddressPathFilename = AddressDescriptor<'portablePathFilename'>
export type AddressPathCache = AddressDescriptor<'portablePathCache'>
export type AddressPathAbsoluteString = string
export type AddressPathRelativeString = string
export type AddressPathFilenameString = string