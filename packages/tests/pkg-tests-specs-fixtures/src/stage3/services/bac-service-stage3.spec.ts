import { expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";

describe("bac-service", () => {
  jest.setTimeout(10000);

  it.only("getConfigEntry", async () => {
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



//       const configRes = await bacService.getConfigEntry();
// console.log(`configRes :>> `, configRes)
      // expectIsOk(configRes);
      // const config = configRes.res

      // expect(config.checksumValid).toBeTruthy() // fresh cache entry should show valid
      // expect(config.existentChecksum).toBeFalsy() // fresh cache entry

      // console.log(`config :>> `, config)

      // const expectConfig = await resCopy.res.expectUtil.createConfig();
      // expectConfig.expectText.equals(
      //   await expectConfig.loadCoreConfigContents('skeleton')
      // );
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

      const configRes = bacService.loadConfig();

      expectIsOk(configRes);
      const config = configRes.res

      expect(config).toHaveProperty('projectSource', [])
    });
  });
});
