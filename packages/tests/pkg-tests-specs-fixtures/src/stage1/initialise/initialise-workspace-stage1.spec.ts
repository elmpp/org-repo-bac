import { constants, expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { assertions } from "../../assertions";

declare global {
  interface Stage1Content {
    "initialise:workspace default skeleton config": true;
    "initialise:workspace git-minimal-http relative config": true;
    // 'initialise:workspace git-minimal-ssh-password relative config': true,
  }
}

/**
 * Stage0 tests are the only ones that may be copied by successive stage tests. Therefore, it is important
 * to keep them to a minimum as they'll always be ran before
 * Note also that the content produced will include both cliRegistry+cliLinked variants, to support other
 * tests being E2E or dev
 */
describe("initialise workspace", () => {
  jest.setTimeout(40000);

  describe("initialise:workspace default skeleton config", () => {
    it.only("cliRegistry", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        cliSource: "cliRegistry",
        cacheNamespaceFolder: "initialise:workspace default skeleton config",
      });
      await persistentTestEnv.test({}, async (testContext) => {
        // testContext.setActiveWorkspaceCliPath(testContext.testEnvVars.checkoutPath)
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "--name",
            "my-new-workspace",
            "--workspacePath",
            // `invalid:path`,
            `${testContext.testEnvVars.workspacePath.original}`,
            "--cliRegistry",
            "http://localhost:4873",
            "--cliVersion",
            "bollards",
          ],
          { logLevel: "debug" }
        );

        expectIsOk(res);

        await assertions.workspace.commonFiles(testContext, res);
        await assertions.workspace.config(testContext, res, "skeleton.js");

        const expectFs = res.res.expectUtil.createFs();
        res.res.expectUtil
          .createText(expectFs.readText("./.npmrc"))
          .lineContainsString({
            match: `@business-as-code:registry=http://localhost:4873`,
            occurrences: 1,
          }); // local npm registry set up
      });
    });
    it("cliLinked", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        cliSource: "cliLinked",
        cacheNamespaceFolder: "initialise:workspace default skeleton config",
      });
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "--name",
            "my-new-workspace",
            "--workspacePath",
            `${testContext.testEnvVars.workspacePath.original}`,
            "--cliPath",
            testContext.testEnvVars.checkoutCliPath.original,
          ],
          { logLevel: "debug" }
        );

        expectIsOk(res);
        await assertions.workspace.commonFiles(testContext, res);
        await assertions.workspace.config(testContext, res, "skeleton.js");

        const expectFs = res.res.expectUtil.createFs();
        res.res.expectUtil
          .createText(expectFs.readText("./.npmrc"))
          .lineContainsString({
            match: `@business-as-code:registry=https://registry.npmjs.org`,
            occurrences: 1,
          });
      });
    });
  });

  describe("initialise:workspace git-minimal-http relative config", () => {
    it("cliRegistry", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        cliSource: "cliRegistry",
        cacheNamespaceFolder:
          "initialise:workspace git-minimal-http relative config",
      });
      await persistentTestEnv.test({}, async (testContext) => {
        // testContext.setActiveWorkspaceCliPath(testContext.testEnvVars.checkoutPath)
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "--name",
            "my-new-workspace",
            "--workspacePath",
            `${testContext.testEnvVars.workspacePath.original}`,
            "--configPath",
            "packages/pkg-core/src/etc/config/git-minimal-http.js",
            "--cliRegistry",
            "http://localhost:4873",
            "--cliVersion",
            "bollards",
          ],
          { logLevel: "debug" }
        );

        expectIsOk(res);
        await assertions.workspace.commonFiles(testContext, res);
        await assertions.workspace.config(
          testContext,
          res,
          "git-minimal-http.js"
        );

        const expectFs = res.res.expectUtil.createFs();
        // res.res.expectUtil
        //   .createText(expectFs.readText("./.npmrc"))
        //   .lineContainsString({ match: `@business-as-code:registry=http://localhost:4873`, occurrences: 1 }); // local npm registry set up
        expect(
          res.res.expectUtil
            .createText(
              expectFs.readText(
                `${constants.RC_FOLDER}/${constants.RC_FILENAME}`
              )
            )
            .asJson()
        ).toEqual(
          expect.objectContaining([
            {
              provider: "git",
              options: {
                address: `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/repo1.git`,
              },
            },
          ])
        );
      });
    });
    it("cliLinked", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        cliSource: "cliLinked",
        cacheNamespaceFolder:
          "initialise:workspace git-minimal-http relative config",
      });
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "--name",
            "my-new-workspace",
            "--workspacePath",
            `${testContext.testEnvVars.workspacePath.original}`,
            "--configPath",
            "packages/pkg-core/src/etc/config/git-minimal-http.js",
            "--cliPath",
            testContext.testEnvVars.checkoutCliPath.original,
          ],
          { logLevel: "debug" }
        );

        expectIsOk(res);
        await assertions.workspace.commonFiles(testContext, res);
        await assertions.workspace.config(
          testContext,
          res,
          "git-minimal-http.js"
        );

        const expectFs = res.res.expectUtil.createFs();
        // res.res.expectUtil
        //   .createText(expectFs.readText("./.npmrc"))
        //   .lineContainsString({ match: `@business-as-code:registry=https://registry.npmjs.org`, occurrences: 1 });
        expect(
          res.res.expectUtil
            .createText(
              expectFs.readText(
                `${constants.RC_FOLDER}/${constants.RC_FILENAME}`
              )
            )
            .asJson()
        ).toEqual(
          expect.objectContaining([
            {
              provider: "git",
              options: {
                address: `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/repo1.git`,
              },
            },
          ])
        );
      });
    });
  });

  /** hard to automate in a test */
  // describe.skip("initialise:workspace git-minimal-ssh-password relative config", () => {
  //   it("cliRegistry", async () => {
  //     const persistentTestEnv = await createPersistentTestEnv({
  //       cliSource: "cliRegistry",
  //       cacheNamespaceFolder:
  //         "initialise:workspace git-minimal-ssh-password relative config",
  //     });
  //     await persistentTestEnv.test({}, async (testContext) => {
  //       // testContext.setActiveWorkspaceCliPath(testContext.testEnvVars.checkoutPath)
  //       const res = await testContext.command(
  //         [
  //           "initialise",
  //           "workspace",
  //           "--name",
  //           "my-new-workspace",
  //           "--workspacePath",
  //           `${testContext.testEnvVars.workspacePath.original}`,
  //           "--configPath",
  //           "packages/pkg-core/src/etc/config/git-minimal-ssh-password.js",
  //           "--cliRegistry",
  //           "http://localhost:4873",
  //         ],
  //         { logLevel: "debug" }
  //       );

  //       expectIsOk(res);
  //       await assertions.workspace.commonFiles(testContext, res);
  //       await assertions.workspace.config(
  //         testContext,
  //         res,
  //         "git-minimal-ssh-password.js"
  //       );

  //       const expectFs = res.res.expectUtil.createFs();
  //       // res.res.expectUtil
  //       //   .createText(expectFs.readText("./.npmrc"))
  //       //   .lineContainsString({ match: `@business-as-code:registry=http://localhost:4873`, occurrences: 1 }); // local npm registry set up
  //       expect(
  //         res.res.expectUtil
  //           .createText(
  //             expectFs.readText(
  //               `${constants.RC_FOLDER}/${constants.RC_FILENAME}`
  //             )
  //           )
  //           .asJson()
  //       ).toEqual(
  //         expect.objectContaining([
  //           {
  //             provider: "git",
  //             options: {
  //               address: `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/repo1.git`,
  //             },
  //           },
  //         ])
  //       );
  //     });
  //   });
  //   it("cliLinked", async () => {
  //     const persistentTestEnv = await createPersistentTestEnv({
  //       cliSource: "cliLinked",
  //       cacheNamespaceFolder:
  //         "initialise:workspace git-minimal-ssh-password relative config",
  //     });
  //     await persistentTestEnv.test({}, async (testContext) => {
  //       const res = await testContext.command(
  //         [
  //           "initialise",
  //           "workspace",
  //           "--name",
  //           "my-new-workspace",
  //           "--workspacePath",
  //           `${testContext.testEnvVars.workspacePath.original}`,
  //           "--configPath",
  //           "packages/pkg-core/src/etc/config/git-minimal-ssh-password.js",
  //           "--cliPath",
  //           testContext.testEnvVars.checkoutCliPath.original,
  //         ],
  //         { logLevel: "debug" }
  //       );

  //       expectIsOk(res);
  //       await assertions.workspace.commonFiles(testContext, res);
  //       await assertions.workspace.config(
  //         testContext,
  //         res,
  //         "git-minimal-ssh-password.js"
  //       );

  //       const expectFs = res.res.expectUtil.createFs();
  //       // res.res.expectUtil
  //       //   .createText(expectFs.readText("./.npmrc"))
  //       //   .lineContainsString({ match: `@business-as-code:registry=https://registry.npmjs.org`, occurrences: 1 });
  //       expect(
  //         res.res.expectUtil
  //           .createText(
  //             expectFs.readText(
  //               `${constants.RC_FOLDER}/${constants.RC_FILENAME}`
  //             )
  //           )
  //           .asJson()
  //       ).toEqual(
  //         expect.objectContaining([
  //           {
  //             provider: "git",
  //             options: {
  //               address: `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/repo1.git`,
  //             },
  //           },
  //         ])
  //       );
  //     });
  //   });
  // });
});
