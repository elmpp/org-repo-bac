import { addr } from "@business-as-code/address";
import { expectIsOk } from "@business-as-code/core";
import { Filename, xfs } from "@business-as-code/fslib";
import {
  createPersistentTestEnv,
  TestContext,
} from "@business-as-code/tests-core";

/**
 * Checks content produced in stage0
 */
describe("initialise workspace", () => {
  jest.setTimeout(25000);

  async function setup({
    testContext,
    configFilename,
    stage0Content,
  }: {
    testContext: TestContext;
    configFilename: Filename;
    stage0Content: keyof Stage0Content;
  }) {
    const resCopy = await testContext.copy(
      stage0Content,
      testContext.testEnvVars.workspacePath
    );

    let expectConfig = resCopy.res.expectUtil.createConfig();

    await (async function expectWorkspaceHasConfig() {
      expectIsOk(resCopy);

      await expectConfig.isValid();

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
      ); // the stage0 data is good
    })();
  }

  describe("creates a skeleton workspace without configPath using skeleton config", () => {
    it("is produced ok", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});

      await persistentTestEnv.test({}, async (testContext) => {
        testContext.setActiveWorkspacePath(
          testContext.testEnvVars.workspacePath
        );

        console.log(
          `testContext.testEnvVars.workspacePath :>> `,
          testContext.testEnvVars.workspacePath
        );

        await setup({
          testContext,
          configFilename: "skeleton.js" as Filename,
          stage0Content:
            "creates a skeleton workspace without configPath using skeleton config",
        });
      });
    });
  });
});
