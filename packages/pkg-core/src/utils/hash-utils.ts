import { createHash } from 'crypto'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import stringify from 'json-stringify-deterministic'

export function makeHash(arg: any): string {
  const hash = createHash(`sha512`)
  if (typeof arg !== 'string') arg = stringifyDeterministic(arg)
  hash.update(arg)

  return hash.digest(`hex`)
}

export const stringifyDeterministic = stringify

// export function uuid() {
//   return uuidv4()
// }

// export function checksumFile(address: AddressPathAbsolute) {
//   return new Promise<string>((resolve, reject) => {
//     // const fs = new NodeFS()

//     // if (!fs.existsSync(path)) return resolve(undefined)
//     if (!xfs.existsSync(address.address)) {
//       throw new MntError(
//         MessageName.PROJECT_UNINITIATED,
//         `Unable to calculate checksum for inexistent file '${address.original}'.`
//       );
//     }

//     const stream = xfs.createReadStream(address.address, {});
//     const hash = createHash(`sha512`);

//     stream.on(`data`, (chunk: BinaryLike) => {
//       hash.update(chunk);
//     });

//     stream.on(`error`, (error: Error) => {
//       reject(error);
//     });

//     stream.on(`end`, () => {
//       resolve(hash.digest(`hex`));
//     });
//   });
// }
