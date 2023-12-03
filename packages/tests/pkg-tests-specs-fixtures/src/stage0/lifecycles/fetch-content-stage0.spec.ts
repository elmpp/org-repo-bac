import { addr } from "@business-as-code/address";
import { FetchOptions, constants, expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { describe, expect, it } from "bun:test";

describe("fetch-content", () => {
  describe("git", () => {
    it("fetches and caches new content", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: 'fetch-content:git:fetches and caches new content'
      });
      await persistentTestEnv.test({}, async (testContext) => {
        const sourceAddress = addr.parseUrl(`ssh://localhost:${constants.GIT_SSH_ANONYMOUS_MOCK_SERVER_PORT}/repo1.git`);

        const fetchOptions: FetchOptions = {
          cacheService: await testContext.context.serviceFactory("cache", {
            context: testContext.context,
            workingPath: ".",
            workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
            rootPath: testContext.testEnvVars.workspacePath,
          }),
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

        expect(fetchResFirstProvider).toHaveProperty('provider', 'git')
        expect(fetchResFirstProvider).toHaveProperty('options')
        expect(fetchResFirstProvider.options.contentPath.original).toMatch(`/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`)
        expect(fetchResFirstProvider.options.checksum).toEqual({
          globalVersion: 1,
          key: 'b88173a5be2c98375765b949fdb2d235a8d55e12',
        })

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

        expect(fetchResCachedFirstProvider).toHaveProperty('provider', 'git')
        expect(fetchResCachedFirstProvider).toHaveProperty('options')
        expect(fetchResCachedFirstProvider.options.contentPath.original).toMatch(`/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`)
        expect(fetchResCachedFirstProvider.options.checksum).toEqual({
          globalVersion: 1,
          key: 'b88173a5be2c98375765b949fdb2d235a8d55e12',
        })
      });
    });
  });
});
