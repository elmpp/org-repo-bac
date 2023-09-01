// import {oclifTest, oclifExpect} from './oclif'
import { virtualFs } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import { HostCreateTree, Tree } from "@angular-devkit/schematics";
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import {
  assertIsOk,
  BaseCommand,
  consoleUtils,
  constants,
  fsUtils,
  LogLevel,
  Outputs,
  Result,
  // ServiceOptions,
  schematicUtils,
  ServiceMap,
  ServiceStaticMap,
  XfsCacheManager,
} from "@business-as-code/core";
import {
  ArgsInfer,
  FlagsInfer,
} from "@business-as-code/core/commands/base-command";
import {
  BacError,
  BacErrorWrapper,
  MessageName,
} from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";
import * as oclifCore from "@oclif/core";
import { ParserOutput } from "@oclif/core/lib/interfaces/parser";
import { ExpectUtil } from "./jest-utils";
import { HostCreateLazyTree } from "./schematics/schematics-host-lazy-tree";
import { SchematicsRunCommand } from "./schematics/schematics-run-command";
import {
  getCurrentTestFilenameSanitised,
  getCurrentTestNameSanitised,
  sanitise,
} from "./test-utils";

// const oclifTestWithExpect = Object.assign(oclifTest, {expect: oclifExpect})

type ServiceOptionsTestLite<SName extends keyof ServiceStaticMap> = Omit<
  schematicUtils.ServiceOptions<SName>,
  "initialiseOptions" | "context"
> & {
  initialiseOptions: Omit<
    schematicUtils.ServiceOptions<SName>["initialiseOptions"],
    "context" | "workspacePath"
  >;
};

export type UnwrapPromise<T> = T extends PromiseLike<infer U>
  ? UnwrapPromise<U>
  : T;

export type PersistentTestEnv = {
  /** main interface for creating tests */
  test: UnwrapPromise<ReturnType<typeof createTestEnv>>;
  // /** call to clear tests folder, probably on beforeEach */
  // init: () => Promise<void>
  /** clears up. Mainly jest mocking etc */
  reset: () => Promise<void>;
};

type CreateEphemeralTestEnvVars = {
  /** the ultimate path where content will be created. Defaults to `${basePath}/${testName}` which is the jest test name */
  workspacePath?: (options: {
    testsPath: AddressPathAbsolute;
    testName: string;
    checkoutPath: AddressPathAbsolute;
  }) => AddressPathAbsolute;
  /** supply if you want to save a copy of the content (if tests pass) */
  savePath?: (options: {
    testsPath: AddressPathAbsolute;
    cachePath: AddressPathAbsolute;
    fixturesPath: AddressPathAbsolute;
  }) => AddressPathAbsolute;
  // /** any persistent plugins for the destination content */
  // persistentPlugins?: AddressPackageDescriptorString[]
  // /** any ephemeral plugins for the destination content */
  // ephemeralPlugins?: AddressPackageDescriptorString[]
  // initialPlugins?: {ident: string, range: string}[]
  // initialPlugins?: PluginMap

  // /** used as the test folder names. This is required when within setupFixtures() */
  // processNamespace?: string;
  /** remove cache for individual test. Deletes at a test level, not namespace */
  cacheRenewTest?: boolean;
};

type CreatePersistentTestEnvVars = {
  // /** the ultimate path where content will be created. Defaults to `${basePath}/${testName}` which is the jest test name */
  // destinationPath?: (options: {testsPath: AddressPathAbsolute; testName: string}) => AddressPathAbsolute
  // /** supply if you want to save a copy of the content (if tests pass) */
  // savePath?: (options: {testsPath: AddressPathAbsolute, cachePath: AddressPathAbsolute, fixturesPath: AddressPathAbsolute}) => AddressPathAbsolute
  /** the base path for further folders. We do this to allow cache and content folders to be contained */
  // basePath?: () => AddressPathAbsolute;
  // /** a test filename must include a -stage[0-9] suffix to  */
  // testFilename?: () => string;
  // /** the cache base path. Tests are free to save cache entries that will allow be within here. Defaults to basePath/cache */
  // cachePath?: (options: {basePath: AddressPathAbsolute}) => AddressPathAbsolute
  // /** the base path for the saveCacheManager. Defaults to basePath/fixtures */
  // fixturesPath?: (options: {basePath: AddressPathAbsolute}) => AddressPathAbsolute
  // /** the base path where content will be created (i.e. contain the various destinationPaths). Defaults to basePath/tests */
  // testsPath?: (options: {basePath: AddressPathAbsolute}) => AddressPathAbsolute
  /** skips (+clears) cache namespace for the current test file. (remember we strongly encourage single 'makeTestEnv = await setupMakeTestEnv' per test file) */
  cacheRenewNamespace?: boolean;
  // /** overrides the cache location for all tests (normally taken from processNamespace/test name). Can only be an augmented key of Stage1Content */
  cacheNamespaceFolder?: keyof Stage1Content;
  /** test must declare the cliSource it produces. Mandatory for stage1 tests */
  cliSource?: "cliRegistry" | "cliLinked";
  /** default value for further processes */
  defaultLogLevel?: LogLevel;
};

type PersistentTestEnvVars = {
  basePath: AddressPathAbsolute;
  cachePath: AddressPathAbsolute;
  // fixturesPath: AddressPathAbsolute
  testsPath: AddressPathAbsolute;

  /** path to the root of this repository instance */
  checkoutPath: AddressPathAbsolute;
  /** path to the cli package root of this repository instance */
  checkoutCliPath: AddressPathAbsolute;
  /** path to the pkg-test-specs-fixtures package root */
  fixturesPath: AddressPathAbsolute;
  // /** the mntCwd of this repository instance (mntPath = path to the mnt.ts folder). See main-cli options for mntCwd info */
  // checkoutMntCwd: AddressPathAbsolute
  defaultLogLevel: LogLevel;

  /** the git-server key-gens an sshKey each time it starts up - private */
  sshPrivateKeyPath: AddressPathAbsolute;
  /** the git-server key-gens an sshKey each time it starts up - public */
  sshPublicKeyPath: AddressPathAbsolute;

  cacheRenewNamespace: boolean;
  cacheNamespaceFolder?: string;

  stage: `stage${number}`;
  cliSource: "cliRegistry" | "cliLinked" | undefined;
  cliSourceActive: "cliRegistry" | "cliLinked";
};
type EphemeralTestEnvVars = {
  workspacePath: AddressPathAbsolute;
  // savePath?: AddressPathAbsolute

  // /** all tests will be bucketed into a stage[0-9] */
  // stage: `stage${number}`;

  /** test output goes into this folder */
  folderName: string;

  /** deletes and skips cache for this specific test */
  cacheRenewTest: boolean;
};
export type TestEnvVars = PersistentTestEnvVars & EphemeralTestEnvVars;

export type TestContext = {
  /** only pass the workspace base path. This location should always carry a cli dependency and thus be resolvable */
  setActiveWorkspacePaths: (workspacePaths: {
    workspace: AddressPathAbsolute;
  }) => void;
  copy: (
    sourcePath: keyof Stage1Content,
    // sourcePath: AddressPathRelative,
    destinationPath: AddressPathAbsolute
  ) => Promise<
    Result<
      { exitCode: number; expectUtil: ExpectUtil },
      { exitCode: number; error: Error; expectUtil: ExpectUtil }
    >
  >;
  // mockStdStart: () => void;
  // mockStdEnd: (flush?: boolean) => Outputs;
  testEnvVars: TestEnvVars;
  /**
   Runs an oclif command. Inspired by @oclif/test - https://tinyurl.com/2gftlrbb
   Example usage: https://oclif.io/docs/testing
   */
  command: (
    args: string[],
    options?: { logLevel?: LogLevel }
  ) => Promise<
    Result<
      { exitCode: number; expectUtil: ExpectUtil },
      { exitCode: number; error: Error; expectUtil: ExpectUtil }
    >
  >;
  /**
   Allows a schematic to be run directly without going through the cli arg parsing etc
   */
  runSchematic: (options: {
    parseOutput: ParserOutput<
      FlagsInfer<typeof SchematicsRunCommand>,
      FlagsInfer<typeof SchematicsRunCommand>,
      ArgsInfer<typeof SchematicsRunCommand>
    >;
    // schematicAddress: string,
    // workspacePath: string,
  }) => Promise<
    Result<
      { exitCode: number; expectUtil: ExpectUtil },
      { exitCode: number; error: Error; expectUtil: ExpectUtil }
    >
  >;
  /**
   Allows a service task to be run directly
   */
  runServiceCb: <SName extends keyof ServiceMap>(
    options: {
      serviceOptions: ServiceOptionsTestLite<SName>;
      /** optional Source path for the Rule. Defaults to an empty() Source */
      originPath?: AddressPathAbsolute;
      /** optionally pass in an existing Tree. Useful for running assertions after a successful Schematic run */
      tree?: Tree;
    }
    // options: {
    //   cb: (options: {
    //     service: Services[SName];
    //     serviceName: SName;
    //   }) => Promise<void>;
    //   // }) => ReturnType<TaskExecutor<ServiceExecTaskOptions>>;
    //   serviceName: SName;
    //   /**  */
    //   // initialiseOptions: Exclude<Parameters<ServicesStatic[SName]['initialise']>[0], ServiceInitialiseOptions> extends never ? Record<never, never> | undefined : Exclude<Parameters<ServicesStatic[SName]['initialise']>[0], ServiceInitialiseOptions>
    //   initialiseOptions: (IsEmptyObject<
    //     Omit<
    //       Parameters<ServicesStatic[SName]["initialise"]>[0],
    //       keyof ServiceInitialiseOptions
    //     >
    //   > extends true
    //     ? Record<never, any>
    //     : Omit<
    //         Parameters<ServicesStatic[SName]["initialise"]>[0],
    //         keyof ServiceInitialiseOptions
    //       >) & {workingPath?: string};
    //   // serviceName: SName
    //   // cb: Parameters<typeof wrapServiceAsRule<SName>>[0];
    //   // /** optional Source path for the Rule. Defaults to an empty() Source */
    //   originPath?: AddressPathAbsolute;
    //   /** optionally pass in an existing Tree. Useful for running assertions after a successful Schematic run */
    //   tree?: Tree;
    //   // parseOutput: ParserOutput<
    //   //   FlagsInfer<typeof SchematicsRunCommand>,
    //   //   FlagsInfer<typeof SchematicsRunCommand>,
    //   //   ArgsInfer<typeof SchematicsRunCommand>
    //   // >,
    //   // schematicAddress: string,
    //   // workspacePath: string,
    // } & {}
  ) => Promise<Result<{ exitCode: number; expectUtil: ExpectUtil }, never>>;
  // runSchematic: (options: {
  //   args: any[];
  //   flags: any[];
  //   schematicAddress: string,
  //   workspacePath: string,
  //   logLevel?: LogLevel,
  //   // destinationPath
  // }) => Promise<Result<{ exitCode: number; tree: Tree }, { exitCode: number }>>;
};

/**
 Returnable from the run function. Will be cached in addition to the filesystem output of the process
 */
export type TestContextStorage = {
  outputs: Outputs;
};

/**
 The run function receives the results of SetupFunction and will be run regardless of cache with the same data.
 Use this to setup references for your tests.
 */
export type RunFunction = (context: TestContext) => Promise<void>;

// export const test = {
//   command: oclifTestWithExpect,
// }

const basePaths = {
  /** single test that smoke tests the test setup */
  stage0: addr.parsePath(`${constants.TMP_ROOT}/stage0`) as AddressPathAbsolute,
  /** heavy scaffolding that will be made available to successive stages via testContext.copy() */
  stage1: addr.parsePath(`${constants.TMP_ROOT}/stage1`) as AddressPathAbsolute,
  /** stage2 tests */
  stage2: addr.parsePath(`${constants.TMP_ROOT}/stage2`) as AddressPathAbsolute,
  /** stage3 tests */
  stage3: addr.parsePath(`${constants.TMP_ROOT}/stage3`) as AddressPathAbsolute,
};

const checkoutPath = addr.pathUtils.resolve(
  addr.parsePPath(__dirname),
  // addr.parsePPath('../../../mnt-pkg-cli/src/bin')
  addr.parsePPath("../../../..")
) as AddressPathAbsolute;
const checkoutCliPath = addr.pathUtils.join(
  checkoutPath,
  addr.parsePath("packages/pkg-cli")
) as AddressPathAbsolute;

async function doCreatePersistentTestEnvs(
  createPersistentTestEnvVars: CreatePersistentTestEnvVars
): Promise<PersistentTestEnvVars> {
  // console.log(`checkoutPath :>> `, checkoutPath)
  // throw new Error()

  const testFilename = getCurrentTestFilenameSanitised();

  // if (!!testFilename.match(/-stage[0-9]$/)) {
  //   throw new Error(`All testEnv tests must live within a test file with filename /[^/s]+-stage[0-9]$/. This is used for grouping when running + defines the basePath for outputted content`)
  // }

  const getStageAndFolderName = (
    testName: string,
    testFileName: string
  ): [folderName: string, stage: `stage${number}`] => {
    const matches = testFileName.match(/^.*-(stage[0-9]+)\..*$/);
    if (!matches?.[1]) {
      throw new Error(`Test file must be suffixed with -stage[0-9].spec.ts`);
    }
    return [sanitise(testName), matches![1] as `stage${number}`];
  };

  const [_folderName, stage] = getStageAndFolderName(
    createPersistentTestEnvVars.cacheNamespaceFolder
      ? sanitise(createPersistentTestEnvVars.cacheNamespaceFolder)
      : getCurrentTestNameSanitised(),
    testFilename
  );

  // const basePath =
  //   createPersistentTestEnvVars.basePath?.() ??
  //   (addr.parsePath("/tmp/bac-tests") as AddressPathAbsolute);

  // const stageFromTestFilename = testFilename.match(/-(stage[0-9])\.spec\.[tj]sx?$/)?.[1]
  // const stageFromTestFilename = testEnvVars.
  if (!stage || !basePaths[stage as keyof typeof basePaths]) {
    throw new Error(
      `All testEnv tests must live within a test file with filename /[^/s]+-stage[0-9]$/. This is used for grouping when running + defines the basePath for outputted content. Filename found: '${testFilename}'. StageNames key found: '${stage}', BasePaths: '${Object.keys(
        basePaths
      )}'`
    );
  }
  const basePath = basePaths[stage as keyof typeof basePaths];

  // const basePath = createPersistentTestEnvVars.basePath?.() ?? addr.pathUtils.join(checkoutPath, addr.parsePath('etc/var')) as AddressPathAbsolute
  // const testsPath =
  //   createPersistentTestEnvVars.testsPath?.({basePath}) ??
  //   (addr.pathUtils.join(basePath, addr.parsePath('tests') as AddressPathRelative) as AddressPathAbsolute)
  const testsPath = addr.pathUtils.join(
    basePath,
    addr.parsePath("tests")
  ) as AddressPathAbsolute;
  // const cachePath =
  //   createPersistentTestEnvVars.cachePath?.({basePath}) ??
  //   (addr.pathUtils.join(basePath, addr.parsePath('cache') as AddressPathRelative) as AddressPathAbsolute)
  const cachePath = addr.pathUtils.join(
    basePath,
    addr.parsePath("cache")
  ) as AddressPathAbsolute;
  // const fixturesPath =
  //   createPersistentTestEnvVars.fixturesPath?.({basePath}) ??
  //   (addr.pathUtils.join(basePath, addr.parsePPath('fixtures') as AddressPathRelative) as AddressPathAbsolute)
  const cacheRenewNamespace =
    createPersistentTestEnvVars.cacheRenewNamespace ?? false;
  // const cacheRenewNamespace =
  //   truthyFalsy(process.env.TEST_ENV_CACHE_RENEW) ?? createPersistentTestEnvVars.cacheRenewNamespace ?? false
  const cacheNamespaceFolder = createPersistentTestEnvVars.cacheNamespaceFolder
    ? sanitise(createPersistentTestEnvVars.cacheNamespaceFolder)
    : undefined;
  const defaultLogLevel = createPersistentTestEnvVars.defaultLogLevel ?? "info";

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

  // const testsCoreRoot = addr.packageUtils.resolveRoot({address: addr.parsePackage('@business-as-code/tests-core'), projectCwd: addr.parseAsType(__dirname, 'portablePathPosixAbsolute'), strict: true})
  const testsFixturesRoot = addr.pathUtils.resolve(
    addr.parsePath(__dirname),
    addr.parsePath("../../pkg-tests-specs-fixtures")
  );

  const cliSource = createPersistentTestEnvVars.cliSource;
  if (stage === "stage1" && !cliSource) {
    throw new Error(`Stage1 tests must declare their 'cliSource'!!`);
  }

  const testEnvVars: PersistentTestEnvVars = {
    // destinationPath:
    //   createTestEnvVars.workspacePath?.({testsPath, testName: expect.getState().currentTestName}) ??
    //   (addr.pathUtils.join(basePath, addr.parsePPath(expect.getState().currentTestName)) as AddressPathAbsolute),
    // savePath: createTestEnvVars.savePath?.({testsPath, cachePath, fixturesPath}),

    checkoutPath,
    checkoutCliPath,
    defaultLogLevel,
    // checkoutMntCwd,
    basePath,
    cachePath,
    fixturesPath: testsFixturesRoot,
    testsPath,
    cacheRenewNamespace,
    cacheNamespaceFolder,
    stage,
    sshPrivateKeyPath: addr.pathUtils.join(
      addr.pathUtils.resolve(
        addr.parsePath(__dirname) as AddressPathAbsolute,
        addr.parsePath("../../pkg-tests-git-mock-server")
      ),
      addr.parsePath("id_rsa")
    ) as AddressPathAbsolute,
    sshPublicKeyPath: addr.pathUtils.join(
      addr.pathUtils.resolve(
        addr.parsePath(__dirname) as AddressPathAbsolute,
        addr.parsePath("../../pkg-tests-git-mock-server")
      ),
      addr.parsePath("id_rsa.pub")
    ) as AddressPathAbsolute,
    // sshPrivateKeyPath: addr.pathUtils.join(
    //   addr.packageUtils.resolveRoot({
    //     address: addr.parsePackage("@business-as-code/tests-git-server"),
    //     projectCwd: addr.pathUtils.dirname(addr.parsePath(__dirname)) as AddressPathAbsolute,
    //     strict: true,
    //   }),
    //   addr.parsePath("id_rsa")
    // ) as AddressPathAbsolute,
    /** the current test has declared how its cli should be sourced. This really only applies to stage1 tests */
    cliSource,
    /** the test run has been ran with a cliSource */
    cliSourceActive: process.env.BAC_TEST_CLISOURCE as
      | "cliRegistry"
      | "cliLinked",
  };

  return testEnvVars;
}

async function doCreateEphemeralTestEnvVars(
  createEphemeralTestEnvVars: CreateEphemeralTestEnvVars,
  persistentTestEnvVars: PersistentTestEnvVars
): Promise<EphemeralTestEnvVars> {
  const folderNameSanitised = persistentTestEnvVars.cacheNamespaceFolder
    ? sanitise(persistentTestEnvVars.cacheNamespaceFolder)
    : getCurrentTestNameSanitised();
  // const processNamespace = createEphemeralTestEnvVars.processNamespace
  //   ? sanitise(createEphemeralTestEnvVars.processNamespace)
  //   : getCurrentTestNameSanitised();

  // const getStageAndFolderName = (testName: string, testFileName: string): [folderName: string, stage: `stage${number}`] => {
  //   const matches = testFileName.match(/^.*-(stage[0-9]+)\..*$/)
  //   if (!matches?.[1]) {
  //     throw new Error(`Test file must be suffixed with -stage[0-9].spec.ts`)
  //   }
  //   return [testName, matches![1] as `stage${number}`]
  // }

  // const [folderName, stage] = getStageAndFolderName(folderNameSanitised, getCurrentTestFilenameSanitised())

  // if (!folderName) {
  //   throw new Error(
  //     `'processNamespace' must be supplied else be within a valid jest test`
  //   );
  // }

  const workspacePath =
    createEphemeralTestEnvVars.workspacePath?.({
      testsPath: persistentTestEnvVars.testsPath,
      testName: folderNameSanitised,
      checkoutPath,
    }) ??
    (addr.pathUtils.join(
      persistentTestEnvVars.testsPath,
      // addr.parseAsType(stage, "portablePathFilename"),
      addr.parseAsType(folderNameSanitised, "portablePathFilename")
    ) as AddressPathAbsolute);

  const cacheRenewTest = createEphemeralTestEnvVars.cacheRenewTest ?? false;

  return {
    workspacePath,
    folderName: folderNameSanitised,
    cacheRenewTest,
  };
}

async function createCacheManager(
  testEnvVars: PersistentTestEnvVars
): Promise<XfsCacheManager> {
  return await XfsCacheManager.initialise({
    contentBaseAddress: addr.pathUtils.join(
      testEnvVars.cachePath,
      addr.parseAsType("content", "portablePathFilename")
    ) as AddressPathAbsolute,
    metaBaseAddress: addr.pathUtils.join(
      testEnvVars.cachePath,
      addr.parseAsType("meta", "portablePathFilename")
    ) as AddressPathAbsolute,
    outputsBaseAddress: addr.pathUtils.join(
      testEnvVars.cachePath,
      addr.parseAsType("outputs", "portablePathFilename")
    ) as AddressPathAbsolute,
  });
}

function getCacheNamespace(options: { cacheNamespaceFolder?: string }): string {
  return options.cacheNamespaceFolder ?? getCurrentTestFilenameSanitised();
}

export async function createPersistentTestEnv(
  createPersistentTestEnvVars: CreatePersistentTestEnvVars
): Promise<PersistentTestEnv> {
  const persistentTestEnvVars = await doCreatePersistentTestEnvs(
    createPersistentTestEnvVars
  );

  // /** do some checks that we're still set up correctly */
  // await validateTestEnvVars(persistentTestEnvVars)

  const cacheManager = await createCacheManager(persistentTestEnvVars);

  /** clear any cache at top level. This must be done at this top level  */
  if (persistentTestEnvVars.cacheRenewNamespace) {
    const namespaceExists = await cacheManager.hasNamespace({
      namespace: getCacheNamespace(persistentTestEnvVars),
    });
    const cacheEntry = await cacheManager.getCacheEntry({
      namespace: getCacheNamespace(persistentTestEnvVars),
      key: "dummy",
    });

    // console.log(`getCacheNamespace(persistentTestEnvVars) :>> `, getCacheNamespace(persistentTestEnvVars))
    // console.log(`cacheEntry :>> `, cacheEntry)

    if (namespaceExists) {
      console.log(
        `== MNT0003: makeTestEnv#setup: NAMESPACE CACHE SKIPPED EXPLICITLY. DELETING EXISTING NAMESPACE. Content directory: '${cacheEntry.content._namespaceBase.original}' Outputs directory: '${cacheEntry.outputs._namespaceBase.original}'`
      );
      await cacheManager.removeNamespace({
        namespace: getCacheNamespace(persistentTestEnvVars),
      });
      // await xfs.removePromise(contentCachePath.address)
    } else {
      console.log(
        `== MNT0003: makeTestEnv#setup: NAMESPACE CACHE SKIPPED EXPLICITLY (NONE EXISTENT). Content directory: '${cacheEntry.content._namespaceBase.original}' Outputs directory: '${cacheEntry.outputs._namespaceBase.original}'`
      );
    }
    await cacheManager.removeNamespace({
      namespace: getCacheNamespace(persistentTestEnvVars),
    });
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
  };
}

async function setupFolders(
  testEnvVars: EphemeralTestEnvVars & PersistentTestEnvVars
): Promise<void> {
  const doTestFolders = async () => {
    const testsFolderName =
      testEnvVars.folderName ?? getCurrentTestNameSanitised(false);
    if (!testsFolderName) {
      throw new Error(`testsFolderName not found`);
    }

    const testPath = addr.pathUtils.join(
      testEnvVars.testsPath,
      addr.parsePath(testsFolderName)
    );
    await xfs.removePromise(testPath.address);
    await xfs.mkdirpPromise(testPath.address);
  };

  await doTestFolders();
}

/**
 we take a virtualFs of the fs after the tests but monkeypatch some methods to inspect the actual FS also
 because schematics has some weird assumptions

 virtualFs tree (i.e. same as schematics) - https://tinyurl.com/2mj4lzfv
 */
function createTree(workspacePath: string): Tree {
  // function createTree(workspacePath: string): SchematicsResettableHostTree {
  // const tree = new SchematicsResettableHostTree(
  //   new SchematicResettableScopedNodeJsSyncHost(
  //     workspacePath as any,
  //   )
  // );
  // const tree = new HostCreateTree(
  //   new SchematicResettableScopedNodeJsSyncHost(
  //     workspacePath as any,
  //   )
  // );
  // const tree = new DelegateTree(
  //   // new SchematicResettableScopedNodeJsSyncHost(workspacePath as Path)
  // );
  // const tree = new HostCreateTree(
  //   new SchematicResettableScopedNodeJsSyncHost(workspacePath as Path)
  // );

  // console.log(`schematicUtils. :>> `, schematicUtils.getHostRoot(tree))
  // const tree = new DelegateTree(new virtualFs.ScopedHost(
  //     new NodeJsSyncHost(),
  //     workspacePath as any,
  //   ))
  // class UnitTestTree extends DelegateTree {
  //   get files() {
  //     const result: string[] = [];
  //     this.visit((path) => result.push(path));

  //     return result;
  //   }

  //   readContent(path: string): string {
  //     const buffer = this.read(path);
  //     if (buffer === null) {
  //       return '';
  //     }

  //     return buffer.toString();
  //   }
  // }
  // const tree = new UnitTestTree(new NodeJsAsyncHost)

  // loads a host tree that does not do an upfront records load and instead hits its backend for exists checks etc - DOES NOT WORK FOR TREE.GETTEXT/GETJSON ETC
  // const tree = new HostTree(
  //   // const liveFsTree = new HostCreateTree(
  //   new virtualFs.ScopedHost(
  //     new NodeJsSyncHost(),
  //     workspacePath as Path,
  //   )
  // );

  const tree = new HostCreateLazyTree(
    new virtualFs.ScopedHost(new NodeJsSyncHost(), workspacePath as any)
  );
  // const tree = new HostCreateLazyTree(
  //   new virtualFs.ScopedHost(new NodeJsSyncHost(), workspacePath as any)
  // );

  // const tree = new HostCreateTree(
  //   new virtualFs.ScopedHost(
  //     new NodeJsSyncHost(),
  //     workspacePath as any,
  //   )
  // );
  // const tree = new SchematicResettableScopedNodeJsSyncHost(workspacePath as Path);

  // const origExists = tree.exists
  // tree.exists = (filePath: string) => {
  //   const origRes = origExists(filePath)
  //   if (origRes) {
  //     return origRes
  //   }
  //   return fs.existsSync(filePath)
  // }

  // return Object.assign(tree, {
  //   /**
  //    improved exists that supports folders and checks the actual FS
  //    Original Schematics GH implementation - https://github.com/angular/angular-cli/blob/8095268fa4e06c70f2f11323cff648fc6d4aba7d/packages/angular_devkit/schematics/src/tree/host-tree.ts#L330
  //    */
  //   // exists(this: HostTree, filePath: string): boolean {
  //   //   const origRes = (this as any)._recordSync.exists(this._normalizePath(filePath)); // .exists checks both file and folder and actually hits the FS so all good!
  //   //   console.log(`(this as any)._recordSync :>> `, (this as any)._recordSync)
  //   //   console.log(`this._normalizePath(filePath) :>> `, this._normalizePath(filePath))
  //   //   return origRes
  //   // },
  //   // getDir(this: SchematicResettableScopedNodeJsSyncHost, filePath: string): boolean {
  //   //   const origRes = (this as any)._recordSync.exists(this._normalizePath(filePath)); // .exists checks both file and folder and actually hits the FS so all good!
  //   //   return origRes
  //   // },
  // });

  return tree;
}

function validateTestEnv({
  testEnvVars,
  createEphemeralTestEnvVars,
}: {
  testEnvVars: TestEnvVars;
  createEphemeralTestEnvVars: CreateEphemeralTestEnvVars;
}) {
  // we expect the cliSource to be present in the environment
  if (
    !["cliRegistry", "cliLinked"].includes(process.env.BAC_TEST_CLISOURCE ?? "")
  ) {
    throw new Error(
      `Tests must be ran with BAC_TEST_CLISOURCE. Possible values: ['cliRegistry', 'cliLinked']`
    );
  }
  if (testEnvVars.stage === "stage1" && !testEnvVars.cacheNamespaceFolder) {
    throw new Error(
      `When producing stage1 content, an explicit cacheNamespaceFolder must be provided (and be augmented into the 'Stage1Content' interface)`
    );
  }
  if (testEnvVars.cacheNamespaceFolder) {
    if (testEnvVars.cacheNamespaceFolder !== testEnvVars.folderName) {
      throw new Error(
        `FolderName has not been set from the supplied cacheNamespaceFolder. Supplied: '${testEnvVars.cacheNamespaceFolder}', folderName: '${testEnvVars.folderName}'`
      );
    }
    if (testEnvVars.cacheNamespaceFolder.match(/['"]/)) {
      throw new Error(
        `CacheNamespaceFolder still contains quote characters. Has it been ran through sanitise()?. Supplied: '${testEnvVars.cacheNamespaceFolder}'`
      );
    }
  }

  if (testEnvVars.folderName.match(/['"]/)) {
    throw new Error(
      `folderName still contains quote characters. Has it been ran through sanitise()?. Supplied: '${testEnvVars.folderName}'`
    );
  }

  // console.log(`testEnvVars :>> `, testEnvVars, createEphemeralTestEnvVars)

  // do some validation
}

async function createTestEnv(persistentTestEnvVars: PersistentTestEnvVars) {
  return async (
    createEphemeralTestEnvVars: CreateEphemeralTestEnvVars,
    run: RunFunction
  ) => {
    const checkoutPath = addr.pathUtils.resolve(
      addr.parsePath(__dirname),
      addr.parsePath("../../../..")
    );
    /** default to the checkout path cli package */
    let activeWorkspacePaths: {
      workspace: AddressPathAbsolute;
      cli: AddressPathAbsolute;
    } = {
      workspace: checkoutPath,
      cli: addr.pathUtils.join(
        checkoutPath,
        addr.parsePath("packages/pkg-cli")
      ) as AddressPathAbsolute,
    };

    const getActiveCliPath = () => activeWorkspacePaths;

    const ephemeralTestEnvVars = await doCreateEphemeralTestEnvVars(
      createEphemeralTestEnvVars,
      persistentTestEnvVars
    );
    const testEnvVars = { ...ephemeralTestEnvVars, ...persistentTestEnvVars };

    await validateTestEnv({ testEnvVars, createEphemeralTestEnvVars });

    // if the test has been wrapped in a describe block of 'cliRegistry|cliLinked' we'll just skip it based on the env var
    // console.log(`testEnvVars :>> `, testEnvVars)

    function createTestContext(): TestContext {
      return {
        setActiveWorkspacePaths: (workspacePaths: {
          workspace: AddressPathAbsolute;
          // cli: AddressPathAbsolute;
        }) => {
          if (workspacePaths.workspace.original.endsWith("pkg-cli"))
            throw new Error(
              `Should be a project root, not the checkoutCliPath. Perhaps workspacePath?`
            );
          try {
            const workspaceCliPath = addr.packageUtils.resolveRoot({
              address: addr.parsePackage("@business-as-code/cli"),
              projectCwd: workspacePaths.workspace,
              strict: true,
            });
            activeWorkspacePaths = {
              ...workspacePaths,
              cli: workspaceCliPath,
            };
          } catch (err) {
            throw new BacErrorWrapper(
              MessageName.UNNAMED,
              `Project base does not allow resolving of @business-as-code/cli. Perhaps you need to run package manager?`,
              err as Error
            );
          }
          console.log(`activeWorkspacePath :>> `, activeWorkspacePaths);
        },
        /** copies from the initialise tranche of tests */
        copy: async (
          sourcePathRel: keyof Stage1Content,
          destinationPath: AddressPathAbsolute
        ) => {
          const sourcePathRelSanitised = sanitise(sourcePathRel);
          // assumes copy from stage1 test
          const testStagePath = basePaths["stage1" as keyof typeof basePaths];
          // const sourcePath = addr.pathUtils.join(testStagePath, addr.parsePath('tests'), addr.parsePath(`${sourcePathRel.original}`));
          // const sourcePath = addr.pathUtils.join(testStagePath, addr.parsePath('tests'), addr.parsePath(`${sourcePathRel.original} - ${process.env.BAC_TEST_CLISOURCE}`));
          const sourcePath = addr.pathUtils.join(
            testStagePath,
            addr.parsePath("tests"),
            addr.parsePath(`${sourcePathRelSanitised}`)
          );

          if (!xfs.existsPromise(sourcePath.address)) {
            throw new Error(
              `testEnv#copy: attempting to copy nonexistent sourcePath: '${sourcePath.original}' -> '${destinationPath.original}'. Stage: 'stage1'. Have those stage's tests been ran?`
            );
          }

          await xfs.copyPromise(destinationPath.address, sourcePath.address);

          // await xfs.removePromise(addr.pathUtils.join(destinationPath, addr.parsePath('node_modules')).address)

          const tree = createTree(testEnvVars.workspacePath.original);
          const expectUtil = new ExpectUtil({
            testEnvVars,
            outputs: {
              stdout: "",
              stderr: "",
            },
            tree: tree as Tree,
            exitCode: 0,
          });

          return {
            success: true,
            res: {
              exitCode: 0,
              expectUtil,
            },
          };
        },
        command: async (args: string[], options = {}) => {
          const { logLevel = testEnvVars.defaultLogLevel } = options;

          // @oclif/core::runCommand - https://tinyurl.com/2qf3qzzo
          // @oclif/core::execute - https://tinyurl.com/2hpmxhqn
          // await oclifCore.execute({type: 'cjs', dir: ephemeralTestEnvVars.workspacePath.original, args})

          // In dev mode, always show stack traces
          // oclifCore.settings.debug = development; // this just registers ts-node which isn't swc

          // @oclif/core::runCommand - https://tinyurl.com/2qf3qzzo
          // @oclif/core::execute - https://tinyurl.com/2hpmxhqn
          // await oclifCore.execute({type: 'cjs', dir: cliPath.original, args})
          // console.log(`cliPath.original :>> `, cliPath.original)

          const activeCheckoutPaths: {
            workspace: AddressPathAbsolute;
            cli: AddressPathAbsolute;
          } = getActiveCliPath();

          // const activeCliPath = testEnvVars.checkoutPath;

          // process.chdir(checkoutPath.original);
          // process.chdir(activeCliPath.original); // the root oclif param handles this

          const argsWithAdditional =
            args[0] === "help" ? args : [...args, "--logLevel", logLevel];
          // console.log(`argsWithAdditional :>> `, argsWithAdditional)
          // console.log(
          //   `argsWithAdditional, cliPath.original, process.cwd() :>> `,
          //   argsWithAdditional,
          //   cliPath.original,
          //   process.cwd()
          // );

          // console.log(`cliPath :>> `, checkoutCliPath)

          // breaks --json tests!!!
          // process.stdout.write(
          //   `Running command. Command: '${argsWithAdditional.join(
          //     " "
          //   )}'. Cwd: '${process.cwd()}'. Full command: 'cd ${
          //     process.cwd()
          //   }; pnpm bac-test ${argsWithAdditional.join(" ")}'` + EOL
          // );

          let exitCode = 0;
          let error = undefined;
          mockStdStart();

          oclifCore.settings.debug = true;

          console.log(
            `activeCliPaths.original, process.cwd() :>> `,
            activeCheckoutPaths,
            process.cwd()
          );

          /**  */
          await oclifCore
            .run(argsWithAdditional, {
              root: activeCheckoutPaths.cli.original, // needs to be location with the Oclif package.json definitions
              debug: {
                debug: 9,
                info: 7,
                warn: 5,
                error: 3,
                fatal: 1,
              }[logLevel],
              // debug: 9,
            }) // @oclif/core source - https://tinyurl.com/2qnt23kr
            .then((...flushArgs: any[]) => oclifCore.flush(...flushArgs))
            .catch((anError) => {
              // TO DEBUG STUFF HERE, RUN WITH `DEBUG=* !!`

              BaseCommand.handleError({
                err: anError,
                exitProcess: false,
                extra: {
                  args: argsWithAdditional,
                  logLevel,
                  cwd: activeCheckoutPaths.cli.original, // this is what Oclif would have done
                  // cwd: process.cwd(),
                  // argv: process.argv,
                  // cwd: checkoutCliPath.original,
                },
              }); // for parity with bin/{dev.ts,cmd.ts}

              /**
               DO NOT DO ANY ADDITIONAL PROCESS OUT LOGGING. MUST RELY ON ONLY THE REPORTING WITHIN .CATCH ETC ONLY WHEN TESTING - see BaseCommand#catch
               */

              exitCode = anError?.oclif?.exit ?? 1;
              error = anError;

              // oclifCore.Errors.handle(anError) // for parity with bin/{dev.ts,cmd.ts}
            });

          const outputs = mockStdEnd();

          const tree = createTree(testEnvVars.workspacePath.original);
          const expectUtil = new ExpectUtil({
            testEnvVars,
            outputs,
            tree: tree as Tree,
            exitCode,
          });

          if (exitCode === 0) {
            // create a virtualFs tree (i.e. same as schematics) - https://tinyurl.com/2mj4lzfv

            return {
              success: true,
              res: {
                exitCode,
                expectUtil,
              },
            };
          }

          return {
            success: false,
            res: {
              exitCode,
              error: BacError.fromError(
                error ??
                  `Command exited with non-zero code. See stderr for more info`
              ),
              expectUtil,
            },
          };

          // return {
          //   success: false,
          //   res: {
          //     exitCode,
          //     expectUtil,
          //     error:
          //     // tree,
          //   },
          // };

          // return await oclifCore.({type: 'cjs', dir: checkoutMntPath.original, args})
          // return {
          //   stdout: '',
          //   stderr: '',
          // }
        },
        runSchematic: async ({ parseOutput }) => {
          // runSchematic: async ({args, flags, schematicAddress, workspacePath, logLevel = 'info'}) => {

          // process.chdir(cliPath.original);
          // const argsWithAdditional = [...args, "--logLevel", logLevel];

          // let exitCode = 0;

          const checkoutCliPath = getActiveCliPath();

          mockStdStart();

          // running oclif commands programatically - https://tinyurl.com/29dj8vmc
          const res = await SchematicsRunCommand.runDirect<any>(
            {
              root: checkoutCliPath.workspace.original, // schematics needs to run from the workspace base
              // debug: 9,
            },
            parseOutput
          )
            // .then((...flushArgs: any[]) => oclifCore.flush(...flushArgs))
            .catch((error) => {
              /**
             DO NOT DO ANY ADDITIONAL PROCESS OUT LOGGING. MUST RELY ON ONLY THE REPORTING WITHIN .CATCH ETC ONLY WHEN TESTING - see BaseCommand#catch
            */

              // exitCode = anError?.oclif?.exit ?? 1;
              // error = anError

              const outputs = mockStdEnd();
              const tree = createTree(testEnvVars.workspacePath.original);
              const expectUtil = new ExpectUtil({
                testEnvVars,
                outputs,
                tree: tree as Tree,
                exitCode: 0,
              });

              return {
                success: false,
                res: {
                  error,
                  exitCode: error?.oclif?.exit ?? 1,
                  expectUtil,
                  // tree,
                },
              };
            });

          const outputs = mockStdEnd();
          const tree = createTree(testEnvVars.workspacePath.original);
          const expectUtil = new ExpectUtil({
            testEnvVars,
            outputs,
            tree: tree as Tree,
            exitCode: 0,
          });

          if (assertIsOk(res)) {
            // const tree = createTree(testEnvVars.workspacePath.original)
            // const outputs = mockStdEnd()
            // const expectUtil = new ExpectUtil({
            //   testEnvVars,
            //   outputs,
            //   tree,
            //   exitCode: 0,
            // })
            // Promise<Result<{ exitCode: number; tree: Tree }, { exitCode: number }>>;

            return {
              success: true,
              res: {
                exitCode: 0,
                expectUtil,
              },
            };
          } else {
            console.log(`resddddddddd :>> `, res);
            return {
              success: false,
              res: {
                exitCode: 1,
                error: res.res.error as Error,
                expectUtil,
              },
            };
          }

          // return res

          // if (exitCode === 0) {
          //   // create a virtualFs tree (i.e. same as schematics) - https://tinyurl.com/2mj4lzfv
          //   const tree = new HostCreateTree(
          //     new virtualFs.ScopedHost(
          //       new NodeJsSyncHost(),
          //       envVars.workspacePath.original as any
          //     )
          //   );

          //   return {
          //     success: true,
          //     res: {
          //       exitCode,
          //       tree,
          //     },
          //   };
          // }

          // return {
          //   success: false,
          //   res: {
          //     exitCode,
          //     // tree,
          //   },
          // };
        },
        runServiceCb: async ({
          serviceOptions: { cb, serviceName, initialiseOptions },
          originPath,
          tree,
        }) => {
          // runSchematic: async ({args, flags, schematicAddress, workspacePath, logLevel = 'info'}) => {

          // process.chdir(cliPath.original);
          // const argsWithAdditional = [...args, "--logLevel", logLevel];

          const checkoutCliPath = getActiveCliPath();

          const parseOutput: ParserOutput<
            FlagsInfer<typeof SchematicsRunCommand> & {
              payload: {
                originPath?: string;
                tree?: Tree;
                cb: (options: any) => Promise<void>;
                serviceName: keyof ServiceMap;
                initialiseOptions: any;
              };
            },
            FlagsInfer<typeof SchematicsRunCommand> & {
              payload: {
                originPath?: string;
                tree?: Tree;
                cb: (options: any) => Promise<void>;
                serviceName: keyof ServiceMap;
                initialiseOptions: any;
              };
            },
            ArgsInfer<typeof SchematicsRunCommand>
          > = {
            flags: {
              workspacePath: testContext.testEnvVars.workspacePath.original,
              // destinationPath: testContext.envVars.workspacePath.original,
              schematicsAddress:
                "@business-as-code/plugin-dev-tests#namespace=run-service-as-rule",
              payload: {
                initialiseOptions,
                originPath: originPath?.original,
                tree,
                cb,
                serviceName,
              },
              ["logLevel"]: testEnvVars.defaultLogLevel,
              ["json"]: false,
            },
            args: {},
            argv: [],
            metadata: {} as any,
            raw: {} as any,
            nonExistentFlags: {} as any,
          };

          // let exitCode = 0;
          // let error: Error | undefined;

          mockStdStart();

          // running oclif commands programatically - https://tinyurl.com/29dj8vmc
          const res = await SchematicsRunCommand.runDirect<any>(
            {
              root: checkoutCliPath.workspace.original, // schematics needs to run from the workspace base
              // debug: 9,
            },
            parseOutput
          ).catch((err) => {
            mockStdEnd();
            console.log(`testKKKKKKKKKKKKKKK :>> `, err);
            throw err; // for test purposes, our is Result<blah, never>
          });

          if (assertIsOk(res)) {
            const expectUtil = createExpectUtil({
              workspacePath: testEnvVars.workspacePath,
              testEnvVars,
              outputs: mockStdEnd(),
            });

            return {
              success: true,
              res: {
                exitCode: 0,
                expectUtil,
              },
            };
          } else {
            throw res.res.error; // for test purposes, our is Result<blah, never>
          }
        },
        // mockStdStart: () => {
        //   // docs - https://tinyurl.com/24tptzy8
        //   mockStd.stdout.print = true
        //   mockStd.stderr.print = true
        //   mockStd.stdout.stripColor = false
        //   mockStd.stderr.stripColor = false

        //   mockStd.stdout.start();
        //   mockStd.stderr.start();
        // },
        // mockStdEnd: (flush?: boolean) => {
        //   mockStd.stdout.stop();
        //   mockStd.stderr.stop();

        //   if (flush) {
        //     process.stdout.write(mockStd.stdout.output)
        //     process.stderr.write(mockStd.stderr.output)
        //   }

        //   return {
        //     stdout: mockStd.stdout.output,
        //     stderr: mockStd.stderr.output,
        //   };
        // },
        testEnvVars: {
          ...ephemeralTestEnvVars,
          ...persistentTestEnvVars,
        },
      };
    }

    const testContext = await createTestContext();

    if (
      testEnvVars.cliSource &&
      testEnvVars.cliSourceActive !== testEnvVars.cliSource
    ) {
      console.info(
        `---- Skipping test with cliSource '${testEnvVars.cliSource}'. Current active cliSource: '${testEnvVars.cliSourceActive}' ----`
      );
    } else {
      await setupFolders(testEnvVars); // only do this when running the tests!!
      await run(testContext);
    }

    console.info(
      `---- TEST COMPLETE. DestinationPath: '${testContext.testEnvVars.workspacePath.original}' ----`
    );

    // try {
    //   await run(testContext)
    // }
    // catch (err) {
    //   console.log(`err when running run() :>> `, err, testContext)
    // }
  };
}

function mockStdStart() {
  // docs - https://tinyurl.com/24tptzy8
  consoleUtils.stdout.print = true;
  consoleUtils.stderr.print = true;
  // consoleUtils.stdout.stripColor = false
  // consoleUtils.stderr.stripColor = false

  consoleUtils.stdout.start();
  consoleUtils.stderr.start();
}
function mockStdEnd(): Outputs {
  consoleUtils.stdout.stop();
  consoleUtils.stderr.stop();

  // if (flush) {
  //   process.stdout.write(consoleUtils.stdout.output)
  //   process.stderr.write(consoleUtils.stderr.output)
  // }

  return {
    stdout: consoleUtils.stdout.output,
    stderr: consoleUtils.stderr.output,
  };
}

export const createExpectUtil = ({
  workspacePath,
  outputs = { stderr: "", stdout: "" },
  testEnvVars,
}: {
  workspacePath: AddressPathAbsolute;
  outputs?: Outputs;
  testEnvVars: TestEnvVars;
}) => {
  const nextTestEnvVars = {
    ...testEnvVars,
    workspacePath,
  }

  const resultTree = new HostCreateTree(
    new virtualFs.ScopedHost(
      new NodeJsSyncHost(),
      workspacePath as any // Path required,
    )
  );
  // const outputs = mockStdEnd();
  const expectUtil = new ExpectUtil({
    outputs,
    testEnvVars: nextTestEnvVars,
    tree: resultTree,
    exitCode: 0,
  });
  return expectUtil;
};
