import { Result, assertIsOk } from "@business-as-code/core";
import { addr } from "@business-as-code/address";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import assert from "assert";
import {
  expectIsFail,
  expectIsOk,
} from "@business-as-code/tests-core/src/test-utils";

/** simply ensures the testEnv core util is operating properly */
describe("workspace init", () => {
  jest.setTimeout(25000);

  // it ('blah', async () => {
  //   expect(true).toBeTruthy()

  // let persistentTestEnv: PersistentTestEnv

  // beforeAll(async () => {
  //   persistentTestEnv = await createPersistentTestEnv({
  //     // needs to be inside configured Moon directory
  //     // basePath: () => addr.pathUtils.resolve(addr.parsePath('..')),
  //     // basePath: () => addr.parseAsType('../', 'portablePathPosixAbsolute'),
  //   })
  // })

  // })
  it("creates a skeleton workspace without configPath", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      // const {envVars} = testContext

      // console.log(`envVars :>> `, envVars)

      // expect(envVars.checkoutPath.original).toEqual('/Users/matt/dev/org-repo-moonrepo')
      // expect(envVars.basePath.original).toEqual('/Users/matt/dev/org-repo-moonrepo/etc/var')
      // expect(envVars.destinationPath.original).toMatch('/Users/matt/dev/org-repo-moonrepo/etc/var/tests')

      // console.log(`envVars :>> `, envVars)

      // const {} = testContext

      // let outputs: Outputs = {
      //   stdout: '',
      //   stderr: '',
      // }

      // testContext.mockStdStart()
      // const exitCode = await testContext.command(['workspace', 'init', testContext.envVars.destinationPath.original])
      const exitCode = await testContext.command(
        [
          "workspace",
          "init",
          "--name",
          "my-new-workspace",
          "--workspacePath",
          testContext.envVars.workspacePath.original,
        ],
        { logLevel: "debug" }
      );
      expect(exitCode).toEqual(0);
      // console.log(`exitCode :>> `, exitCode)

      // await testContext.command(['something', 'else'])
      // const outputs = testContext.mockStdEnd()

      // expect(outputs).not.toMatch('')

      // console.log(`outputs :>> `, outputs)

      // return {
      //   outputs,
      // }
    });
  });
  it.only("creates a skeleton workspace with absolute configPath", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      // testContext.mockStdStart()
      // const exitCode = await testContext.command(['workspace', 'init', testContext.envVars.destinationPath.original])

      const configPath = addr.pathUtils.join(
        testContext.envVars.fixturesPath,
        addr.parsePath("mocks/input1.json")
      );

      const res = await testContext.command(
        [
          "workspace",
          "init",
          "--name",
          "my-new-workspace",
          "--workspacePath",
          testContext.envVars.workspacePath.original,
          "--configPath",
          configPath.original,
        ],
        { logLevel: "debug" }
      );

      // if (assertIsOk(res)) {
      //   const success = res.success
      // }
      // assertIsOk()

      expectIsOk(res);

      console.log(`res.res.tree. :>> `, res.res.tree.getDir("."));
      console.log(
        `res.res.tree.read('./BOLLOCKS.md') :>> `,
        res.res.tree.readText("./BOLLOCKS.md")
      );
      expect(res.res.tree.readText("./BOLLOCKS.md")).toEqual("PANTS");

      // expect(exitCode).toEqual(0)

      // console.log(`exitCode :>> `, exitCode)
    });
  });
  describe("errors", () => {
    it("nonexistent command", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(["does-not-exist"], {
          logLevel: "debug",
        });

        expectIsFail(res);
      });
    });
    it("incorrect command options", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "workspace",
            "init",
            "--blah",
            "noThere",
            "--workspacePath",
            testContext.envVars.workspacePath.original,
          ],
          { logLevel: "debug" }
        );

        expectIsFail(res);
      });
    });
    it("incorrect command options", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "workspace",
            "init",
            "nonExistentArg",
            "--workspacePath",
            testContext.envVars.workspacePath.original,
          ],
          { logLevel: "debug" }
        );

        expectIsFail(res);
      });
    });
  });
});
