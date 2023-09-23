import {
  AddressDescriptorUnion,
  AddressPathAbsolute,
  addr,
} from "@business-as-code/address";
import { expectIsOk, fsUtils } from "@business-as-code/core";
import { xfs } from "@business-as-code/fslib";
import { createPersistentTestEnv } from "@business-as-code/tests-core";

describe("cache-service", () => {
  const doFetch = async (
    sourceAddress: AddressPathAbsolute,
    contentPath: AddressPathAbsolute
  ): Promise<void> => {
    // return xfs.readFilePromise(sourceAddress.address, "utf-8");
    // await xfs.copyPromise(

    await xfs.copyFilePromise(
      sourceAddress.address,
      // contentPath.address,
      addr.pathUtils.join(contentPath, addr.pathUtils.basename(sourceAddress))
        .address
    );
    // xfs.copyFilePromise(
    //   sourceAddress.address + '/',
    //   contentPath.address,
    //   // addr.pathUtils.join(contentPath, addr.pathUtils.basename(sourceAddress))
    //   //   .address
    // );
  };

  it("sets up folders with rootPath", async () => {});

  it("fetches and stores ok - with namespace - with content base", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const sourceAddress = fsUtils.resolveCoreConfig("skeleton.js");
      const key = "skeleton-js";
      const namespace = sourceAddress.type;

      const cacheService = await testContext.context.serviceFactory("cache", {
        context: testContext.context,
        workingPath: ".",
        workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
        // rootPath: testContext.testEnvVars.workspacePath,
        contentBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parseAsType("content", "portablePathFilename")
        ) as AddressPathAbsolute,
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parseAsType("meta", "portablePathFilename")
        ) as AddressPathAbsolute,
      });

      const fetchRes = await cacheService.get({
        address: sourceAddress,
        // namespace,
        cacheOptions: {},
        // expectedChecksum: "",
        createChecksum: async ({ existentChecksum, contentPath }) => {
          return {
            globalVersion: 1,
            key,
          };
        },
        onHit: () => {},
        onStale: async ({ contentPath, existentChecksum }) => {
          await doFetch(sourceAddress, contentPath);
        },
        // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
        onMiss: async ({ contentPath }) => {
          await doFetch(sourceAddress, contentPath);
        },
      });

      expectIsOk(fetchRes);
      const entry = fetchRes.res;

      expect(fetchRes.res).toEqual(
        expect.objectContaining({
          sourceAddress,
          contentPath: expect.objectContaining({
            original: expect.stringMatching(
              `${testContext.testEnvVars.workspacePath.original}/content`
            ),
          }),
          contentPathRelative: expect.anything(),
          metaPath: expect.anything(),
          metaPathRelative: expect.anything(),
          checksum: {
            globalVersion: 1,
            key,
          },
        })
      );

      const expectUtil = await testContext.createExpectUtil({
        workspacePath: testContext.testEnvVars.workspacePath,
      });
      const expectFs = await expectUtil.createFs();
      expect(expectFs.existsSync("meta")).toBeTruthy();

      expect(
        expectFs.existsSync(
          `meta/${entry.metaPathRelative.original}`
        )
      ).toBeTruthy();
      expect(
        expectFs.readJson(
          `meta/${entry.metaPathRelative.original}`
        )
      ).toEqual({
        contentChecksum: { globalVersion: 1, key },
      });
      expect(expectFs.existsSync("content")).toBeTruthy();
      expect(
        expectFs.existsSync(`content/${entry.contentPathRelative.original}`)
      ).toBeTruthy(); // no content
    });
  });

  it.only("fetches and stores ok - with namespace - without content base", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const sourceAddress = fsUtils.resolveCoreConfig("skeleton.js");
      const key = "skeleton-js";
      const namespace = sourceAddress.type;

      const cacheService = await testContext.context.serviceFactory("cache", {
        context: testContext.context,
        workingPath: ".",
        workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
        // rootPath: testContext.testEnvVars.workspacePath,
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parseAsType("meta", "portablePathFilename")
        ) as AddressPathAbsolute,
      });

      const fetchRes = await cacheService.get({
        address: sourceAddress,
        // namespace,
        cacheOptions: {},
        // expectedChecksum: "",
        createChecksum: async ({ existentChecksum, contentPath }) => {
          return {
            globalVersion: 1,
            key,
          };
        },
        onHit: () => {},
        onStale: async ({ contentPath, existentChecksum }) => {
          return await doFetch(sourceAddress, contentPath);
        },
        // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
        onMiss: async ({ contentPath }) => {
          await doFetch(sourceAddress, contentPath);
        },
      });

      expectIsOk(fetchRes);

      expect(fetchRes.res).toEqual(
        expect.objectContaining({
          sourceAddress,
          contentPath: undefined,
          checksum: {
            globalVersion: 1,
            key,
          },
        })
      );

      const expectUtil = await testContext.createExpectUtil({
        workspacePath: testContext.testEnvVars.workspacePath,
      });
      const expectFs = await expectUtil.createFs();
      expect(expectFs.existsSync("meta")).toBeTruthy();
      expect(
        expectFs.existsSync(`meta/${namespace}/${key}/main.json`)
      ).toBeTruthy();
      expect(expectFs.readJson(`meta/${namespace}/${key}/main.json`)).toEqual({
        contentChecksum: { globalVersion: 1, key },
      });
      expect(expectFs.existsSync("content")).toBeFalsy();
      expect(expectFs.existsSync(`content/${namespace}/${key}`)).toBeFalsy(); // no content
    });
  });

  it("fetches and stores ok - without namespace - with content base", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const sourceAddress = fsUtils.resolveCoreConfig("skeleton.js");
      const key = "skeleton-js";
      const namespace = undefined;

      const cacheService = await testContext.context.serviceFactory("cache", {
        context: testContext.context,
        workingPath: ".",
        workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
        // rootPath: testContext.testEnvVars.workspacePath,
        contentBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parseAsType("content", "portablePathFilename")
        ) as AddressPathAbsolute,
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parseAsType("meta", "portablePathFilename")
        ) as AddressPathAbsolute,
      });

      const fetchRes = await cacheService.get({
        address: sourceAddress,
        // namespace,
        cacheOptions: {},
        // expectedChecksum: "",
        createChecksum: async ({ existentChecksum, contentPath }) => {
          return {
            globalVersion: 1,
            key,
          };
        },
        onHit: () => {},
        onStale: async ({ contentPath, existentChecksum }) => {
          return doFetch(sourceAddress);
        },
        // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
        onMiss: async ({ contentPath }) => {
          doFetch(sourceAddress);
        },
      });

      expectIsOk(fetchRes);

      expect(fetchRes.res).toEqual(
        expect.objectContaining({
          sourceAddress,
          contentPath: expect.objectContaining({
            original: expect.stringMatching(
              `${testContext.testEnvVars.workspacePath.original}/content`
            ),
          }),
          checksum: {
            globalVersion: 1,
            key,
          },
        })
      );

      const expectUtil = await testContext.createExpectUtil({
        workspacePath: testContext.testEnvVars.workspacePath,
      });
      const expectFs = await expectUtil.createFs();
      expect(expectFs.existsSync("meta")).toBeTruthy();
      expect(expectFs.existsSync(`meta/${key}/main.json`)).toBeTruthy();
      expect(expectFs.readJson(`meta/${key}/main.json`)).toEqual({
        contentChecksum: { globalVersion: 1, key },
      });
      expect(expectFs.existsSync("content")).toBeTruthy();
      expect(expectFs.existsSync(`content/${key}`)).toBeTruthy(); // no content
    });
  });

  it("fetches and stores ok - without namespace - without content base", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const sourceAddress = fsUtils.resolveCoreConfig("skeleton.js");
      const key = "skeleton-js";
      const namespace = undefined;

      const cacheService = await testContext.context.serviceFactory("cache", {
        context: testContext.context,
        workingPath: ".",
        workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
        // rootPath: testContext.testEnvVars.workspacePath,
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parseAsType("meta", "portablePathFilename")
        ) as AddressPathAbsolute,
      });

      const fetchRes = await cacheService.get({
        address: sourceAddress,
        // namespace,
        cacheOptions: {},
        // expectedChecksum: "",
        createChecksum: async ({ existentChecksum, contentPath }) => {
          return {
            globalVersion: 1,
            key,
          };
        },
        onHit: () => {},
        onStale: async ({ contentPath, existentChecksum }) => {
          return doFetch(sourceAddress);
        },
        // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
        onMiss: async ({ contentPath }) => {
          doFetch(sourceAddress);
        },
      });

      expectIsOk(fetchRes);

      expect(fetchRes.res).toEqual(
        expect.objectContaining({
          sourceAddress,
          contentPath: undefined,
          checksum: {
            globalVersion: 1,
            key,
          },
        })
      );

      const expectUtil = await testContext.createExpectUtil({
        workspacePath: testContext.testEnvVars.workspacePath,
      });
      const expectFs = await expectUtil.createFs();
      expect(expectFs.existsSync("meta")).toBeTruthy();
      expect(expectFs.existsSync(`meta/${key}/main.json`)).toBeTruthy();
      expect(expectFs.readJson(`meta/${key}/main.json`)).toEqual({
        contentChecksum: { globalVersion: 1, key },
      });
      expect(expectFs.existsSync("content")).toBeFalsy();
      expect(expectFs.existsSync(`content/${key}`)).toBeFalsy(); // no content
    });
  });
});
