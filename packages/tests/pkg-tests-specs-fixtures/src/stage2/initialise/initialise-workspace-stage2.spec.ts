import { expectIsFail } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";

describe("initialise workspace", () => {
  jest.setTimeout(25000);

  // it("creates a skeleton workspace with absolute configPath", async () => {
  //   const persistentTestEnv = await createPersistentTestEnv({});
  //   await persistentTestEnv.test({}, async (testContext) => {
  //     const cliCheckoutPath = addr.packageUtils.resolve({
  //       address: addr.parsePackage(`@business-as-code/cli`),
  //       projectCwd: testContext.testEnvVars.checkoutPath,
  //       strict: true,
  //     });

  //     const configPath = addr.packageUtils.resolve({
  //       address: addr.parsePackage(
  //         `@business-as-code/core/src/etc/config/skeleton.js`
  //       ),
  //       projectCwd: cliCheckoutPath,
  //       strict: true,
  //     });

  //     const res = await testContext.command(
  //       [
  //         "initialise",
  //         "workspace",
  //         "--name",
  //         "my-new-workspace",
  //         "--workspacePath",
  //         testContext.testEnvVars.workspacePath.original,
  //         "--configPath",
  //         configPath.original,
  //         "--cliRegistry",
  //         "http://localhost:4873",
  //       ],
  //       { logLevel: "debug" }
  //     );

  //     expectIsOk(res);

  //     const expectFs = res.res.expectUtil.createFs();
  //     const expectConfig = res.res.expectUtil.createConfig();
  //     expectConfig.isValid();

  //     res.res.expectUtil
  //       .createText(expectFs.readText("./.npmrc"))
  //       .lineContainsString({ match: `@business-as-code:`, occurrences: 1 }); // local npm registry set up
  //     res.res.expectUtil
  //       .createText(expectFs.readText("./BOLLOCKS.md"))
  //       .lineContainsString({ match: `PANTS`, occurrences: 1 }); // coming from second schematic synchronise-workspace

  //     res.res.expectUtil
  //       .createText(expectFs.readText("./package.json"))
  //       .lineContainsString({
  //         match: `"name": "my-new-workspace"`,
  //         occurrences: 1,
  //       })
  //       .lineContainsString({ match: `"private": true`, occurrences: 1 });
  //   });
  // });
  describe("errors", () => {
    it("nonexistent command is handled and added to stderr", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});

      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(["does-not-exist"], {
          logLevel: "debug",
        });

        expectIsFail(res);
        // console.log(`res :>> `, res.res.expectUtil.options)

        const expectStdout = res.res.expectUtil.createStdout();
        const expectStderr = res.res.expectUtil.createStderr();
        expectStderr.lineContainsString({
          match: "command does-not-exist not found",
          occurrences: 1,
        });
        expectStdout.lineContainsString({
          match: "command does-not-exist not found",
          occurrences: 0,
        });
      });
    });
    it("incorrect command flags", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "--blah",
            "noThere",
            "--workspacePath",
            `${testContext.testEnvVars.workspacePath.original}`,
          ],
          { logLevel: "debug" }
        );

        expectIsFail(res);

        const expectStdout = res.res.expectUtil.createStdout();
        const expectStderr = res.res.expectUtil.createStderr();
        expectStderr.lineContainsString({
          match: "Error: Nonexistent flag: --blah",
          occurrences: 1,
        });
        expectStdout.lineContainsString({
          match: "Error: Nonexistent flag: --blah",
          occurrences: 0,
        }); // we handle caught errors via BaseCommand.handleError
      });
    });
    it("incorrect command args", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "nonExistentArg",
            "--workspacePath",
            `${testContext.testEnvVars.workspacePath.original}`,
          ],
          { logLevel: "debug" }
        );

        expectIsFail(res);
        const expectStdout = res.res.expectUtil.createStdout();
        const expectStderr = res.res.expectUtil.createStderr();
        expectStderr.lineContainsString({
          match: `Error: command initialise:workspace:nonExistentArg not found`,
          occurrences: 1,
        });
        expectStdout.lineContainsString({
          match: `Error: command initialise:workspace:nonExistentArg not found`,
          occurrences: 0,
        }); // we handle caught errors via BaseCommand.handleError
      });
    });
    it("--workspacePath is required", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          ["initialise", "workspace", "--name", "something"],
          { logLevel: "debug" }
        );

        expectIsFail(res);
        const expectStdout = res.res.expectUtil.createStdout();
        const expectStderr = res.res.expectUtil.createStderr();
        expectStderr.lineContainsString({
          match: `Missing required flag workspacePath`,
          occurrences: 1,
        });
        expectStdout.lineContainsString({
          match: `Missing required flag workspacePath`,
          occurrences: 0,
        }); // we handle caught errors via BaseCommand.handleError
      });
    });
  });
});
