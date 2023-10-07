import { addr } from "@business-as-code/address";
import { FetchOptions, constants, expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { describe, expect, it } from "bun:test";

/** check the repositories are accessible via the daemon. See fetch-content-stage0.spec for content tests */
describe("fetch-content", () => {
  describe("git", () => {
    it("fetches and caches new content", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        // defaultLogLevel: "debug",
        testName: 'fetch-content:git:fetches and caches new content'
      });
      await persistentTestEnv.test({}, async (testContext) => {
        const sourceAddress = addr.parseUrl("ssh://localhost:2224/repo1.git");

        const fetchOptions: FetchOptions = {
          cacheService: await testContext.context.serviceFactory("cache", {
            context: testContext.context,
            workingPath: ".",
            workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
            // rootPath: addr.parsePath(
            //   constants.CACHE_STORAGE_PATH
            // ) as AddressPathAbsolute, // defines the base of the cache service
            rootPath: testContext.testEnvVars.workspacePath,
          }),
          // sourceAddress: addr.parseUrl('http://localhost:8174/repo1.git'),
          sourceAddress,
          destinationAddress: testContext.testEnvVars.workspacePath,
        };

        const fetchLifecycleRes =
          await testContext.context.lifecycles.fetchContent.executeFetchContent(
            {
              common: {
                context: testContext.context,
                workspacePath: testContext.testEnvVars.workspacePath,
              },
              options: [
                {
                  provider: "git",
                  options: fetchOptions,
                },
              ],
            }
          );

        expectIsOk(fetchLifecycleRes);
        const fetchResFirstProvider = fetchLifecycleRes.res[0]

        // console.log(`fetchLifecycleRes :>> `, require('util').inspect(fetchLifecycleRes, {showHidden: false, depth: undefined, colors: true}))

        expect(fetchResFirstProvider).toHaveProperty('provider', 'git')
        expect(fetchResFirstProvider).toHaveProperty('options')
        expect(fetchResFirstProvider.options.contentPath.original).toMatch(`/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`)
        expect(fetchResFirstProvider.options.checksum).toEqual({
          globalVersion: 1,
          key: '86af834a790b7b5c95f14aed7c83a5da50d578d2',
        })

        // expect(fetchLifecycleRes.res[0]).toEqual(
        //   {
        //     provider: 'git',
        //     options: expect.objectContaining({
        //       contentPath: expect.objectContaining({
        //         original: expect.stringMatching(`/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`),
        //       }),
        //       metaPath: expect.objectContaining({
        //         original: expect.stringMatching(/.json$/),
        //       }),
        //       metaPathRelative: expect.objectContaining({
        //         original: expect.stringMatching(/.json$/),
        //       }),
        //       checksum: {
        //         globalVersion: 1,
        //         key: '86af834a790b7b5c95f14aed7c83a5da50d578d2',
        //       },
        //       existentChecksum: undefined,
        //       checksumValid: true, // we class empty as valid
        //     })
        //   }
        // );

        // const expectUtil = await testContext.createExpectUtil({workspacePath: testContext.testEnvVars.workspacePath})
        // const expectFs = expectUtil.createFs()

        // console.log(`fetchLifecycleRes :>> `, require('util').inspect(fetchLifecycleRes, {showHidden: false, depth: undefined, colors: true}))


        const cacheService = await testContext.context.serviceFactory("cache", {
          context: testContext.context,
          workingPath: ".",
          workspacePath: testContext.testEnvVars.workspacePath,
          rootPath: testContext.testEnvVars.workspacePath,
        });
        expect(await cacheService.has(sourceAddress)).toBeTruthy();


        const fetchLifecycleCachedRes =
          await testContext.context.lifecycles.fetchContent.executeFetchContent(
            {
              common: {
                context: testContext.context,
                workspacePath: testContext.testEnvVars.workspacePath,
              },
              options: [
                {
                  provider: "git",
                  options: fetchOptions,
                },
              ],
            }
          );

        expectIsOk(fetchLifecycleCachedRes);
        const fetchResCachedFirstProvider = fetchLifecycleCachedRes.res[0]

        // console.log(`fetchLifecycleCachedRes :>> `, require('util').inspect(fetchLifecycleCachedRes, {showHidden: false, depth: undefined, colors: true}))

        expect(fetchResCachedFirstProvider).toHaveProperty('provider', 'git')
        expect(fetchResCachedFirstProvider).toHaveProperty('options')
        expect(fetchResCachedFirstProvider.options.contentPath.original).toMatch(`/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`)
        expect(fetchResCachedFirstProvider.options.checksum).toEqual({
          globalVersion: 1,
          key: '86af834a790b7b5c95f14aed7c83a5da50d578d2',
        })

        // expect(fetchLifecycleCachedRes.res[0]).toEqual(
        //   {
        //     provider: 'git',
        //     options: expect.objectContaining({
        //       contentPath: expect.objectContaining({
        //         original: expect.stringMatching(`/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`),
        //       }),
        //       metaPath: expect.objectContaining({
        //         original: expect.stringMatching(/.json$/),
        //       }),
        //       metaPathRelative: expect.objectContaining({
        //         original: expect.stringMatching(/.json$/),
        //       }),
        //       checksum: {
        //         globalVersion: 1,
        //         key: '86af834a790b7b5c95f14aed7c83a5da50d578d2',
        //       },
        //       existentChecksum: {
        //         globalVersion: 1,
        //         key: '86af834a790b7b5c95f14aed7c83a5da50d578d2',
        //       },
        //       checksumValid: true, // match
        //     })
        //   },
        // );

        // const cacheRes = await cacheService.get({
        //   contentPath: sourceAddress
        // });

        // expectIsOk(cacheRes);
        // assert(cacheRes.res);
        // const { checksum } = cacheRes.res;

        // expect(checksum.globalVersion).toEqual(constants.GLOBAL_CACHE_KEY);
        // expect(checksum.key).toHaveLength(40);

        // console.log(`contentPath, checksum :>> `, contentPath, checksum)

        // expect(await xfsCacheManager.has({key: }))

        // const assertForRepo = async (repo: string) => {
        //   await testContext.runServiceCb({
        //     serviceOptions: {
        //       serviceName: "git",
        //       cb: async ({ service }) => {
        //         const gitUrl = `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/${repo}`;
        //         const lsRemoteRes = await service.remoteList(gitUrl);

        //         expectIsOk(lsRemoteRes);

        //         expect(lsRemoteRes.res).toMatch("refs/heads/main");
        //       },
        //       initialiseOptions: {
        //         workingPath: ".",
        //       },
        //     },
        //   });
        // };

        // await assertForRepo("repo1.git"); // only testing the git-server side of things. 1 repo only required
      });
    });
  });
});
