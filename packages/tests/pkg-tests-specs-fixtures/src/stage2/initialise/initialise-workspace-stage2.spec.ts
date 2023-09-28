import { addr } from "@business-as-code/address";
import { UnwrapPromise, constants, expectIsFail, expectIsOk } from "@business-as-code/core";
import { Filename, xfs } from "@business-as-code/fslib";
import {
  createPersistentTestEnv,
  TestContext,
} from "@business-as-code/tests-core";
import { assertions } from "../../assertions";

/**
 * Checks content produced in stage1
 */
describe("initialise workspace", () => {
  jest.setTimeout(25000);

  async function assertCommon({testContext, configFilename, res}: {
    testContext: TestContext,
    configFilename: Filename,
    res: UnwrapPromise<ReturnType<TestContext["command"]>>
  }
  ) {
    expectIsOk(res);

    await (async function expectWorkspaceHasConfig() {

      let expectConfig = await res.res.expectUtil.createConfig();

      const cliCheckoutPath = addr.packageUtils.resolve({
        address: addr.parsePackage(`@business-as-code/cli`),
        projectCwd: testContext.testEnvVars.checkoutPath,
        strict: true,
      });

      const configPath = addr.packageUtils.resolve({
        address: addr.parsePackage(
          `@business-as-code/core/etc/config/${configFilename}`
        ),
        projectCwd: cliCheckoutPath,
        strict: true,
      });

      expectConfig.expectText.equals(
        xfs.readFileSync(configPath.address, "utf8")
      ); // the stage1 data is good
    })();

    await (async function expectManifestIsOk() {

      const expectFs = await res.res.expectUtil.createFs()

      expect(expectFs.readJson('package.json')).toHaveProperty(['dependencies', '@business-as-code/cli'])
    })();
  }

  describe("initialise:workspace default skeleton config", () => {
    it("is produced ok", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});

      await persistentTestEnv.test({}, async (testContext) => {
        testContext.setActiveWorkspacePaths({
          workspace: testContext.testEnvVars.workspacePath,
        });

        const resCopy = await testContext.copy(
          "initialise:workspace default skeleton config",
          testContext.testEnvVars.workspacePath
        );

        assertCommon({testContext, res: resCopy, configFilename: "skeleton.js" as Filename})
      });
    });
  });

  describe("initialise:workspace git-minimal-http relative config", () => {
    it("is produced ok", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});

      await persistentTestEnv.test({}, async (testContext) => {
        testContext.setActiveWorkspacePaths({
          workspace: testContext.testEnvVars.workspacePath,
        });

        const resCopy = await testContext.copy(
          "initialise:workspace git-minimal-http relative config",
          testContext.testEnvVars.workspacePath
        );

        assertCommon({testContext, res: resCopy, configFilename: "git-minimal-http.js" as Filename})
      });
    });
  });

  describe("stage1 content is produced according to current 'cliSource'", () => {
    it("cliLinked", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});

      await persistentTestEnv.test({}, async (testContext) => {

        if (testContext.testEnvVars.cliSourceActive !== 'cliLinked') {
          return
        }

        testContext.setActiveWorkspacePaths({
          workspace: testContext.testEnvVars.workspacePath,
        });

        const resCopy = await testContext.copy(
          "initialise:workspace git-minimal-http relative config",
          testContext.testEnvVars.workspacePath
        );

        assertCommon({testContext, res: resCopy, configFilename: "skeleton.js" as Filename})

        await (async function expectManifestIsOk() {

          const expectFs = await resCopy.res.expectUtil.createFs()

          expect(expectFs.readJson('package.json')).toHaveProperty(['dependencies', '@business-as-code/cli'], expect.stringMatching(/^link\:.*pkg-cli$/))
        })();
      });
    });

    it("cliRegistry", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});

      await persistentTestEnv.test({}, async (testContext) => {

        if (testContext.testEnvVars.cliSourceActive !== 'cliRegistry') {
          return
        }

        testContext.setActiveWorkspacePaths({
          workspace: testContext.testEnvVars.workspacePath,
        });

        const resCopy = await testContext.copy(
          "initialise:workspace default skeleton config",
          testContext.testEnvVars.workspacePath
        );

        assertCommon({testContext, res: resCopy, configFilename: "skeleton.js" as Filename})

        await (async function expectManifestIsOk() {

          const expectFs = await resCopy.res.expectUtil.createFs()

          expect(expectFs.readJson('package.json')).toHaveProperty(['dependencies', '@business-as-code/cli'], 'bollards')
        })();
      });
    });
  });

  describe('errors', () => {
    it('initialise:workspace git-http unreachable config fails and prevents configure', async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
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
            "packages/pkg-core/etc/config/git-http-unreachable.js",
            "--cliPath",
            testContext.testEnvVars.checkoutCliPath.original,
          ],
          { logLevel: "debug" }
        );

        expectIsFail(res) // the configure-workspace git lifecycle provider should trigger a fail
        await assertions.workspace.commonFiles(testContext, res); // initialise-workspace has completed and created files
        await assertions.workspace.config(testContext, res, 'git-http-unreachable.js'); // initialise-workspace has still copied the config

        const expectStdout = await res.res.expectUtil.createStdout()
        const expectStderr = await res.res.expectUtil.createStderr()
        const expectFs = await res.res.expectUtil.createFs()

        expectStderr.lineContainsString({match: `repository 'http://localhost:8174/thisrepodoesnotexist.git/' not found`, occurrences: 1})
        expectStdout.lineContainsString({match: `repository 'http://localhost:8174/thisrepodoesnotexist.git/' not found`, occurrences: 0})
        expect(expectFs.existsSync(`${constants.RC_FOLDER}/${constants.RC_FILENAME}`)).toBeFalsy() // hasn't written the configured config

        // const expectFs = await res.res.expectUtil.createFs();
        // expect(res.res.expectUtil
        //   .createText(expectFs.readText(`${constants.RC_FOLDER}/${constants.RC_FILENAME}`)).asJson()
        // ).toEqual(expect.objectContaining([{
        //   provider: 'git',
        //   options: {
        //       address: `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/repo1.git`,
        //   }
        // }]))
      });
    })
  })
});
