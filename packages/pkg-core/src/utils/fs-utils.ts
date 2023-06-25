import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { xfs } from "@business-as-code/fslib";
import ModuleLoader from "@oclif/core/lib/module-loader";
import * as oclif from "@oclif/core";
import { Config } from "../validation";
import { BacError, MessageName } from "@business-as-code/error";
import { constants } from "../constants";

// import fs from 'fs/promises'

export async function findUp(
  startPath: AddressPathAbsolute,
  filenameRaw: string
): Promise<AddressPathAbsolute | undefined> {
  const filename = addr.parseAsType(filenameRaw, "portablePathFilename");
  let foundPath: AddressPathAbsolute | undefined = undefined;
  let currentPath: AddressPathAbsolute = startPath;

  while (true) {
    // const currentPathWithFilename = path.join(currentPath, filename)
    const currentPathWithFilename = addr.pathUtils.join(currentPath, filename);
    if (await xfs.existsPromise(currentPathWithFilename.address)) {
      foundPath = currentPath;
      break;
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
      break;
    }
    currentPath = nextPath;
  }

  return foundPath;
}

export async function loadModule(pathOrPluginOrConfig: string | oclif.Interfaces.Plugin | oclif.Interfaces.Config): ReturnType<typeof ModuleLoader["loadWithData"]> {

  let loadable: oclif.Plugin | oclif.Config = pathOrPluginOrConfig as oclif.Plugin | oclif.Config
  if (typeof pathOrPluginOrConfig === 'string') {
    loadable = {
      type: 'user',
      root: pathOrPluginOrConfig,
    } as oclif.Plugin
  }
  // const { isESM, module, filePath } = await ModuleLoader.loadWithData(
  const res = await ModuleLoader.loadWithData(
    loadable,
    loadable.root,
  );
  // debug &&
  //   this.debug(
  //     isESM
  //       ? "LoadServicesForPlugin: (import)"
  //       : "LoadServicesForPlugin: (require)",
  //     filePath
  //   );
  return res

}

/** loads a config file via require. Require is resolved relative to this present module */
export function loadConfig(workspacePath: AddressPathAbsolute): Config {
  // let configModule: any
  // if (typeof configPath === 'string') {
  //   configModule = require(configPath)
  // }
  // const requirePath = addr.pathUtils.join(base, addr.parsePath(constants.RC_FILENAME))
  // const configModule = require(`../etc/resolvable-tmp/${constants.RC_FILENAME}`)

  // console.log(`configModule :>> `, configModule)

  // assert(configModule.config)

  const configPath = addr.pathUtils.join(workspacePath, addr.parsePath(constants.RC_FILENAME)) as AddressPathAbsolute

  const relativePath = addr.pathUtils.relative({destAddress: configPath, srcAddress: addr.parsePath(__filename) as AddressPathAbsolute})
  console.log(`relativePath, addr.parsePath(__filename), configPath :>> `, relativePath, addr.parsePath(__filename), configPath)
  const configModule = require(relativePath.original)

  if (!configModule.config) {
    throw new BacError(MessageName.CONFIGURATION_CONTENT_ERROR, `Config export not found in existent file '${configPath}'`)
  }
  return configModule.config
}
