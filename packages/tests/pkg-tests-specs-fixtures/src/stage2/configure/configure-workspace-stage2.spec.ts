import { expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";

describe("configure workspace", () => {
  jest.setTimeout(25000);

  it("skeleton workspace produces empty rc", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});

    await persistentTestEnv.test({}, async (testContext) => {
      testContext.setActiveWorkspacePath(testContext.testEnvVars.workspacePath);

      const resCopy = await testContext.copy(
        "creates a skeleton workspace without configPath using skeleton config",
        testContext.testEnvVars.workspacePath
      );

      let expectConfig = resCopy.res.expectUtil.createConfig();

      // const res = await testContext.command(
      //   [
      //     "configure",
      //     "workspace",
      //     "--workspacePath",
      //     testContext.testEnvVars.workspacePath.original,
      //   ],
      //   { logLevel: "debug" }
      // );

      // expectIsOk(res)
    });
  });
});

describe("errors", () => {
  // it("nonexistent command is handled and added to stderr", async () => {
  //   const persistentTestEnv = await createPersistentTestEnv({});
  //   await persistentTestEnv.test({}, async (testContext) => {
  //     const res = await testContext.command(["does-not-exist"], {
  //       logLevel: "debug",
  //     });
  //     expectIsFail(res);
  //     // console.log(`res :>> `, res.res.expectUtil.options)
  //     const expectStdout = res.res.expectUtil.createStdout();
  //     const expectStderr = res.res.expectUtil.createStderr();
  //     expectStderr.lineContainsString({
  //       match: "command does-not-exist not found",
  //       occurrences: 1,
  //     });
  //     expectStdout.lineContainsString({
  //       match: "command does-not-exist not found",
  //       occurrences: 0,
  //     });
  //   });
  // });
  // it("incorrect command flags", async () => {
  //   const persistentTestEnv = await createPersistentTestEnv({});
  //   await persistentTestEnv.test({}, async (testContext) => {
  //     const res = await testContext.command(
  //       [
  //         "initialise",
  //         "workspace",
  //         "--blah",
  //         "noThere",
  //         "--workspacePath",
  //         testContext.testEnvVars.workspacePath.original,
  //       ],
  //       { logLevel: "debug" }
  //     );
  //     expectIsFail(res);
  //     const expectStdout = res.res.expectUtil.createStdout();
  //     const expectStderr = res.res.expectUtil.createStderr();
  //     expectStderr.lineContainsString({
  //       match: "Error: Nonexistent flag: --blah",
  //       occurrences: 1,
  //     });
  //     expectStdout.lineContainsString({
  //       match: "Error: Nonexistent flag: --blah",
  //       occurrences: 0,
  //     }); // we handle caught errors via BaseCommand.handleError
  //   });
  // });
  // it("incorrect command args", async () => {
  //   const persistentTestEnv = await createPersistentTestEnv({});
  //   await persistentTestEnv.test({}, async (testContext) => {
  //     const res = await testContext.command(
  //       [
  //         "initialise",
  //         "workspace",
  //         "nonExistentArg",
  //         "--workspacePath",
  //         testContext.testEnvVars.workspacePath.original,
  //       ],
  //       { logLevel: "debug" }
  //     );
  //     expectIsFail(res);
  //     const expectStdout = res.res.expectUtil.createStdout();
  //     const expectStderr = res.res.expectUtil.createStderr();
  //     expectStderr.lineContainsString({
  //       match: `Error: command initialise:workspace:nonExistentArg not found`,
  //       occurrences: 1,
  //     });
  //     expectStdout.lineContainsString({
  //       match: `Error: command initialise:workspace:nonExistentArg not found`,
  //       occurrences: 0,
  //     }); // we handle caught errors via BaseCommand.handleError
  //   });
  // });
  // it("--workspacePath is required", async () => {
  //   const persistentTestEnv = await createPersistentTestEnv({});
  //   await persistentTestEnv.test({}, async (testContext) => {
  //     const res = await testContext.command(
  //       ["initialise", "workspace", "--name", "something"],
  //       { logLevel: "debug" }
  //     );
  //     expectIsFail(res);
  //     const expectStdout = res.res.expectUtil.createStdout();
  //     const expectStderr = res.res.expectUtil.createStderr();
  //     expectStderr.lineContainsString({
  //       match: `Missing required flag workspacePath`,
  //       occurrences: 1,
  //     });
  //     expectStdout.lineContainsString({
  //       match: `Missing required flag workspacePath`,
  //       occurrences: 0,
  //     }); // we handle caught errors via BaseCommand.handleError
  //   });
  // });
});
