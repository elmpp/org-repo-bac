import { Address } from '../address'
import { AddressPackageUtils } from '../address-package'
import { AddressDescriptor, AddressPackageDescriptor, AddressPackageIdent } from '../__types__'


describe.only('Address.packageUtils', () => {

  let addr: Address
  let addressPackageUtils: AddressPackageUtils

  beforeEach(async () => {
    addr = Address.initialise({parseParams: {}})
    addressPackageUtils = addr.packageUtils
  })
  describe('resolve methods', () => {
    it.todo('dunno if worthwhile setting all this up')
  })
  describe('other methods', () => {
    it('stringify', () => {

      const descriptor = `@org/name@v1.0.0#b=b&a=a`
      const addressPackage1 = addr.parsePackage(descriptor)

      expect(addressPackage1.type).toEqual('paramDescriptorPackage')

      const stringified = addr.packageUtils.stringify({address: addressPackage1})

      expect(stringified).toEqual(`@org___name@v1.0.0#b=b&a=a`)

      const addressPackage2 = addr.parsePackage(stringified)

      expect(addressPackage2.type).toEqual('paramDescriptorStringifiedPackage')
    })
    it('identToDescriptor', () => {

      // const descriptor = `@org/name@v1.0.0#b=b&a=a`
      const descriptor = `@org/name#b=b&a=a`
      const addressPackageIdent = addr.parseAsType(descriptor, 'paramIdentPackage')
      expect(addressPackageIdent.type).toEqual('paramIdentPackage')

      // const stringified = addr.packageUtils.stringify({address: addressPackageIdent})

      const addressDescriptor = addr.packageUtils.identToDescriptor({address: addressPackageIdent, range: 'v1.0.0'})

      expect(addressDescriptor.address).toEqual(`@org/name@v1.0.0#b=b&a=a`)
      expect(addressDescriptor.addressNormalized).toEqual(`@org/name@v1.0.0#a=a&b=b`)
      // expect(stringified).toEqual(`@org___name@v1.0.0#b=b&a=a`)

      // const addressPackage2 = addr.parsePackage(stringified)

      // expect(addressPackage2.type).toEqual('paramDescriptorStringifiedPackage')
    })
  })
})
