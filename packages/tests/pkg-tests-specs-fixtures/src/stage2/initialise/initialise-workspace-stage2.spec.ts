import { addr } from "@business-as-code/address";
import { UnwrapPromise, expectIsOk } from "@business-as-code/core";
import { Filename, xfs } from "@business-as-code/fslib";
import {
  createPersistentTestEnv,
  TestContext,
} from "@business-as-code/tests-core";

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

      let expectConfig = res.res.expectUtil.createConfig();

      const cliCheckoutPath = addr.packageUtils.resolve({
        address: addr.parsePackage(`@business-as-code/cli`),
        projectCwd: testContext.testEnvVars.checkoutPath,
        strict: true,
      });

      const configPath = addr.packageUtils.resolve({
        address: addr.parsePackage(
          `@business-as-code/core/src/etc/config/${configFilename}`
        ),
        projectCwd: cliCheckoutPath,
        strict: true,
      });

      expectConfig.expectText.equals(
        xfs.readFileSync(configPath.address, "utf8")
      ); // the stage1 data is good
    })();

    await (async function expectManifestIsOk() {

      const expectFs = res.res.expectUtil.createFs()

      expect(expectFs.readJson('package.json')).toHaveProperty(['dependencies', '@business-as-code/cli'])
    })();
  }

  describe("initialise:workspace default skeleton config", () => {
    it("is produced ok", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});

      await persistentTestEnv.test({}, async (testContext) => {
        testContext.setActiveWorkspaceCliPath(
          testContext.testEnvVars.workspacePath
        );

        const resCopy = await testContext.copy(
          "initialise:workspace default skeleton config",
          testContext.testEnvVars.workspacePath
        );

        assertCommon({testContext, res: resCopy, configFilename: "skeleton.js" as Filename})
      });
    });
  });

  describe.only("initialise:workspace git-minimal relative config", () => {
    it("is produced ok", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});

      await persistentTestEnv.test({}, async (testContext) => {
        testContext.setActiveWorkspaceCliPath(
          testContext.testEnvVars.workspacePath
        );

        const resCopy = await testContext.copy(
          "initialise:workspace git-minimal relative config",
          testContext.testEnvVars.workspacePath
        );

        assertCommon({testContext, res: resCopy, configFilename: "git-minimal.js" as Filename})
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

        testContext.setActiveWorkspaceCliPath(
          testContext.testEnvVars.workspacePath
        );

        const resCopy = await testContext.copy(
          "initialise:workspace git-minimal relative config",
          testContext.testEnvVars.workspacePath
        );

        assertCommon({testContext, res: resCopy, configFilename: "skeleton.js" as Filename})

        await (async function expectManifestIsOk() {

          const expectFs = resCopy.res.expectUtil.createFs()

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

        testContext.setActiveWorkspaceCliPath(
          testContext.testEnvVars.workspacePath
        );

        const resCopy = await testContext.copy(
          "initialise:workspace default skeleton config",
          testContext.testEnvVars.workspacePath
        );

        assertCommon({testContext, res: resCopy, configFilename: "skeleton.js" as Filename})

        await (async function expectManifestIsOk() {

          const expectFs = resCopy.res.expectUtil.createFs()

          expect(expectFs.readJson('package.json')).toHaveProperty(['dependencies', '@business-as-code/cli'], 'latest')
        })();
      });
    });
  });
});
