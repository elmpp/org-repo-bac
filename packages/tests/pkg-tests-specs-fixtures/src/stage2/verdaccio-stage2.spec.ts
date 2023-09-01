import { AddressPathAbsolute, addr } from "@business-as-code/address";
import { constants } from "@business-as-code/core";
import {
  createExpectUtil,
  createPersistentTestEnv,
} from "@business-as-code/tests-core";

describe("verdaccio", () => {
  // describe("stage1 content is produced according to current 'cliSource'", () => {
  //   it("cliLinked", async () => {
  //     const persistentTestEnv = await createPersistentTestEnv({});

  //     await persistentTestEnv.test({}, async (testContext) => {

  //       if (testContext.testEnvVars.cliSourceActive !== 'cliLinked') {
  //         return
  //       }

  //       testContext.setActiveWorkspacePaths({
  //         workspace: testContext.testEnvVars.workspacePath,
  //       });

  //       const resCopy = await testContext.copy(
  //         "initialise:workspace git-minimal-http relative config",
  //         testContext.testEnvVars.workspacePath
  //       );

  //       assertCommon({testContext, res: resCopy, configFilename: "skeleton.js" as Filename})

  //       await (async function expectManifestIsOk() {

  //         const expectFs = resCopy.res.expectUtil.createFs()

  //         expect(expectFs.readJson('package.json')).toHaveProperty(['dependencies', '@business-as-code/cli'], expect.stringMatching(/^link\:.*pkg-cli$/))
  //       })();
  //     });
  //   });

  //   it("cliRegistry", async () => {
  //     const persistentTestEnv = await createPersistentTestEnv({});

  //     await persistentTestEnv.test({}, async (testContext) => {

  //       if (testContext.testEnvVars.cliSourceActive !== 'cliRegistry') {
  //         return
  //       }

  //       testContext.setActiveWorkspacePaths({
  //         workspace: testContext.testEnvVars.workspacePath,
  //       });

  //       const resCopy = await testContext.copy(
  //         "initialise:workspace default skeleton config",
  //         testContext.testEnvVars.workspacePath
  //       );

  //       assertCommon({testContext, res: resCopy, configFilename: "skeleton.js" as Filename})

  //       await (async function expectManifestIsOk() {

  //         const expectFs = resCopy.res.expectUtil.createFs()

  //         expect(expectFs.readJson('package.json')).toHaveProperty(['dependencies', '@business-as-code/cli'], 'bollards')
  //       })();
  //     });
  //   });
  // });

  it("caches uplinked packages", async () => {
    const persistentTestEnv = await createPersistentTestEnv({
      defaultLogLevel: "debug",
    });
    await persistentTestEnv.test({}, async (testContext) => {
      if (testContext.testEnvVars.cliSourceActive !== "cliRegistry") {
        return;
      }

      // because stage2, we can assume verdaccio has been hit

      const verdaccioStoragePath = addr.parsePath(
        constants.VERDACCIO_STORAGE_PATH
      ) as AddressPathAbsolute;

      const expectUtil = createExpectUtil({
        workspacePath: verdaccioStoragePath,
        testEnvVars: testContext.testEnvVars,
      });
      const expectFs = expectUtil.createFs();

      console.log(`verdaccioStoragePath :>> `, verdaccioStoragePath);
      console.log(`expectFs.di :>> `, expectFs.getDir(".").subdirs);

      expect(expectFs.getDir(".").subdirs).toEqual(
        expect.objectContaining([
          "@business-as-code", // is created when we publish snapshots anyway
          "@moonrepo", // verdaccio caching of uplink packages - https://tinyurl.com/29f7dvfw. Perhaps you need to do a `pnpm install --force` to flush through verdaccio
        ])
      );

      // console.log(`expectUtil :>> `, expectUtil)

      // await testContext.runServiceCb({
      //   serviceOptions: {
      //     serviceName: "packageManager",
      //     cb: async ({ service }) => {
      //       await service.install()
      //     },
      //     initialiseOptions: {
      //       workingPath: ".",
      //     },
      //   },
      // });

      // testContext.setActiveWorkspacePaths({workspace: testContext.testEnvVars.checkoutPath}) IS THIS REALLY SILLY SWITCHING TO TEST/CHECKOUT PATH + EXPECTING RUNSERVICECB TO OPERATE?
      // console.log(`testContext.testEnvVars.checkoutPath :>> `, testContext.testEnvVars.checkoutPath)
      // const verdaccioStoragePath = addr.parsePath(constants.VERDACCIO_STORAGE_PATH)
      // await testContext.runServiceCb({
      //   serviceOptions: {
      //     serviceName: "packageManager",
      //     cb: async ({ service }) => {
      //       await service.install()
      //     },
      //     initialiseOptions: {
      //       workingPath: ".",
      //     },
      //   },
      // });

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
