import { Outputs } from "@business-as-code/core";
import { AddressDescriptorUnion, AddressPathAbsolute } from "@business-as-code/address";
export type Meta = {
    destinationPath: AddressPathAbsolute;
};
/**
 Represents the location of a cache unit. The term 'unit' here is some measure of (stream) output + FS artifacts.
 It may be part of a larger process, e.g. only for a specific package within a repo-wide task

 Locations are done as Address to allow string typing and abstracting of content manipulation
 */
export type CacheEntryAddress<TAddressDescriptorOutput extends AddressDescriptorUnion, TAddressDescriptorContent extends AddressDescriptorUnion> = {
    outputs: CacheOutputsAddress<TAddressDescriptorOutput>;
    content: CacheContentAddress<TAddressDescriptorContent>;
};
export type SourceCacheEntryAddress<TAddressDescriptorContent extends AddressDescriptorUnion> = {
    outputs: Outputs;
    meta: Meta;
    content?: TAddressDescriptorContent;
};
type CacheOutputsAddress<TAddressDescriptor extends AddressDescriptorUnion> = {
    _base: TAddressDescriptor;
    _namespaceBase: TAddressDescriptor;
    unformatted: TAddressDescriptor;
    formatted: TAddressDescriptor;
    error: TAddressDescriptor;
};
type CacheContentAddress<TAddressDescriptor extends AddressDescriptorUnion> = {
    _base: TAddressDescriptor;
    _namespaceBase: TAddressDescriptor;
    main: TAddressDescriptor | undefined;
};
export {};
