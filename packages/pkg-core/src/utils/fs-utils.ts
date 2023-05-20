import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { xfs } from "@business-as-code/fslib";

// import fs from 'fs/promises'

export async function findUp(startPath: AddressPathAbsolute, filenameRaw: string): Promise<AddressPathAbsolute | undefined> {

  const filename = addr.parseAsType(filenameRaw, 'portablePathFilename')
  let foundPath: AddressPathAbsolute | undefined = undefined
  let currentPath: AddressPathAbsolute = startPath

  while (true) {
    // const currentPathWithFilename = path.join(currentPath, filename)
    const currentPathWithFilename = addr.pathUtils.join(currentPath, filename)
		if (await xfs.existsPromise(currentPathWithFilename.address)) {
      foundPath = currentPath
      break
    }

		// const foundPath = runMatcher({...options, cwd: directory});

		// if (foundPath === findUpStop) {
		// 	break;
		// }

		// if (foundPath) {
		// 	matches.push(path.resolve(directory, foundPath));
		// }

		// if (directory === stopAt || matches.length >= limit) {
		// 	break;
		// }

    const nextPath = addr.pathUtils.dirname(currentPath);
    if (nextPath.original === currentPath.original) {
      break
    }
		currentPath = nextPath
	}

  return foundPath
}