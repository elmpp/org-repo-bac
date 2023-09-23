import { expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";

describe("bac-service", () => {
  jest.setTimeout(10000);

  it("getConfig", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const bacService = await testContext.context.serviceFactory("bac", {
        context: testContext.context,
        workingPath: ".",
        workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
      });

      const resCopy = await testContext.copy(
        "initialise:workspace default skeleton config",
        testContext.testEnvVars.workspacePath
      );
      expectIsOk(resCopy);

      const config = await bacService.getConfig();

      console.log(`config :>> `, config);

      expectIsOk(config)

      const expectConfig = await resCopy.res.expectUtil.createConfig();
      expectConfig.expectText.equals(
        // xfs.readFileSync(gitHttpRepoUrl.address, "utf8")
        await expectConfig.loadCoreConfigContents('skeleton')
      ); // it's updated
    });
  });
  it("loadConfig", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const bacService = await testContext.context.serviceFactory("bac", {
        context: testContext.context,
        workingPath: ".",
        workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
      });

      const resCopy = await testContext.copy(
        "initialise:workspace default skeleton config",
        testContext.testEnvVars.workspacePath
      );
      expectIsOk(resCopy);

      const config = await bacService.loadConfig();

      const expectConfig = await resCopy.res.expectUtil.createConfig();
      expectConfig.expectText.equals(
        // xfs.readFileSync(gitHttpRepoUrl.address, "utf8")
        await expectConfig.loadCoreConfigContents('skeleton.js')
      ); // it's updated
    });
  });
});
