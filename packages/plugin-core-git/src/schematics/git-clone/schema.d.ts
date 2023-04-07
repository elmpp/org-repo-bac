import { AddressUrlGithub, AddressUrlGithubString } from '@business-as-code/address'

export interface Schema {
  // destinationPath: string,
  url: AddressUrlGithubString,
  destinationPath: string,
  bare?: boolean
  _bacContext: import('@business-as-code/core').Context
}