import { AddressPathAbsolute } from "@business-as-code/address";
import { CacheKey, constants, expectIsOk, fsUtils } from "@business-as-code/core";
import { AddressCacheManager } from "@business-as-code/core/src/cache/address-cache-manager";
import { AddressAbsoluteCacheManager } from "@business-as-code/core/src/cache/address-absolute-cache-manager";
import { bunMatchers, createPersistentTestEnv } from "@business-as-code/tests-core";
import { expect, test, describe, it, jest } from "bun:test"

describe("cache-service", () => {
  const doFetch = async ({
    // cacheService,
    sourcePath,
    destinationPath,
  }: {
    // cacheService: CacheService;
    sourcePath: AddressPathAbsolute;
    destinationPath: AddressPathAbsolute;
  }): Promise<void> => {
    return AddressAbsoluteCacheManager.copyContent({ sourcePath, destinationPath });
  };

  it("sets up folders with rootPath", async () => {});


  // it("fetches and stores ok - with namespace - with content base", async () => {
  //   const persistentTestEnv = await createPersistentTestEnv({});
  //   await persistentTestEnv.test({}, async (testContext) => {
  //     const sourceAddress = fsUtils.resolveCoreConfig("skeleton.js");
  //     const key = "skeleton-js";
  //     const namespace = sourceAddress.type;

  //     const cacheService = await testContext.context.serviceFactory("cache", {
  //       context: testContext.context,
  //       workingPath: ".",
  //       workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
  //       // rootPath: testContext.testEnvVars.workspacePath,
  //       contentBaseAddress: addr.pathUtils.join(
  //         testContext.testEnvVars.workspacePath,
  //         addr.parseAsType("content", "portablePathFilename")
  //       ) as AddressPathAbsolute,
  //       metaBaseAddress: addr.pathUtils.join(
  //         testContext.testEnvVars.workspacePath,
  //         addr.parseAsType("meta", "portablePathFilename")
  //       ) as AddressPathAbsolute,
  //     });

  //     const fetchRes = await cacheService.get({
  //       address: sourceAddress,
  //       // namespace,
  //       cacheOptions: {},
  //       // expectedChecksum: "",
  //       createChecksum: async ({ existentChecksum, contentPath }) => {
  //         return {
  //           globalVersion: 1,
  //           key,
  //         };
  //       },
  //       onHit: () => {},
  //       onStale: async ({ contentPath, existentChecksum }) => {
  //         await doFetch(sourceAddress, contentPath);
  //       },
  //       // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
  //       onMiss: async ({ contentPath }) => {
  //         await doFetch(sourceAddress, contentPath);
  //       },
  //     });

  //     expectIsOk(fetchRes);
  //     const entry = fetchRes.res;

  //     expect(fetchRes.res).toEqual(
  //       expect.objectContaining({
  //         sourceAddress,
  //         contentPath: expect.objectContaining({
  //           original: expect.stringMatching(
  //             `${testContext.testEnvVars.workspacePath.original}/content`
  //           ),
  //         }),
  //         contentPathRelative: expect.anything(),
  //         metaPath: expect.anything(),
  //         metaPathRelative: expect.anything(),
  //         checksum: {
  //           globalVersion: 1,
  //           key,
  //         },
  //       })
  //     );

  //     const expectUtil = await testContext.createExpectUtil({
  //       workspacePath: testContext.testEnvVars.workspacePath,
  //     });
  //     const expectFs = await expectUtil.createFs();
  //     expect(expectFs.existsSync("meta")).toBeTruthy();

  //     expect(
  //       expectFs.existsSync(
  //         `meta/${entry.metaPathRelative.original}`
  //       )
  //     ).toBeTruthy();
  //     expect(
  //       expectFs.readJson(
  //         `meta/${entry.metaPathRelative.original}`
  //       )
  //     ).toEqual({
  //       contentChecksum: { globalVersion: 1, key },
  //     });
  //     expect(expectFs.existsSync("content")).toBeTruthy();
  //     expect(
  //       expectFs.existsSync(`content/${entry.contentPathRelative.original}`)
  //     ).toBeTruthy();
  //   });
  // });

  it("fetches and stores ok", async () => {
    // console.log(`done :>> `, require('util').inspect(done, {showHidden: false, depth: undefined, colors: true}))

    // console.log(`blah :>> `, require('util').inspect(, {showHidden: false, depth: undefined, colors: true}))

  // console.log(`it :>> `, require('util').inspect(it, {showHidden: false, depth: undefined, colors: true}))
    const persistentTestEnv = await createPersistentTestEnv({
      testName: 'cache-service fetches and stores ok',
    });
    await persistentTestEnv.test({}, async (testContext) => {
      const sourceAddress = fsUtils.resolveCoreConfig("skeleton.js");

      // console.log(`sourceAddress :>> `, sourceAddress)
      const key = "skeleton-js";
      // const namespace = sourceAddress.type;

      // const cacheService = await testContext.context.serviceFactory("cache", {
      //   context: testContext.context,
      //   workingPath: ".",
      //   workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
      //   rootPath: testContext.testEnvVars.workspacePath,
      //   // metaBaseAddress: addr.pathUtils.join(
      //   //   testContext.testEnvVars.workspacePath,
      //   //   addr.parseAsType("meta", "portablePathFilename")
      //   // ) as AddressPathAbsolute,
      // });
      const cacheManager = await AddressCacheManager.initialise({
        context: testContext.context,
        workingPath: ".",
        workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
        rootPath: testContext.testEnvVars.workspacePath,
        // metaBaseAddress: addr.pathUtils.join(
        //   testContext.testEnvVars.workspacePath,
        //   addr.parseAsType("meta", "portablePathFilename")
        // ) as AddressPathAbsolute,
      });

      const createChecksum = jest.fn().mockImplementationOnce(async () => {
        return {
          globalVersion: 1,
          key,
        };
      });
      const onHit = jest
        .fn()
        .mockImplementationOnce(
          async ({ contentPath }: { contentPath: AddressPathAbsolute }) => {}
        );
      const onStale = jest
        .fn()
        .mockImplementationOnce(
          async ({
            contentPath,
            existentChecksum,
          }: {
            contentPath: AddressPathAbsolute;
            existentChecksum?: CacheKey;
          }) =>
            doFetch({ sourcePath: sourceAddress, destinationPath: contentPath })
        );
      const onMiss = jest
        .fn()
        .mockImplementationOnce(
          async ({ contentPath }: { contentPath: AddressPathAbsolute }) =>
            doFetch({ sourcePath: sourceAddress, destinationPath: contentPath })
        );
// console.log(`sourceAddress :>> `, sourceAddress)
      const fetchRes = await cacheManager.get({
        address: sourceAddress,
        cacheOptions: {},
        createChecksum,
        onHit,
        onStale,
        onMiss,
      });

      expectIsOk(fetchRes);
      const entry = fetchRes.res;

      expect(entry.contentPath.original).toEqual(expect.stringMatching(`/${constants.RC_CONTENT_FOLDER}/portablePathPosixAbsolute/`))
      expect(entry.metaPath.original).toEqual(expect.stringMatching(new RegExp(`/${constants.RC_META_FOLDER}\/.*.json$`)))
      expect(entry.metaPathRelative.original).toEqual(expect.stringMatching(new RegExp(`[0-9]{4}.json$`)))
      expect(entry.checksum).toStrictEqual({
        globalVersion: 1,
        key,
      })
      expect(entry.existentChecksum).toEqual(undefined)
      expect(entry.checksumValid).toEqual(true)

        // expect.objectContaining({
        //   contentPath: expect.objectContaining({
        //     original: expect.stringMatching(`/${constants.RC_CONTENT_FOLDER}/portablePathPosixAbsolute/`),
        //   }),
        //   metaPath: expect.objectContaining({
        //     original: expect.stringMatching(/.json$/),
        //   }),
        //   metaPathRelative: expect.objectContaining({
        //     original: expect.stringMatching(/.json$/),
        //   }),
        //   checksum: {
        //     globalVersion: 1,
        //     key,
        //   },
        //   existentChecksum: undefined,
        //   checksumValid: true, // we class empty as valid
        // })
      // );

      expect(onStale).toHaveBeenCalledTimes(0);
      expect(onMiss).toHaveBeenCalledTimes(1);
      // expect(onMiss).toHaveBeenLastCalledWith({
      //   contentPath: expect.objectContaining({
      //     original: expect.stringMatching(`/${constants.RC_CONTENT_FOLDER}/portablePathPosixAbsolute/`),
      //   }),
      // });
      expect(onHit).toHaveBeenCalledTimes(0); // onHit only called when content exists and checksum passes
      expect(createChecksum).toHaveBeenCalledTimes(1);
      // expect(createChecksum).toHaveBeenLastCalledWith({
      //   existentChecksum: undefined,
      //   contentPath: expect.objectContaining({
      //     original: expect.stringMatching(`/${constants.RC_CONTENT_FOLDER}/portablePathPosixAbsolute/`),
      //   }),
      // });
    });
  });

  // it("fetches and stores ok - without namespace", async () => {
  //   const persistentTestEnv = await createPersistentTestEnv({});
  //   await persistentTestEnv.test({}, async (testContext) => {
  //     const sourceAddress = fsUtils.resolveCoreConfig("skeleton.js");
  //     const key = "skeleton-js";
  //     const namespace = undefined;

  //     const cacheService = await testContext.context.serviceFactory("cache", {
  //       context: testContext.context,
  //       workingPath: ".",
  //       workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
  //       // rootPath: testContext.testEnvVars.workspacePath,
  //       contentBaseAddress: addr.pathUtils.join(
  //         testContext.testEnvVars.workspacePath,
  //         addr.parseAsType("content", "portablePathFilename")
  //       ) as AddressPathAbsolute,
  //       metaBaseAddress: addr.pathUtils.join(
  //         testContext.testEnvVars.workspacePath,
  //         addr.parseAsType("meta", "portablePathFilename")
  //       ) as AddressPathAbsolute,
  //     });

  //     const fetchRes = await cacheService.get({
  //       address: sourceAddress,
  //       // namespace,
  //       cacheOptions: {},
  //       // expectedChecksum: "",
  //       createChecksum: async ({ existentChecksum, contentPath }) => {
  //         return {
  //           globalVersion: 1,
  //           key,
  //         };
  //       },
  //       onHit: () => {},
  //       onStale: async ({ contentPath, existentChecksum }) => {
  //         return doFetch(sourceAddress);
  //       },
  //       // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
  //       onMiss: async ({ contentPath }) => {
  //         doFetch(sourceAddress);
  //       },
  //     });

  //     expectIsOk(fetchRes);

  //     expect(fetchRes.res).toEqual(
  //       expect.objectContaining({
  //         sourceAddress,
  //         contentPath: expect.objectContaining({
  //           original: expect.stringMatching(
  //             `${testContext.testEnvVars.workspacePath.original}/content`
  //           ),
  //         }),
  //         checksum: {
  //           globalVersion: 1,
  //           key,
  //         },
  //       })
  //     );

  //     const expectUtil = await testContext.createExpectUtil({
  //       workspacePath: testContext.testEnvVars.workspacePath,
  //     });
  //     const expectFs = await expectUtil.createFs();
  //     expect(expectFs.existsSync("meta")).toBeTruthy();
  //     expect(expectFs.existsSync(`meta/${key}/main.json`)).toBeTruthy();
  //     expect(expectFs.readJson(`meta/${key}/main.json`)).toEqual({
  //       contentChecksum: { globalVersion: 1, key },
  //     });
  //     expect(expectFs.existsSync("content")).toBeTruthy();
  //     expect(expectFs.existsSync(`content/${key}`)).toBeTruthy(); // no content
  //   });
  // });

  // it("fetches and stores ok - without namespace - without content base", async () => {
  //   const persistentTestEnv = await createPersistentTestEnv({});
  //   await persistentTestEnv.test({}, async (testContext) => {
  //     const sourceAddress = fsUtils.resolveCoreConfig("skeleton.js");
  //     const key = "skeleton-js";
  //     const namespace = undefined;

  //     const cacheService = await testContext.context.serviceFactory("cache", {
  //       context: testContext.context,
  //       workingPath: ".",
  //       workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
  //       // rootPath: testContext.testEnvVars.workspacePath,
  //       metaBaseAddress: addr.pathUtils.join(
  //         testContext.testEnvVars.workspacePath,
  //         addr.parseAsType("meta", "portablePathFilename")
  //       ) as AddressPathAbsolute,
  //     });

  //     const fetchRes = await cacheService.get({
  //       address: sourceAddress,
  //       // namespace,
  //       cacheOptions: {},
  //       // expectedChecksum: "",
  //       createChecksum: async ({ existentChecksum, contentPath }) => {
  //         return {
  //           globalVersion: 1,
  //           key,
  //         };
  //       },
  //       onHit: () => {},
  //       onStale: async ({ contentPath, existentChecksum }) => {
  //         return doFetch(sourceAddress);
  //       },
  //       // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
  //       onMiss: async ({ contentPath }) => {
  //         doFetch(sourceAddress);
  //       },
  //     });

  //     expectIsOk(fetchRes);

  //     expect(fetchRes.res).toEqual(
  //       expect.objectContaining({
  //         sourceAddress,
  //         contentPath: undefined,
  //         checksum: {
  //           globalVersion: 1,
  //           key,
  //         },
  //       })
  //     );

  //     const expectUtil = await testContext.createExpectUtil({
  //       workspacePath: testContext.testEnvVars.workspacePath,
  //     });
  //     const expectFs = await expectUtil.createFs();
  //     expect(expectFs.existsSync("meta")).toBeTruthy();
  //     expect(expectFs.existsSync(`meta/${key}/main.json`)).toBeTruthy();
  //     expect(expectFs.readJson(`meta/${key}/main.json`)).toEqual({
  //       contentChecksum: { globalVersion: 1, key },
  //     });
  //     expect(expectFs.existsSync("content")).toBeFalsy();
  //     expect(expectFs.existsSync(`content/${key}`)).toBeFalsy(); // no content
  //   });
  // });
});
