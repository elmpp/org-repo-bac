// import { addr } from "@business-as-code/address";
// import { formatUtils } from "@business-as-code/core";
// import { xfs } from "@business-as-code/fslib";
// import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { describe, it, jest, expect } from 'bun:test'
export {}

/** are we creating our packages correctly */
describe('workspaces-smoke-test', () => {
  // jest.setTimeout(30000);

  // publishable packages should include specific attributes
  it('publishable packages correct', async () => {
    // const persistentTestEnv = await createPersistentTestEnv({});
    // await persistentTestEnv.test({}, async (testContext) => {
    //   const context = testContext.testEnvVars.
    //   const moonService = await testContext..serviceFactory("moon", {
    //     context: this.options.context,
    //     workingPath: ".",
    //   });
    //   const publishableProjects = await moonService.findProjects({
    //     query,
    //   });
    //   const collectionJsonPath = addr.pathUtils.join(
    //     testContext.testEnvVars.checkoutPath,
    //     addr.parsePath("packages/plugin-core-essentials/collection.json")
    //   );
    //   const collectionJson = await xfs.readFilePromise(
    //     collectionJsonPath.address,
    //     "utf-8"
    //   );
    //   const collection = formatUtils.JSONParse(collectionJson);
    //   expect(collection).toHaveProperty(
    //     ["schematics", "initialise-workspace", "factory"],
    //     expect.stringMatching("./src/schematics/")
    //   );
    // });
  })
})
