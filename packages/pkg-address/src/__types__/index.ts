export * from './main'
export * from './package'
export * from './path'
export * from './union'
export * from './url'
export * from './util'

export interface AddressType {
  // handlerName: {
  //   parts: {
  //    url: URL,
  //    org: string,
  //    owner: string
  //   },
  //   group: 'url',
  //   string
  // },
}

// export interface AddressHandler<AddName extends keyof AddressType = keyof AddressType> {

//   name: AddName
//   group: AddressGroupUnion

//   parse: (options: {
//     address: string,
//     pathType?: 'native' | 'portable'
//     // arch: NodeJS.Platform,
//     // packageManager: PackageManagerUnion
//     // destinationContent?: ContentType
//     // sourceStat: Stats
//     // destinationStat: Stats | null
//     // source: PortablePath
//     // // sourceAbs: PortablePath
//     // destination: PortablePath
//     // log: CopyOptions['log']
//     // mode: Exclude<CopyOptions['mode'], 'stopIfExistent'>
//   } & Required<Options['parseParams']>) => undefined | Omit<AddressDescriptor<AddName>, 'group'>

//   format?: (options: {address: AddressDescriptor<AddName>, addressIns: Address}) => string
//   normalize?: (options: {address: AddressDescriptor<AddName>, addressIns: Address}) => string
//   // normalize?: <Desc extends AddressDescriptor<AddressGroupTypesByType<AddName>>>(options: {address: Desc, addressIns: Address}) => Desc
//   // relative?: <Desc extends AddressDescriptor<AddressGroupTypesByType<AddName>>>(options: {srcAddress: Desc, destAddress: Desc, addressIns: Address}) => Desc
// }

// export interface AddressType {

// }

// export type AddressTypeByGroup<TGroup extends AddressGroupUnion> = Mnt.Util.ValueOf<Mnt.Util.ExcludeMatchingProperties<{
//   [AddType in keyof AddressType]: AddressType[AddType] extends [object, AddressGroupUnion] ? AddressType[AddType][1] extends TGroup ? AddType & keyof AddressType : never : never
// }, never>>
// export type AddressGroupByType<AddName extends keyof AddressType> =
//   AddressType[AddName] extends [object, AddressGroupUnion] ? AddressType[AddName][1] : never
// export type AddressGroupTypesByType<AddName extends keyof AddressType> = AddressTypeByGroup<AddressGroupByType<AddName>>

// /** a parsed representation of the address */
// export type AddressDescriptor<AddName extends keyof AddressType = keyof AddressType> = {
//   /** pre-parsed format. For paths this will always be the NativePath */
//   original: string
//   /** parsed, string format if applicable (e.g. PortablePath) */
//   address: string
//   group: AddressGroupUnion
//   /** The parsed values. Fulfills the types as declared by the handler only */
//   // parts: AddressType[AddName] extends [object, AddressGroupUnion] ? AddressType[AddName][0] : never
//   parts: AddressType[AddName] extends [object, AddressGroupUnion] ? AddressType[AddName][0] : never
//   type: AddName
//   // treeish: {
//   //   protocol: GitTreeishProtocols
//   //   value: string
//   // }
// }

// export type AddressPath = AddressDescriptor<AddressTypeByGroup<'path'>>
// export type AddressPackage = AddressDescriptor<AddressTypeByGroup<'package'>>
// export type AddressUrl = AddressDescriptor<AddressTypeByGroup<'url'>>

// export type AddressPathAbsolute = AddressDescriptor<'portablePathPosixAbsolute' | 'portablePathWindowsAbsolute'>
// export type AddressPathRelative = AddressDescriptor<'portablePathPosixRelative' | 'portablePathWindowsRelative' | 'portablePathFilename'>
// export type AddressPathFilename = AddressDescriptor<'portablePathFilename'>

// export type AddressPackageDescriptor = AddressDescriptor<'paramDescriptorPackage'>
// export type AddressPackageIdent = AddressDescriptor<'paramIdentPackage'>
// export type AddressPackageDescriptorString = string
// export type AddressPackageIdentString = string
