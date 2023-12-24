import { AddressDescriptor } from '.'
import { AddressTypeByGroup } from './util'

export type AddressPackage = AddressDescriptor<AddressTypeByGroup<'package'>>

export type AddressPackageDescriptor =
  AddressDescriptor<'paramDescriptorPackage'>
export type AddressPackageIdent = AddressDescriptor<'paramIdentPackage'>
// export type AddressPackageTemplateIdent = AddressDescriptor<'templateIdentPackage'>
export type AddressPackageScaffoldIdent =
  AddressDescriptor<'scaffoldIdentPackage'>
/** e.g. @org/name#namespace=my-schematic */
export type AddressPackageScaffoldIdentString = string
export type AddressPackageStringifiedUnion =
  | AddressDescriptor<'paramDescriptorStringifiedPackage'>
  | AddressDescriptor<'paramIdentStringifiedPackage'>
export type AddressPackageDescriptorString = string
export type AddressPackageStringified = string
// export type addressPackageIdentTemplateNamespace

/**
 A package ident is a format that points towards a particular package. It does not
 contain range. Monotonous allows additional informations via a query string.

  @example
 ```ts
  const addressPackageIdentWithParams: AddressPackageIdentString = `@org/name#b=b&a=a`
  const addressPackageIdentTemplateNamespace: AddressPackageIdentString = `@org/name#templateNamespace=eslint`
  const addressPackageIdentPlain: AddressPackageIdentString = `@org/name`
 ```

 {@link address.spec.ts}
 */
export type AddressPackageIdentString = string
