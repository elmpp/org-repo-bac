import { expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { describe, it, jest, expect } from "bun:test";

/** simply ensures the testEnv core util is operating properly */
describe("release-snapshot", () => {
  // jest.setTimeout(30000);

  it.only("builds; creates changeset and publishes to local registry", async () => {
    const persistentTestEnv = await createPersistentTestEnv({
    });
    await persistentTestEnv.test({
      workspacePath: ({checkoutPath}) => checkoutPath, // this is required when pointing a command at a different location like below. It creates the tree etc
    }, async (testContext) => {

      const res = await testContext.command(
        [
          "release",
          "snapshot",
          "--registry",
          "http://localhost:4873",
          "--workspacePath",
          // testContext.testEnvVars.workspacePath.original,
          `${testContext.testEnvVars.checkoutPath.original}`,
          "--message",
          `Making a release`,

        ],
        { logLevel: "debug" }
      );

      expectIsOk(res);
    });
  });
});
