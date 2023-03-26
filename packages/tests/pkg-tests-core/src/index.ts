
// import {oclifTest, oclifExpect} from './oclif'
import { addr, AddressPathAbsolute } from '@business-as-code/address'
import { LogLevel, Outputs } from '@business-as-code/core'
import { xfs } from '@business-as-code/fslib'
import * as oclifCore from '@oclif/core'
import * as mockStd from 'stdout-stderr'
import { getCurrentTestFilenameSanitised, getCurrentTestNameSanitised, sanitise } from './test-utils'
import { XfsCacheManager } from './xfs-cache-manager'

// const oclifTestWithExpect = Object.assign(oclifTest, {expect: oclifExpect})

export type UnwrapPromise<T> = T extends PromiseLike<infer U> ? UnwrapPromise<U> : T

export type PersistentTestEnv = {
  /** main interface for creating tests */
  test: UnwrapPromise<ReturnType<typeof createTestEnv>>
  // /** call to clear tests folder, probably on beforeEach */
  // init: () => Promise<void>
  /** clears up. Mainly jest mocking etc */
  reset: () => Promise<void>
}

type CreateEphemeralTestEnvVars = {
  /** the ultimate path where content will be created. Defaults to `${basePath}/${testName}` which is the jest test name */
  destinationPath?: (options: {testsPath: AddressPathAbsolute; testName: string}) => AddressPathAbsolute
  /** supply if you want to save a copy of the content (if tests pass) */
  savePath?: (options: {
    testsPath: AddressPathAbsolute
    cachePath: AddressPathAbsolute
    fixturesPath: AddressPathAbsolute
  }) => AddressPathAbsolute
  // /** any persistent plugins for the destination content */
  // persistentPlugins?: AddressPackageDescriptorString[]
  // /** any ephemeral plugins for the destination content */
  // ephemeralPlugins?: AddressPackageDescriptorString[]
  // initialPlugins?: {ident: string, range: string}[]
  // initialPlugins?: PluginMap

  /** used as the test folder names. This is required when within setupFixtures() */
  processNamespace?: string
  /** remove cache for individual test. Deletes at a test level, not namespace */
  cacheRenewTest?: boolean
}

type CreatePersistentTestEnvVars = {
  // /** the ultimate path where content will be created. Defaults to `${basePath}/${testName}` which is the jest test name */
  // destinationPath?: (options: {testsPath: AddressPathAbsolute; testName: string}) => AddressPathAbsolute
  // /** supply if you want to save a copy of the content (if tests pass) */
  // savePath?: (options: {testsPath: AddressPathAbsolute, cachePath: AddressPathAbsolute, fixturesPath: AddressPathAbsolute}) => AddressPathAbsolute
  /** the base path for further folders. We do this to allow cache and content folders to be contained */
  basePath?: () => AddressPathAbsolute
  // /** the cache base path. Tests are free to save cache entries that will allow be within here. Defaults to basePath/cache */
  // cachePath?: (options: {basePath: AddressPathAbsolute}) => AddressPathAbsolute
  // /** the base path for the saveCacheManager. Defaults to basePath/fixtures */
  // fixturesPath?: (options: {basePath: AddressPathAbsolute}) => AddressPathAbsolute
  // /** the base path where content will be created (i.e. contain the various destinationPaths). Defaults to basePath/tests */
  // testsPath?: (options: {basePath: AddressPathAbsolute}) => AddressPathAbsolute
  /** skips (+clears) cache namespace for the current test file. (remember we strongly encourage single 'makeTestEnv = await setupMakeTestEnv' per test file) */
  cacheRenewNamespace?: boolean
  // /** overrides the cache location for all tests (normally taken from processNamespace/test name) */
  cacheNamespaceFolder?: string
}

type PersistentTestEnvVars = {
  basePath: AddressPathAbsolute
  cachePath: AddressPathAbsolute
  // fixturesPath: AddressPathAbsolute
  testsPath: AddressPathAbsolute

  /** path to the root of this repository instance */
  checkoutPath: AddressPathAbsolute
  // /** the mntCwd of this repository instance (mntPath = path to the mnt.ts folder). See main-cli options for mntCwd info */
  // checkoutMntCwd: AddressPathAbsolute

  cacheRenewNamespace: boolean
  cacheNamespaceFolder?: string
}
type EphemeralTestEnvVars = {
  destinationPath: AddressPathAbsolute
  // savePath?: AddressPathAbsolute

  /** used as a namespace in the subProcess as many testEnvs will be output to process.std* */
  processNamespace: string
  /** deletes and skips cache for this specific test */
  cacheRenewTest: boolean
}

export type TestContext = {
  mockStdStart: () => void
  mockStdEnd: () => Outputs
  envVars: PersistentTestEnvVars & EphemeralTestEnvVars
  /**
   Runs an oclif command. Inspired by @oclif/test - https://tinyurl.com/2gftlrbb
   Example usage: https://oclif.io/docs/testing
   */
  command: (args: string[], options?: {logLevel?: LogLevel}) => Promise<number>
}

/**
 Returnable from the run function. Will be cached in addition to the filesystem output of the process
 */
export type TestContextStorage = {
  outputs: Outputs
}

/**
 The run function receives the results of SetupFunction and will be run regardless of cache with the same data.
 Use this to setup references for your tests.
 */
export type RunFunction = (context: TestContext) => Promise<void>

// export const test = {
//   command: oclifTestWithExpect,
// }


async function doCreatePersistentTestEnvs(
  createPersistentTestEnvVars: CreatePersistentTestEnvVars
): Promise<PersistentTestEnvVars> {
  const checkoutPath = addr.pathUtils.resolve(
    addr.parsePPath(__dirname),
    // addr.parsePPath('../../../mnt-pkg-cli/src/bin')
    addr.parsePPath('../../../..')
  ) as AddressPathAbsolute

  // console.log(`checkoutPath :>> `, checkoutPath)
  // throw new Error()

  const basePath = createPersistentTestEnvVars.basePath?.() ?? addr.pathUtils.join(checkoutPath, addr.parsePath('etc/var')) as AddressPathAbsolute
  // const testsPath =
  //   createPersistentTestEnvVars.testsPath?.({basePath}) ??
  //   (addr.pathUtils.join(basePath, addr.parsePath('tests') as AddressPathRelative) as AddressPathAbsolute)
  const testsPath = addr.pathUtils.join(basePath, addr.parsePath('tests')) as AddressPathAbsolute
  // const cachePath =
  //   createPersistentTestEnvVars.cachePath?.({basePath}) ??
  //   (addr.pathUtils.join(basePath, addr.parsePath('cache') as AddressPathRelative) as AddressPathAbsolute)
  const cachePath = addr.pathUtils.join(basePath, addr.parsePath('cache')) as AddressPathAbsolute
  // const fixturesPath =
  //   createPersistentTestEnvVars.fixturesPath?.({basePath}) ??
  //   (addr.pathUtils.join(basePath, addr.parsePPath('fixtures') as AddressPathRelative) as AddressPathAbsolute)
  const cacheRenewNamespace =
    createPersistentTestEnvVars.cacheRenewNamespace ?? false
  // const cacheRenewNamespace =
  //   truthyFalsy(process.env.TEST_ENV_CACHE_RENEW) ?? createPersistentTestEnvVars.cacheRenewNamespace ?? false
  const cacheNamespaceFolder = createPersistentTestEnvVars.cacheNamespaceFolder

  // const checkoutPath = addr.packageUtils.resolveRoot({
  //   address: addr.parsePackage('root'),
  //   projectCwd: addr.pathUtils.cwd,
  //   strict: true,
  // })



  // const checkoutMntCwd = addr.pathUtils.join(
  //   checkoutPath,
  //   addr.parsePPath('orgs/monotonous/packages/mnt-pkg-cli/src/bin')
  // ) as AddressPathAbsolute

  // console.log(`addr.parsePPath('../../../../../..') :>> `, addr.parsePPath('../../../../../..'))
  // console.log(`addr.parsePPath(__dirname) :>> `, addr.parsePPath(__dirname))
  // console.log(`checkoutMntPath :>> `, checkoutMntPath, checkoutPath, addr.pathUtils.cwd)

  const testEnvVars: PersistentTestEnvVars = {
    // destinationPath:
    //   createTestEnvVars.destinationPath?.({testsPath, testName: expect.getState().currentTestName}) ??
    //   (addr.pathUtils.join(basePath, addr.parsePPath(expect.getState().currentTestName)) as AddressPathAbsolute),
    // savePath: createTestEnvVars.savePath?.({testsPath, cachePath, fixturesPath}),

    checkoutPath,
    // checkoutMntCwd,
    basePath,
    cachePath,
    // fixturesPath,
    testsPath,
    cacheRenewNamespace,
    cacheNamespaceFolder,
  }

  return testEnvVars
}

async function doCreateEphemeralTestEnvVars(
  createEphemeralTestEnvVars: CreateEphemeralTestEnvVars,
  persistentTestEnvVars: PersistentTestEnvVars,
): Promise<EphemeralTestEnvVars> {

  const processNamespace = createEphemeralTestEnvVars.processNamespace
    ? sanitise(createEphemeralTestEnvVars.processNamespace)
    : getCurrentTestNameSanitised()

  if (!processNamespace) {
    throw new Error(`'processNamespace' must be supplied else be within a valid jest test`)
  }

  const destinationPath =
      createEphemeralTestEnvVars.destinationPath?.({
        testsPath: persistentTestEnvVars.testsPath,
        testName: processNamespace,
      }) ??
      (addr.pathUtils.join(
        persistentTestEnvVars.testsPath,
        addr.parseAsType(processNamespace, 'portablePathFilename')
      ) as AddressPathAbsolute)

  const cacheRenewTest = createEphemeralTestEnvVars.cacheRenewTest ?? false

  return {
    destinationPath,
    processNamespace,
    cacheRenewTest,
  }
}

async function createCacheManager(testEnvVars: PersistentTestEnvVars): Promise<XfsCacheManager> {
  return await XfsCacheManager.initialise({
    contentBaseAddress: addr.pathUtils.join(
      testEnvVars.cachePath,
      addr.parseAsType('content', 'portablePathFilename')
    ) as AddressPathAbsolute,
    metaBaseAddress: addr.pathUtils.join(
      testEnvVars.cachePath,
      addr.parseAsType('meta', 'portablePathFilename')
    ) as AddressPathAbsolute,
    outputsBaseAddress: addr.pathUtils.join(
      testEnvVars.cachePath,
      addr.parseAsType('outputs', 'portablePathFilename')
    ) as AddressPathAbsolute,
  })
}

function getCacheNamespace(options: {cacheNamespaceFolder?: string}): string {
  return options.cacheNamespaceFolder ?? getCurrentTestFilenameSanitised()
}


export async function createPersistentTestEnv(
  createPersistentTestEnvVars: CreatePersistentTestEnvVars
): Promise<PersistentTestEnv> {

  const persistentTestEnvVars = await doCreatePersistentTestEnvs(createPersistentTestEnvVars)

  // /** do some checks that we're still set up correctly */
  // await validateTestEnvVars(persistentTestEnvVars)

  const cacheManager = await createCacheManager(persistentTestEnvVars)

  /** clear any cache at top level. This must be done at this top level  */
  if (persistentTestEnvVars.cacheRenewNamespace) {
    const namespaceExists = await cacheManager.hasNamespace({namespace: getCacheNamespace(persistentTestEnvVars)})
    const cacheEntry = await cacheManager.getCacheEntry({
      namespace: getCacheNamespace(persistentTestEnvVars),
      key: 'dummy',
    })

    // console.log(`getCacheNamespace(persistentTestEnvVars) :>> `, getCacheNamespace(persistentTestEnvVars))
    // console.log(`cacheEntry :>> `, cacheEntry)

    if (namespaceExists) {
      console.log(
        `== MNT0003: makeTestEnv#setup: NAMESPACE CACHE SKIPPED EXPLICITLY. DELETING EXISTING NAMESPACE. Content directory: '${cacheEntry.content._namespaceBase.original}' Outputs directory: '${cacheEntry.outputs._namespaceBase.original}'`
      )
      await cacheManager.removeNamespace({namespace: getCacheNamespace(persistentTestEnvVars)})
      // await xfs.removePromise(contentCachePath.address)
    } else {
      console.log(
        `== MNT0003: makeTestEnv#setup: NAMESPACE CACHE SKIPPED EXPLICITLY (NONE EXISTENT). Content directory: '${cacheEntry.content._namespaceBase.original}' Outputs directory: '${cacheEntry.outputs._namespaceBase.original}'`
      )
    }
    await cacheManager.removeNamespace({namespace: getCacheNamespace(persistentTestEnvVars)})
  }

  return {
    test: await createTestEnv(persistentTestEnvVars),
    // init: async () => {
    //   // tests folder
    //   // await xfs.removePromise(persistentTestEnvVars.testsPath.address)
    //   // await xfs.mkdirPromise(persistentTestEnvVars.testsPath.address)
    //   // if (getCurrentTestNameSanitised(false)) {
    //   //   const testPath = addr.pathUtils.join(persistentTestEnvVars.testsPath, addr.parsePPath(getCurrentTestNameSanitised()))
    //   //   console.log(`testPath.address :>> `, testPath.address)
    //   //   await xfs.removePromise(testPath.address)
    //   //   await xfs.mkdirPromise(testPath.address)
    //   //   // await xfs.mkdirPromise(persistentTestEnvVars.testsPath.address)
    //   // }
    //   // // cache folder
    //   // if (process.env.TEST_ENV_CACHE_RENEW && !cacheCleared) {
    //   //   console.log(
    //   //     `:>> CLEARING CACHE+FIXTURES FOLDER DUE TO process.env.TEST_ENV_CACHE_RENEW. YOU MUST RUN ALL TESTS TO GUARANTEE INTEGRITY`
    //   //   )
    //   //   await xfs.removePromise(persistentTestEnvVars.cachePath.address)
    //   //   await xfs.mkdirPromise(persistentTestEnvVars.cachePath.address)
    //   //   await xfs.removePromise(persistentTestEnvVars.fixturesPath.address)
    //   //   await xfs.mkdirPromise(persistentTestEnvVars.fixturesPath.address)
    //   //   cacheCleared = true
    //   // }
    // },
    reset: async () => {
      // await stdioStreamsCb()
    },
  }

}

async function setupFolders(testEnvVars: EphemeralTestEnvVars & PersistentTestEnvVars): Promise<void> {
  const doTestFolders = async () => {
    const testsFolderName = testEnvVars.processNamespace ?? getCurrentTestNameSanitised(false)
    if (!testsFolderName) {
      throw new Error(`For tests within setupFixtures, a 'processNamespace' must be supplied`)
    }
    const testPath = addr.pathUtils.join(testEnvVars.testsPath, addr.parsePPath(testsFolderName))
    await xfs.removePromise(testPath.address)
    await xfs.mkdirpPromise(testPath.address)
  }

  await doTestFolders()
}

async function createTestEnv(persistentTestEnvVars: PersistentTestEnvVars) {
  return async (createEphemeralTestEnvVars: CreateEphemeralTestEnvVars, run: RunFunction) => {

    const checkoutPath = addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('../../../..'))
    const cliPath = addr.pathUtils.join(checkoutPath, addr.parsePath('packages/pkg-cli')) as AddressPathAbsolute
    const ephemeralTestEnvVars = await doCreateEphemeralTestEnvVars(createEphemeralTestEnvVars, persistentTestEnvVars)

    function createTestContext(): TestContext {
      return {
        command: async (args: string[], options = {}) => {
          const {logLevel = 'info'} = options

          // @oclif/core::runCommand - https://tinyurl.com/2qf3qzzo
          // @oclif/core::execute - https://tinyurl.com/2hpmxhqn
          // await oclifCore.execute({type: 'cjs', dir: ephemeralTestEnvVars.destinationPath.original, args})

          // In dev mode, always show stack traces
          // oclifCore.settings.debug = development; // this just registers ts-node which isn't swc

          // @oclif/core::runCommand - https://tinyurl.com/2qf3qzzo
          // @oclif/core::execute - https://tinyurl.com/2hpmxhqn
          // await oclifCore.execute({type: 'cjs', dir: cliPath.original, args})
          console.log(`cliPath.original :>> `, cliPath.original)

          process.chdir(cliPath.original)

          const argsWithAdditional = [...args, '--log-level', logLevel]

          let exitCode = 0
          await oclifCore.run(argsWithAdditional, cliPath.original) // @oclif/core source - https://tinyurl.com/2qnt23kr
            .then((...flushArgs: any[]) => oclifCore.flush(...flushArgs))
            .catch((error) => {
              console.log(`errorwwwwwwwwwwwww :>> `, error)
              // oclifCore.Errors.handle(error)
              // return 1
              exitCode = error?.oclif.exit ?? 1
            }
          )

          return exitCode

          // return await oclifCore.({type: 'cjs', dir: checkoutMntPath.original, args})
          // return {
          //   stdout: '',
          //   stderr: '',
          // }
        },
        mockStdStart: () => {
          mockStd.stdout.start()
          mockStd.stderr.start()
        },
        mockStdEnd: () => {
          mockStd.stdout.stop()
          mockStd.stderr.stop()
          return {
              stdout: mockStd.stdout.output,
              stderr: mockStd.stderr.output,
          }
        },
        envVars: {
          ...ephemeralTestEnvVars,
          ...persistentTestEnvVars,
        },
      }
    }

    const testContext = await createTestContext()

    await setupFolders({...ephemeralTestEnvVars, ...persistentTestEnvVars})

    await run(testContext)
    // try {
    //   await run(testContext)
    // }
    // catch (err) {
    //   console.log(`err when running run() :>> `, err, testContext)
    // }
  }
}
