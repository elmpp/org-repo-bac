import { AddressType } from '.'
import { Address, InitialiseOptions } from '../address'
import { AddressGroupUnion } from './union'

export interface AddressHandler<
  AddName extends keyof AddressType = keyof AddressType
> {
  name: AddName
  group: AddressGroupUnion

  parse: (
    options: {
      address: string
      // address: AddressType[AddName][2],
      pathType?: 'native' | 'portable'
      // arch: NodeJS.Platform,
      // packageManager: PackageManagerUnion
      // destinationContent?: ContentType
      // sourceStat: Stats
      // destinationStat: Stats | null
      // source: PortablePath
      // // sourceAbs: PortablePath
      // destination: PortablePath
      // log: CopyOptions['log']
      // mode: Exclude<CopyOptions['mode'], 'stopIfExistent'>
    } & Required<InitialiseOptions['parseParams']>
  ) => Omit<AddressDescriptor<AddName>, 'group'> | void

  format?: (options: {
    address: AddressDescriptor<AddName>
    addressIns: Address
  }) => string
  // normalize?: (options: {address: AddressDescriptor<AddName>, addressIns: Address}) => string
  // normalize?: <Desc extends AddressDescriptor<AddressGroupTypesByType<AddName>>>(options: {address: Desc, addressIns: Address}) => Desc
  // relative?: <Desc extends AddressDescriptor<AddressGroupTypesByType<AddName>>>(options: {srcAddress: Desc, destAddress: Desc, addressIns: Address}) => Desc
}

/** a parsed representation of the address */
export type AddressDescriptor<
  AddName extends keyof AddressType = keyof AddressType
> = {
  /** pre-parsed format. For paths this will always be the NativePath */
  original: string
  originalNormalized: string
  /** parsed, string format if applicable (e.g. PortablePath) */
  address: AddressType[AddName][2]
  addressNormalized: AddressType[AddName][2]
  group: AddressGroupUnion
  /** The parsed values. Fulfills the types as declared by the handler only */
  // parts: AddressType[AddName] extends [object, AddressGroupUnion] ? AddressType[AddName][0] : never
  parts: AddressType[AddName][0]
  type: AddName
  // treeish: {
  //   protocol: GitTreeishProtocols
  //   value: string
  // }
}
