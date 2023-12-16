import { AddressDescriptor } from "./main"
import { AddressTypeByGroup } from "./util"

export type ValueOf<T> = T[keyof T]

export type AddressUrl = AddressDescriptor<AddressTypeByGroup<'url'>>

export type AddressUrlGithub = AddressDescriptor<'githubRepoUrl'>
/** e.g. https://github.com/elmpp/org-repo.git#head=master */
export type AddressUrlGithubString = string

export type AddressUrlGitSsh = AddressDescriptor<'gitSshRepoUrl'>
export type AddressUrlGitHttp = AddressDescriptor<'gitHttpRepoUrl'>

// export type AddressUrlGit = AddressDescriptor<'gitHttpRepoUrl' | 'gitSshRepoUrl'>
export type AddressUrlGit = AddressUrlGitSsh | AddressUrlGitHttp
/** e.g. https://github.com/elmpp/org-repo.git#head=master */
export type AddressUrlGitString = string


// export type AddressUrlRelative = AddressDescriptor<'portablePathPosixRelative' | 'portablePathWindowsRelative' | 'portablePathFilename'>
// export type AddressUrlFilename = AddressDescriptor<'portablePathFilename'>