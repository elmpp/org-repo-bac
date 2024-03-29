import { addr } from "@business-as-code/address";
import { formatUtils } from "@business-as-code/core";
import { xfs } from "@business-as-code/fslib";
import { createPersistentTestEnv } from "@business-as-code/tests-core";

/** simply ensures the testEnv core util is operating properly */
describe("test-env-smoke-test", () => {
  jest.setTimeout(30000);

  // when publishing, the /src should be restored
  it("collections.json remain as /src", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const collectionJsonPath = addr.pathUtils.join(
        testContext.testEnvVars.checkoutPath,
        addr.parsePath("packages/plugin-core-essentials/collection.json")
      );
      const collectionJson = await xfs.readFilePromise(
        collectionJsonPath.address,
        "utf-8"
      );
      const collection = formatUtils.JSONParse(collectionJson);

      expect(collection).toHaveProperty(
        ["schematics", "initialise-workspace", "factory"],
        expect.stringMatching("./src/schematics/")
      );

      expect(testContext.testEnvVars.cliSourceActive).toMatch(
        /cliLinked|cliRegistry/
      ); // active is the required runtime env value
    });
  });

  describe("daemons are running ok", () => {
    it("git-ssh repositories are visible", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {

        // const gitService = await testContext.testEnvVars

        const collectionJsonPath = addr.pathUtils.join(
          testContext.testEnvVars.checkoutPath,
          addr.parsePath("packages/plugin-core-essentials/collection.json")
        );
        const collectionJson = await xfs.readFilePromise(
          collectionJsonPath.address,
          "utf-8"
        );
        const collection = formatUtils.JSONParse(collectionJson);

        expect(collection).toHaveProperty(
          ["schematics", "initialise-workspace", "factory"],
          expect.stringMatching("./src/schematics/")
        );

        expect(testContext.testEnvVars.cliSourceActive).toMatch(
          /cliLinked|cliRegistry/
        ); // active is the required runtime env value
      });
    });
  });
});
