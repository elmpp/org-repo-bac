import { Outputs } from "@business-as-code/core"
import { AddressDescriptorUnion, AddressPathAbsolute } from "@business-as-code/address"

export type Meta = {
  destinationPath: AddressPathAbsolute
}

/**
 Represents the location of a cache unit. The term 'unit' here is some measure of (stream) output + FS artifacts.
 It may be part of a larger process, e.g. only for a specific package within a repo-wide task

 Locations are done as Address to allow string typing and abstracting of content manipulation
 */
export type CacheEntryAddress<TAddressDescriptorOutput extends AddressDescriptorUnion, TAddressDescriptorContent extends AddressDescriptorUnion> = {
  outputs: CacheOutputsAddress<TAddressDescriptorOutput>
  content: CacheContentAddress<TAddressDescriptorContent>
}
export type SourceCacheEntryAddress<TAddressDescriptorContent extends AddressDescriptorUnion> = {
  outputs: Outputs
  meta: Meta
  content?: TAddressDescriptorContent
}

type CacheOutputsAddress<TAddressDescriptor extends AddressDescriptorUnion> = {
  _base: TAddressDescriptor // enclosing structure for the outputs cache entry's output values (includes key)
  _namespaceBase: TAddressDescriptor // enclosing structure for the all output cache entries of a namespace (includes key)
  unformatted: TAddressDescriptor
  formatted: TAddressDescriptor
  error: TAddressDescriptor
}
type CacheContentAddress<TAddressDescriptor extends AddressDescriptorUnion> = {
  _base: TAddressDescriptor // enclosing structure for the content cache entry's content value (includes key)
  _namespaceBase: TAddressDescriptor // enclosing structure for the all content cache entries of a namespace (includes key)
  main: TAddressDescriptor | undefined // perhaps in future include any compression within schemes
}

// export type CacheOutputs = {
//   [K in keyof CacheOutputsAddress]: string
// }



// /**
//  A Task is something that in runnable and produces output

//  {@linkTutorial https://monotonous.org/lexicon#task | task - something that produces output}
//  {@linkTutorial https://monotonous.org/lexicon#output | output - any form of new stuff; stream output / fs content}
//  */
// export type CacheTask = ProjectLevelState<{state: CacheUnit, meta: { } }, >


