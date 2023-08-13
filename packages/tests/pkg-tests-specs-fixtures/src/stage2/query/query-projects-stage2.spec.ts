import { expectIsFail, expectIsOk, validators } from "@business-as-code/core";

import { createPersistentTestEnv } from "@business-as-code/tests-core";

describe("query projects", () => {
  jest.setTimeout(25000);

  it("produces valid projects response", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const res = await testContext.command([
        "query",
        "projects",
        "--workspacePath",
        testContext.testEnvVars.checkoutPath.original,
        "--json"
      ], {
        logLevel: "debug",
      });

      // console.log(`res :>> `, res)

      expectIsOk(res);

      const expectStdout = res.res.expectUtil.createStdout();
      // const expectStderr = res.res.expectUtil.createStderr();

      // it should be compatible with our moon projects validator
      expect(validators.moonQueryProjects.safeParse(res.res.expectUtil.options.outputs.stdout)).toBeTruthy()

      const projectJson = expectStdout.asJson({json5: false})

      expect(projectJson).toHaveProperty(['projects'])

      // expectStderr.lineContainsString({
      //   match: `Missing required flag workspacePath`,
      //   occurrences: 1,
      // });
      // expectStdout.lineContainsString({
      //   match: `Missing required flag workspacePath`,
      //   occurrences: 0,
      // }); // we handle caught errors via BaseCommand.handleError
    });
  });
});

describe("errors", () => {
  it("--json or --logLevel=error must be present to view output", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const res = await testContext.command(
        [
          "query",
          "projects",
          "--workspacePath",
          testContext.testEnvVars.checkoutPath.original,
        ],
        { logLevel: "warn" }
      );

      expectIsFail(res);
      const expectStdout = res.res.expectUtil.createStdout();
      const expectStderr = res.res.expectUtil.createStderr();
      expectStderr.lineContainsString({
        match: `Command 'QueryProjects' has returned a value but the current output settings do not guarantee clean outputting`,
        occurrences: 1,
      });
      expectStdout.lineContainsString({
        match: `Command 'QueryProjects' has returned a value but the current output settings do not guarantee clean outputting`,
        occurrences: 0,
      }); // we handle caught errors via BaseCommand.handleError
    });
  });
  it("--logLevel=error allows json outputting", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const res = await testContext.command(
        [
          "query",
          "projects",
          "--workspacePath",
          testContext.testEnvVars.checkoutPath.original,
        ],
        { logLevel: "error" }
      );

      // expectIsOk(res);
      // const expectStdout = res.res.expectUtil.createStdout();
      // const expectStderr = res.res.expectUtil.createStderr();

      // expectStdout.asJson() // --logLevel=error isn't removing all content. Any console.logs() ??
      // expectStderr.lineContainsString({
      //   match: `Command 'QueryProjects' has returned a value but the current output settings do not guarantee clean outputting`,
      //   occurrences: 0,
      // });
    });
  });
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

      expectStdout.asJson({}) // --json isn't turning off loggers. Any console.logs() ??
      expectStderr.lineContainsString({
        match: `Command 'QueryProjects' has returned a value but the current output settings do not guarantee clean outputting`,
        occurrences: 0,
      });
    });
  });

});
