import { AddressDescriptor } from "./main"
import { AddressTypeByGroup } from "./util"

export type AddressUrl = AddressDescriptor<AddressTypeByGroup<'url'>>

export type AddressUrlGit = AddressDescriptor<'githubRepoUrl'>
// export type AddressUrlRelative = AddressDescriptor<'portablePathPosixRelative' | 'portablePathWindowsRelative' | 'portablePathFilename'>
// export type AddressUrlFilename = AddressDescriptor<'portablePathFilename'>