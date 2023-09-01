import { expectIsOk, validators } from "@business-as-code/core";

import { createPersistentTestEnv } from "@business-as-code/tests-core";

describe("query projects", () => {
  jest.setTimeout(25000);

  it("produces valid json projects response with --json", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const res = await testContext.command(
        [
          "query",
          "projects",
          "--workspacePath",
          testContext.testEnvVars.checkoutPath.original,
          "--json",
        ],
        {
          logLevel: "debug",
        }
      );

      // console.log(`res :>> `, res)

      expectIsOk(res);

      const expectStdout = res.res.expectUtil.createStdout();

      // it should be compatible with our moon projects validator
      expect(
        validators.moonQueryProjects.safeParse(
          res.res.expectUtil.options.outputs.stdout
        )
      ).toBeTruthy();

      const projectJson = expectStdout.asJson({ json5: false });

      expect(projectJson).toHaveProperty(["projects"]);
    });
  });
  it("produces valid string projects response without --json (and regardless of the logLevel)", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const res = await testContext.command(
        [
          "query",
          "projects",
          "--workspacePath",
          testContext.testEnvVars.checkoutPath.original,
        ],
        {
          logLevel: "error", // output should still appear
        }
      );

      expectIsOk(res);

      const expectStdout = res.res.expectUtil.createStdout();
      expectStdout.lineContainsString({
        match: `plugin-core-essentials | packages/plugin-core-essentials | library | typescript`,
        occurrences: 1,
      });
    });
  });
});

describe("errors", () => {
  it("--json suppresses logger output, as suggested with --logLevel=debug", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const res = await testContext.command(
        [
          "query",
          "projects",
          "--workspacePath",
          testContext.testEnvVars.checkoutPath.original,
          "--json",
        ],
        { logLevel: "debug" }
      );

      expectIsOk(res);
      const expectStdout = res.res.expectUtil.createStdout();
      const expectStderr = res.res.expectUtil.createStderr();

      expectStdout.asJson({}); // --json isn't turning off loggers. Any console.logs() ??
      expectStderr.lineContainsString({
        match: `Command 'QueryProjects' has returned a value but the current output settings do not guarantee clean outputting`,
        occurrences: 0,
      });
    });
  });
});
