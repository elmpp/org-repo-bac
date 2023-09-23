import { addr } from "@business-as-code/address";
import { FetchOptions, constants, expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import assert from "assert";

/** check the repositories are accessible via the daemon. See fetch-content-stage0.spec for content tests */
describe("fetch-content", () => {
  describe("git", () => {
    it("fetches and caches new content", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        // defaultLogLevel: "debug",
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

        const res =
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

        expectIsOk(res);

        // const expectUtil = await testContext.createExpectUtil({workspacePath: testContext.testEnvVars.workspacePath})
        // const expectFs = expectUtil.createFs()

        const cacheService = await testContext.context.serviceFactory("cache", {
          context: testContext.context,
          workingPath: ".",
          workspacePath: testContext.testEnvVars.workspacePath,
        });

        expect(await cacheService.has(sourceAddress)).toBeTruthy();
        const cacheRes = await cacheService.get({ address: sourceAddress });

        expectIsOk(cacheRes);
        assert(cacheRes.res);
        const { checksum } = cacheRes.res;

        expect(checksum.globalVersion).toEqual(constants.GLOBAL_CACHE_KEY);
        expect(checksum.key).toHaveLength(40);
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
