import { AddressPathAbsolute, addr } from "@business-as-code/address";
import {
  constants,
  expectIsOk,
  fsUtils,
  validators,
} from "@business-as-code/core";
import { Filename, xfs } from "@business-as-code/fslib";
import {
  TestContext,
  createPersistentTestEnv,
} from "@business-as-code/tests-core";

/** simply turns /bac.js -> /.bac/bac.json */
describe("configure workspace", () => {
  jest.setTimeout(10000);

  async function setup(testContext: TestContext, configFilename: Filename) {
    const resCopy = await testContext.copy(
      "initialise:workspace default skeleton config",
      testContext.testEnvVars.workspacePath
    );

    let expectConfig = await resCopy.res.expectUtil.createConfig();

    await (async function updateConfig() {
      const configPath = fsUtils.resolveCoreConfig(configFilename);
      await xfs.copyFilePromise(
        configPath.address,
        addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath(constants.RC_FILENAME)
        ).address
      );

      expectConfig = await resCopy.res.expectUtil.createConfig();

      expectConfig.expectText.equals(
        xfs.readFileSync(configPath.address, "utf8")
      ); // it's updated
    })();
  }

  it("git-minimal-http", async () => {
    const persistentTestEnv = await createPersistentTestEnv({
      // defaultLogLevel: "debug",
    });
    await persistentTestEnv.test({}, async (testContext) => {
      await setup(testContext, "git-minimal-http.js" as Filename);

      const bacService = await testContext.context.serviceFactory('bac', {
        context: testContext.context,
        workspacePath: testContext.testEnvVars.workspacePath,
        workingPath: '.',
      })

      const config = await bacService.loadConfig();

      const res =
        await testContext.context.lifecycles.configureWorkspace.executeConfigureWorkspace(
          {
            common: {
              context: testContext.context,
              workspacePath: testContext.testEnvVars.workspacePath,
            },
            options: {
              config,
            },
          }
        );
      // console.log(`res :>> `, res)
      expectIsOk(res);

      // the output of configure-workspace should be a ConfigSynchronised. This should be validatable
      const validRes = validators.config.configSynchronisedSchema.safeParse(
        res.res
      );

      // console.log(`res.res :>> `, require('util').inspect(res.res, {showHidden: false, depth: undefined, colors: true}))

      // console.log(`validRes :>> `, require('util').inspect(validRes.error, {showHidden: false, depth: undefined, colors: true}))

      expect(validRes).toHaveProperty("success", true);

      // console.log(
      //   `res :>> `,
      //   require("util").inspect(res, {
      //     showHidden: false,
      //     depth: undefined,
      //     colors: true,
      //   })
      // );

      expect(res.res).toEqual(
        expect.objectContaining({
          projects: expect.arrayContaining([
            {
              provider: "git",
              options: expect.objectContaining({
                address: "http://localhost:8174/repo1.git",
              }),
            },
          ]),
          version: expect.stringMatching(/.*/)
        })
      );

      // const sourceAddress = addr.parseUrl("ssh://localhost:2224/repo1.git");

      // const fetchOptions: FetchOptions = {
      //   cacheService: await testContext.context.serviceFactory("cache", {
      //     context: testContext.context,
      //     workingPath: ".",
      //     workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
      //     // rootPath: addr.parsePath(
      //     //   constants.CACHE_STORAGE_PATH
      //     // ) as AddressPathAbsolute, // defines the base of the cache service
      //     rootPath: testContext.testEnvVars.workspacePath,
      //   }),
      //   // sourceAddress: addr.parseUrl('http://localhost:8174/repo1.git'),
      //   sourceAddress,
      //   destinationAddress: testContext.testEnvVars.workspacePath,
      // };

      // const res =
      //   await testContext.context.lifecycles.fetchContent.executeFetchContent([
      //     {
      //       provider: "git",
      //       options: {
      //         context: testContext.context,
      //         workspacePath: testContext.testEnvVars.workspacePath,
      //         // workspacePath: addr.parsePath(
      //         //   constants.CACHE_STORAGE_PATH
      //         // ) as AddressPathAbsolute,
      //         options: fetchOptions,
      //       },
      //     },
      //   ]);

      // expectIsOk(res);

      // // const expectUtil = await testContext.createExpectUtil({workspacePath: testContext.testEnvVars.workspacePath})
      // // const expectFs = expectUtil.createFs()

      // const cacheService = await testContext.context.serviceFactory("cache", {
      //   context: testContext.context,
      //   rootPath: testContext.testEnvVars.workspacePath,
      //   workspacePath: testContext.testEnvVars.workspacePath,
      //   workingPath: ".",
      // });

      // expect(await cacheService.has(sourceAddress)).toBeTruthy();
      // const cacheRes = await cacheService.get({ address: sourceAddress });

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
