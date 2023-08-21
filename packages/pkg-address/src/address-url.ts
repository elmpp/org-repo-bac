// import { constants } from '@monotonous/common'
import { AddressUrl } from "./__types__";
import type { Address, InitialiseOptions } from "./address";

export type AddressUrlUtils = ReturnType<typeof createAddressUrl>;

export const createAddressUrl = (
  addressIns: Address,
  parseParams: InitialiseOptions["parseParams"]
) => {
  function clone<T extends AddressUrl>(
    address: T,
    { params }: { params?: URLSearchParams }
  ): T {
    const nextAddress = addressIns.parseUrl(address.original) as T;

    if (params && (address as any).parts.params) {
      (nextAddress as any).parts.params = params;
    }

    return nextAddress;
  }

  return {
    clone,
  };
};
