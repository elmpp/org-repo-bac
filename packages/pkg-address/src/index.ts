export * from './__types__'
export {
  assertIsAddress,
  assertIsAddressPath,
  assertIsAddressUrl,
  assertIsAddressPackage,
  assertIsAddressPackageDescriptor,
  assertIsAddressPackageIdent,
  assertIsAddressPathAbsolute,
  assertIsAddressPathRelative
} from './address'

export { type AddressPackageProtocols } from './address-package'

import { Address, InitialiseOptions } from './address'

const addressOptions: InitialiseOptions = {
  parseParams: {
    arch: process.platform
  }
}
const addr = Address.initialise(addressOptions)

// // can be called multiple times to allow pre-context usage
// const addressBootstrap = (addressOptions: Parameters<typeof Address['initialise']>[0] = {parseParams: {packageManager: 'workrootPackageManagerYarn2Pnp'}}) => {
// }
// addressBootstrap() // bootstrap without parameters upfront. Consumers should do this again with `parseParams`

export { addr, Address }
