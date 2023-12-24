import { addr, AddressPathAbsolute } from '@business-as-code/address'
import { xfs } from '@business-as-code/fslib'
import * as oclif from '@oclif/core'
import ModuleLoader from '@oclif/core/lib/module-loader'
import { ServiceProvidersForAsByMethod } from '../__types__'
// import crypto from 'crypto'
// import { Config } from "../validation";
// import { BacError, BacErrorWrapper, MessageName } from "@business-as-code/error";
// import { constants } from "../constants";

// import fs from 'fs/promises'

/** npm detect-package-manager - https://tinyurl.com/ymfu3st2 */
export async function detectPackageManager(options: {
  workspacePath: AddressPathAbsolute
}): Promise<ServiceProvidersForAsByMethod<'packageManager'> | undefined> {
  return Promise.all([
    xfs.existsPromise(
      addr.pathUtils.join(options.workspacePath, addr.parsePath('yarn.lock'))
        .address
    ),
    xfs.existsPromise(
      addr.pathUtils.join(
        options.workspacePath,
        addr.parsePath('package-lock.json')
      ).address
    ),
    xfs.existsPromise(
      addr.pathUtils.join(
        options.workspacePath,
        addr.parsePath('pnpm-lock.yaml')
      ).address
    ),
    xfs.existsPromise(
      addr.pathUtils.join(options.workspacePath, addr.parsePath('bun.lockb'))
        .address
    )
  ]).then(([isYarn, isNpm, isPnpm, isBun]) => {
    // let value: PM | null = null;

    if (isBun) {
      return 'packageManagerBun'
    } else if (isYarn) {
      return 'packageManagerYarn'
    } else if (isPnpm) {
      return 'packageManagerPnpm'
    } else if (isNpm) {
      // return 'packageManagerNpm'
    } else {
      return undefined
    }
  })
}

export async function findUp(
  startPath: AddressPathAbsolute,
  filenameRaw: string
): Promise<AddressPathAbsolute | undefined> {
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

    const nextPath = addr.pathUtils.dirname(currentPath)
    if (nextPath.original === currentPath.original) {
      break
    }
    currentPath = nextPath
  }

  return foundPath
}

export async function loadModule(
  pathOrPluginOrConfig:
    | string
    | oclif.Interfaces.Plugin
    | oclif.Interfaces.Config
): ReturnType<(typeof ModuleLoader)['loadWithData']> {
  let loadable: oclif.Plugin | oclif.Config = pathOrPluginOrConfig as
    | oclif.Plugin
    | oclif.Config
  if (typeof pathOrPluginOrConfig === 'string') {
    loadable = {
      type: 'user',
      root: pathOrPluginOrConfig
    } as oclif.Plugin
  }
  // const { isESM, module, filePath } = await ModuleLoader.loadWithData(
  const res = await ModuleLoader.loadWithData(loadable, loadable.root)
  // debug &&
  //   this.debug(
  //     isESM
  //       ? "LoadServicesForPlugin: (import)"
  //       : "LoadServicesForPlugin: (require)",
  //     filePath
  //   );
  return res
}

export const resolveCoreConfig = (
  configFilename: string
): AddressPathAbsolute => {
  const configPath = addr.packageUtils.resolve({
    address: addr.parsePackage(
      `@business-as-code/core/etc/config/${configFilename}`
    ),
    // projectCwd: addr.parsePath(
    //   context.oclifConfig.root
    // ) as AddressPathAbsolute, // we should always be able to find other BAC packages from the cli (which is available via oclifConfig)
    projectCwd: addr.pathUtils.cwd, // we should always be able to find other BAC packages from the cli (which is available via oclifConfig)
    strict: true
  })
  return configPath
}

export const tmpResolvableFolder = addr.pathUtils.resolve(
  addr.parsePath(__dirname),
  addr.parsePath(`../etc/tmp`)
)

// /**
//  * loads a config file via require. Has fallback behaviour whereby it's copied into the present checkout.
//  * This is necessary when other workspace instances are being cliLinked back to this checkout and require()ing
//  * their configs isn't possible
//  */
// export function loadConfig(workspacePath: AddressPathAbsolute): Config {
//   // let configModule: any
//   // if (typeof configPath === 'string') {
//   //   configModule = require(configPath)
//   // }
//   // const requirePath = addr.pathUtils.join(base, addr.parsePath(constants.RC_FILENAME))
//   // const configModule = require(`../etc/resolvable-tmp/${constants.RC_FILENAME}`)

//   // console.log(`configModule :>> `, configModule)

//   // assert(configModule.config)

//   const importConfig = (configPath: AddressPathAbsolute) => {

//     const tmpFilename = addr.parsePath(`config-${crypto.randomBytes(16).toString('hex')}`)
//     const tmpFilepath = addr.pathUtils.join(tmpResolvableFolder, tmpFilename)

//     // console.log(`tmpFilepath, ../etc/${tmpFilename.original} :>> `, tmpFilepath, )

//     // const sourcePath = addr.pathUtils.join(workspacePath, addr.parsePath(constants.RC_FILENAME))
//     xfs.copyFileSync(configPath.address, tmpFilepath.address)

//     const configModule = require(`../etc/tmp/${tmpFilename.original}`)
//     return configModule
//     // // console.log(`configModule :>> `, configModule)

//     // assert(configModule.config)
//     // return configModule.config

//     // return fsUtils.loadConfig(this._tmpResolvablePath)
//   }

//   const configPath = addr.pathUtils.join(workspacePath, addr.parsePath(constants.RC_FILENAME)) as AddressPathAbsolute

//   const relativePath = addr.pathUtils.relative({destAddress: configPath, srcAddress: addr.parsePath(__filename) as AddressPathAbsolute})
//   try {
//     const configModule = require(relativePath.original)
//     // const configModule = require.resolve('constants.RC_FILENAME', {paths: [workspacePath.original]})
//     if (!configModule.config) {
//       throw new BacError(MessageName.CONFIGURATION_CONTENT_ERROR, `Config not found in existent file '${configPath.original}'. Workspace path supplied: '${workspacePath.original}'`)
//     }
//     return configModule.config
//   }
//   catch {}

//   try {
//     const configModule = importConfig(configPath)
//     if (!configModule.config) {
//       throw new BacError(MessageName.CONFIGURATION_CONTENT_ERROR, `Config imported from '${configPath.original} but config export not found inside'. Workspace path supplied: '${workspacePath.original}'`)
//     }
//     return configModule.config
//   }
//   catch (err) {
//     throw new BacErrorWrapper(MessageName.CONFIGURATION_CONTENT_ERROR, `Config not importable()able at '${configPath.original}'. Workspace path supplied: '${workspacePath.original}'`, err as Error)
//   }
// }

export const sanitise = (str: string): string => {
  // @ts-ignore
  const res = str.replaceAll(/['"~><,]/g, '').replaceAll(/[\s;+/\\:.]+/g, '_')
  return res
}
