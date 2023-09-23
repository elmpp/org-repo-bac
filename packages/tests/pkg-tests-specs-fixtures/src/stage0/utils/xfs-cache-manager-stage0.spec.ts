import { AddressPathAbsolute, addr } from "@business-as-code/address";
import {
  XfsCacheManager
} from "@business-as-code/core/src/cache/xfs-cache-manager";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { expectTypeOf } from "expect-type";

describe("xfs-cache-manager", () => {
  it("sets up ok", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const options = {
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("meta")
        ) as AddressPathAbsolute,
        contentBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("content")
        ) as AddressPathAbsolute,
      };
      await XfsCacheManager.initialise(options);

      const expectUtil = await testContext.createExpectUtil({
        workspacePath: testContext.testEnvVars.workspacePath,
      });
      const expectFs = await expectUtil.createFs();

      // expectFs.debug()
      expect(expectFs.existsSync("meta")).toBeTruthy();
      expect(expectFs.existsSync("content")).toBeTruthy();
    });
  });
  it("saves to meta", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const options = {
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("meta")
        ) as AddressPathAbsolute,
        contentBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("content")
        ) as AddressPathAbsolute,
      };

      const xfsCacheManager = await XfsCacheManager.initialise(options);
      await xfsCacheManager.set({
        key: "a-key-that-is-sanitised",
        namespace: "a-namespace-that-is-sanitised",
        sourceEntry: {
          // contentPath: addr.parse; // do not copy the content
          meta: {
            contentChecksum: {
              globalVersion: 1,
              key: "a-key-that-is-sanitised",
            },
          },
        },
      });

      const expectUtil = await testContext.createExpectUtil({
        workspacePath: testContext.testEnvVars.workspacePath,
      });
      const expectFs = await expectUtil.createFs();

      expect(expectFs.existsSync("meta")).toBeTruthy();
      expect(expectFs.existsSync("meta/a-namespace-that-is-sanitised/a-key-that-is-sanitised/main.json")).toBeTruthy();
      expect(expectFs.readJson("meta/a-namespace-that-is-sanitised/a-key-that-is-sanitised/main.json")).toEqual({
        contentChecksum: { globalVersion: 1, key: "a-key-that-is-sanitised" },
      });
      expect(expectFs.existsSync("content")).toBeTruthy();
    });
  });

  it("throws when a key/namespace are not sanitised", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const options = {
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("meta")
        ) as AddressPathAbsolute,
        contentBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("content")
        ) as AddressPathAbsolute,
      };

      const xfsCacheManager = await XfsCacheManager.initialise(options);
      expect(() => xfsCacheManager.set({
        key: "a-key-that-is \\not/sanitised",
        namespace: "a-key-that-is \\not/sanitised",
        sourceEntry: {
          // contentPath: addr.parse; // do not copy the content
          meta: {
            contentChecksum: {
              globalVersion: 1,
              key: "a-key-that-is \\not/sanitised",
            },
          },
        },
      })).rejects.toThrowError(`xfsCacheManager attributes not sanitised sufficiently for filesystem storage`)
    });
  });

  it("CacheEntry.content is optional without constructor contentBaseAddress", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const options = {
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("meta")
        ) as AddressPathAbsolute,
        // contentBaseAddress: addr.pathUtils.join(
        //   testContext.testEnvVars.workspacePath,
        //   addr.parsePath("content")
        // ) as AddressPathAbsolute,
      };

      const xfsCacheManager = await XfsCacheManager.initialise<false>(options);
      const cacheEntry = await xfsCacheManager.getCacheEntry({
        key: "a",
        namespace: "a",
      });

      expectTypeOf<{
        meta: any
        content?: any, // not optional
      }>(cacheEntry).toMatchTypeOf(cacheEntry)
    });
  });
  it("CacheEntry.content is NonNullable with constructor contentBaseAddress", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const options = {
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("meta")
        ) as AddressPathAbsolute,
        contentBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("content")
        ) as AddressPathAbsolute,
      };

      const xfsCacheManager = await XfsCacheManager.initialise<true>(options);
      expectTypeOf(xfsCacheManager).toEqualTypeOf<XfsCacheManager<true>>()

      const cacheEntry = await xfsCacheManager.getCacheEntry({
        key: "a",
        namespace: "a",
      });

      expectTypeOf<{
        meta: any
        content: any, // not optional
      }>(cacheEntry).toMatchTypeOf(cacheEntry)
    });
  });
  it("can be set up without content", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const options = {
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath("meta")
        ) as AddressPathAbsolute,
        // contentBaseAddress: addr.pathUtils.join(
        //   testContext.testEnvVars.workspacePath,
        //   addr.parsePath("content")
        // ) as AddressPathAbsolute,
      };

      const xfsCacheManager = await XfsCacheManager.initialise(options);
      await xfsCacheManager.set({
        key: "a",
        namespace: "a",
        sourceEntry: {
          // contentPath: addr.parse; // do not copy the content
          meta: {
            contentChecksum: {
              globalVersion: 1,
              key: "a",
            },
          },
        },
      });

      const expectUtil = await testContext.createExpectUtil({
        workspacePath: testContext.testEnvVars.workspacePath,
      });
      const expectFs = await expectUtil.createFs();

      // expectFs.debug()
      expect(expectFs.existsSync("meta")).toBeTruthy();
      expect(expectFs.existsSync("meta/a/a/main.json")).toBeTruthy();
      expect(expectFs.readJson("meta/a/a/main.json")).toEqual({
        contentChecksum: { globalVersion: 1, key: "a" },
      });
      expect(expectFs.existsSync("content")).toBeFalsy();
      expect(expectFs.existsSync("content/a/a")).toBeFalsy(); // no content
    });
  });
});
