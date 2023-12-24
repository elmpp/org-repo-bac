import {
  AddressDescriptor,
  AddressDescriptorUnion,
  AddressPathAbsolute,
  AddressUrl,
  addr
} from '@business-as-code/address'
import {
  FetchOptions,
  LifecycleReturnByMethodArray,
  Result,
  constants,
  expectIsOk
} from '@business-as-code/core'
import { AddressCacheManager } from '@business-as-code/core/src/cache/address-cache-manager'
import { BacError, MessageName } from '@business-as-code/error'
import {
  TestContext,
  createPersistentTestEnv
} from '@business-as-code/tests-core'
import { describe, expect, it } from 'bun:test'

describe('fetch-content', () => {
  describe('git', () => {
    const assertCacheFs = async ({
      fetchLifecycleRes,
      testContext,
      cacheRoot,
      sourceAddress
    }: {
      fetchLifecycleRes: Result<
        LifecycleReturnByMethodArray<'fetchContent'>,
        {
          error: BacError<MessageName, unknown>
        }
      >
      testContext: TestContext
      cacheRoot: AddressPathAbsolute
      // sourceAddress: AddressDescriptor<'gitSshRepoUrl'>,
      // sourceAddress: AddressUrl,
      sourceAddress: AddressDescriptorUnion
      // fetchOptions: FetchOptions,
    }) => {
      expectIsOk(fetchLifecycleRes)
      const fetchResFirstProvider = fetchLifecycleRes.res[0]

      expect(fetchResFirstProvider).toHaveProperty('provider', 'git')
      expect(fetchResFirstProvider).toHaveProperty('options')
      expect(fetchResFirstProvider.options.contentPath.original).toMatch(
        `/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`
      )
      expect(fetchResFirstProvider.options.checksum).toEqual({
        globalVersion: 1,
        key: 'b88173a5be2c98375765b949fdb2d235a8d55e12'
      })

      const cacheService = await testContext.context.serviceFactory('cache', {
        context: testContext.context,
        workingPath: '.',
        workspacePath: testContext.testEnvVars.workspacePath,
        rootPath: cacheRoot
      })
      expect(await cacheService.has(sourceAddress)).toBeTruthy()

      // const cacheManager = await AddressCacheManager.initialise({
      //   context: testContext.context,
      //   workingPath: ".",
      //   workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
      //   rootPath: testContext.testEnvVars.workspacePath,
      // })
      // expect(await cacheManager.has(sourceAddress)).toBeTruthy();

      const fetchLifecycleCachedRes =
        await testContext.context.lifecycles.fetchContent.executeFetchContent({
          common: {
            context: testContext.context,
            workspacePath: testContext.testEnvVars.workspacePath,
            workingPath: '.',
            cacheService
          },
          options: [
            {
              provider: 'git',
              // options: fetchOptions,
              options: {
                address: sourceAddress.original
              }
            }
          ]
        })

      expectIsOk(fetchLifecycleCachedRes)
      const fetchResCachedFirstProvider = fetchLifecycleCachedRes.res[0]

      expect(fetchResCachedFirstProvider).toHaveProperty('provider', 'git')
      expect(fetchResCachedFirstProvider).toHaveProperty('options')
      expect(fetchResCachedFirstProvider.options.contentPath.original).toMatch(
        `/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`
      )
      expect(fetchResCachedFirstProvider.options.checksum).toEqual({
        globalVersion: 1,
        key: 'b88173a5be2c98375765b949fdb2d235a8d55e12'
      })
    }

    it('fetches and caches new content', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: 'fetch-content:git:fetches and caches new content'
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const sourceAddress = addr.parseAsType(
          `ssh://localhost:${constants.GIT_SSH_ANONYMOUS_MOCK_SERVER_PORT}/repo1.git`,
          'gitSshRepoUrl'
        )
        // const sourceAddress = addr.parseUrl(
        //   `ssh://localhost:${constants.GIT_SSH_ANONYMOUS_MOCK_SERVER_PORT}/repo1.git`
        // );

        const cacheService = await testContext.context.serviceFactory('cache', {
          context: testContext.context,
          workingPath: '.',
          workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
          rootPath: testContext.testEnvVars.workspacePath
        })

        // const fetchOptions: FetchOptions = {
        //   // cacheService: await testContext.context.serviceFactory("cache", {
        //   //   context: testContext.context,
        //   //   workingPath: ".",
        //   //   workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
        //   //   rootPath: testContext.testEnvVars.workspacePath,
        //   // }),
        //   // cacheManager: await AddressCacheManager.initialise({
        //   //   context: testContext.context,
        //   //   workingPath: ".",
        //   //   workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
        //   //   rootPath: testContext.testEnvVars.workspacePath,
        //   // }),
        //   sourceAddress,
        //   destinationAddress: testContext.testEnvVars.workspacePath,
        // };

        const fetchLifecycleRes =
          await testContext.context.lifecycles.fetchContent.executeFetchContent(
            {
              common: {
                context: testContext.context,
                workspacePath: testContext.testEnvVars.workspacePath,
                workingPath: '.',
                cacheService
              },
              options: [
                {
                  provider: 'git',
                  options: {
                    address: sourceAddress.original
                    // sourceAddress,
                    // destinationAddress: testContext.testEnvVars.workspacePath,
                  }
                }
              ]
            }
          )

        await assertCacheFs({
          fetchLifecycleRes,
          testContext,
          cacheRoot: testContext.testEnvVars.workspacePath,
          sourceAddress
          // fetchOptions,
        })

        // expectIsOk(fetchLifecycleRes);
        // const fetchResFirstProvider = fetchLifecycleRes.res[0];

        // expect(fetchResFirstProvider).toHaveProperty("provider", "git");
        // expect(fetchResFirstProvider).toHaveProperty("options");
        // expect(fetchResFirstProvider.options.contentPath.original).toMatch(
        //   `/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`
        // );
        // expect(fetchResFirstProvider.options.checksum).toEqual({
        //   globalVersion: 1,
        //   key: "b88173a5be2c98375765b949fdb2d235a8d55e12",
        // });

        // const cacheService = await testContext.context.serviceFactory("cache", {
        //   context: testContext.context,
        //   workingPath: ".",
        //   workspacePath: testContext.testEnvVars.workspacePath,
        //   rootPath: testContext.testEnvVars.workspacePath,
        // });
        // expect(await cacheService.has(sourceAddress)).toBeTruthy();

        // const fetchLifecycleCachedRes =
        //   await testContext.context.lifecycles.fetchContent.executeFetchContent(
        //     {
        //       common: {
        //         context: testContext.context,
        //         workspacePath: testContext.testEnvVars.workspacePath,
        //       },
        //       options: [
        //         {
        //           provider: "git",
        //           options: fetchOptions,
        //         },
        //       ],
        //     }
        //   );

        // expectIsOk(fetchLifecycleCachedRes);
        // const fetchResCachedFirstProvider = fetchLifecycleCachedRes.res[0];

        // expect(fetchResCachedFirstProvider).toHaveProperty("provider", "git");
        // expect(fetchResCachedFirstProvider).toHaveProperty("options");
        // expect(
        //   fetchResCachedFirstProvider.options.contentPath.original
        // ).toMatch(`/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`);
        // expect(fetchResCachedFirstProvider.options.checksum).toEqual({
        //   globalVersion: 1,
        //   key: "b88173a5be2c98375765b949fdb2d235a8d55e12",
        // });
      })
    })

    // THIS FETCH CONTENT LIFECYCLE IS GOOD FOR MAKING A CACHE LOCATION
    // NEED ANOTHER SERVICE + LIFECYCLE FOR GIT SUBTREE'ING INTO OUR REPO LOCATION

    // it.only("fetches; caches to cache root and produces content at destination", async () => {
    //   const persistentTestEnv = await createPersistentTestEnv({
    //     testName:
    //       "fetch-content:git:fetches; caches to cache root and produces content at destination",
    //   });
    //   await persistentTestEnv.test({}, async (testContext) => {
    //     const sourceAddress = addr.parseUrl(
    //       `ssh://localhost:${constants.GIT_SSH_ANONYMOUS_MOCK_SERVER_PORT}/repo1.git`
    //     );

    //     const cacheRoot = addr.pathUtils.join(
    //       testContext.testEnvVars.workspacePath,
    //       addr.parsePath("cacheRoot")
    //     ) as AddressPathAbsolute;
    //     const contentRoot = addr.pathUtils.join(
    //       testContext.testEnvVars.workspacePath,
    //       addr.parsePath("contentRoot")
    //     ) as AddressPathAbsolute;

    //     const fetchOptions: FetchOptions = {
    //       cacheService: await testContext.context.serviceFactory("cache", {
    //         context: testContext.context,
    //         workingPath: ".",
    //         workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
    //         rootPath: cacheRoot,
    //       }),
    //       sourceAddress,
    //       destinationAddress: contentRoot,
    //     };

    //     const fetchLifecycleRes =
    //       await testContext.context.lifecycles.fetchContent.executeFetchContent(
    //         {
    //           common: {
    //             context: testContext.context,
    //             workspacePath: testContext.testEnvVars.workspacePath,
    //           },
    //           options: [
    //             {
    //               provider: "git",
    //               options: fetchOptions,
    //             },
    //           ],
    //         }
    //       );

    //       await assertCacheFs({
    //         fetchLifecycleRes,
    //         testContext,
    //         cacheRoot,
    //         sourceAddress,
    //         fetchOptions,
    //       })

    //     // expectIsOk(fetchLifecycleRes);
    //     // const fetchResFirstProvider = fetchLifecycleRes.res[0];

    //     // expect(fetchResFirstProvider).toHaveProperty("provider", "git");
    //     // expect(fetchResFirstProvider).toHaveProperty("options");
    //     // expect(fetchResFirstProvider.options.contentPath.original).toMatch(
    //     //   `/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`
    //     // );
    //     // expect(fetchResFirstProvider.options.checksum).toEqual({
    //     //   globalVersion: 1,
    //     //   key: "b88173a5be2c98375765b949fdb2d235a8d55e12",
    //     // });

    //     // const cacheService = await testContext.context.serviceFactory("cache", {
    //     //   context: testContext.context,
    //     //   workingPath: ".",
    //     //   workspacePath: testContext.testEnvVars.workspacePath,
    //     //   rootPath: cacheRoot,
    //     // });
    //     // expect(await cacheService.has(sourceAddress)).toBeTruthy();

    //     // const fetchLifecycleCachedRes =
    //     //   await testContext.context.lifecycles.fetchContent.executeFetchContent(
    //     //     {
    //     //       common: {
    //     //         context: testContext.context,
    //     //         workspacePath: testContext.testEnvVars.workspacePath,
    //     //       },
    //     //       options: [
    //     //         {
    //     //           provider: "git",
    //     //           options: fetchOptions,
    //     //         },
    //     //       ],
    //     //     }
    //     //   );

    //     // expectIsOk(fetchLifecycleCachedRes);
    //     // const fetchResCachedFirstProvider = fetchLifecycleCachedRes.res[0];

    //     // expect(fetchResCachedFirstProvider).toHaveProperty("provider", "git");
    //     // expect(fetchResCachedFirstProvider).toHaveProperty("options");
    //     // expect(
    //     //   fetchResCachedFirstProvider.options.contentPath.original
    //     // ).toMatch(`/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`);
    //     // expect(fetchResCachedFirstProvider.options.checksum).toEqual({
    //     //   globalVersion: 1,
    //     //   key: "b88173a5be2c98375765b949fdb2d235a8d55e12",
    //     // });

    //   });
    // });
  })
})
