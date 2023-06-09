import { addr } from "@business-as-code/address";
import { expectIsFail, expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { xfs } from "@business-as-code/fslib"

/** simply ensures the testEnv core util is operating properly */
describe("initialise workspace", () => {
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
  it.only("creates a skeleton workspace without configPath using skeleton config", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      // const configPath = addr.pathUtils.join(
      //   addr.parsePath(__dirname),
      //   addr.parsePath(
      //     "mocks/config-single-static-project-source-javascript.js"
      //   )
      // ) as AddressPathAbsolute;

      // console.log(`configPath :>> `, configPath)

      const res = await testContext.command(
        [
          "initialise",
          "workspace",
          "--name",
          "my-new-workspace",
          "--workspacePath",
          testContext.testEnvVars.workspacePath.original,
          "--cliRegistry",
          "http://localhost:4873",
        ],
        { logLevel: "debug" }
      );

      expectIsOk(res);

      // const expectStdout = res.res.expectUtil.createStdout()
      // const expectStderr = res.res.expectUtil.createStderr()
      const expectFs = res.res.expectUtil.createFs();
      const expectConfig = res.res.expectUtil.createConfig();

      console.log(`testContext.testEnvVars.checkoutPath :>> `, testContext.testEnvVars.checkoutPath)

      const cliCheckoutPath = addr.packageUtils.resolve({
        address: addr.parsePackage(
          `@business-as-code/cli`
        ),
        projectCwd: testContext.testEnvVars.checkoutPath,
        strict: true,
      })

      const skeletonConfigPath = addr.packageUtils.resolve({
        address: addr.parsePackage(
          `@business-as-code/core/src/etc/config/skeleton.js`
        ),
        projectCwd: cliCheckoutPath,
        strict: true,
      });

      // expectStderr.lineContainsString({match: `Missing required flag workspacePath`, occurrences: 1})
      // expectStdout.lineContainsString({match: `Missing required flag workspacePath`, occurrences: 0})

      // console.log(`res :>> `, res)
      // console.log(`expectFs :>> `, expectFs)

      await expectConfig.isValid();
      expectConfig.expectText.equals(xfs.readFileSync(skeletonConfigPath.address, 'utf8'))

      res.res.expectUtil
        .createText(expectFs.readText("./.npmrc"))
        .lineContainsString({ match: `@business-as-code:`, occurrences: 1 }); // local npm registry set up
      res.res.expectUtil
        .createText(expectFs.readText("./BOLLOCKS.md"))
        .lineContainsString({ match: `PANTS`, occurrences: 1 }); // coming from second schematic synchronise-workspace
      res.res.expectUtil
        .createText(expectFs.readText("./package.json"))
        .lineContainsString({
          match: `"name": "my-new-workspace"`,
          occurrences: 1,
        })
        .lineContainsString({ match: `"private": true`, occurrences: 1 });
    });
  });
  it("creates a skeleton workspace with absolute configPath", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      // testContext.mockStdStart()
      // const exitCode = await testContext.command(['workspace', 'init', testContext.envVars.workspacePath.original])

      // const configPath = addr.pathUtils.join(
      //   addr.parsePath(__dirname),
      //   addr.parsePath(
      //     "mocks/config-single-static-project-source-javascript.js"
      //   )
      // ) as AddressPathAbsolute;

      const cliCheckoutPath = addr.packageUtils.resolve({
        address: addr.parsePackage(`@business-as-code/cli`),
        projectCwd: testContext.testEnvVars.checkoutPath,
        strict: true,
      });

      const configPath = addr.packageUtils.resolve({
        address: addr.parsePackage(
          `@business-as-code/core/src/etc/config/skeleton.js`
        ),
        projectCwd: cliCheckoutPath,
        strict: true,
      });

      // console.log(`configPath :>> `, configPath)

      const res = await testContext.command(
        [
          "initialise",
          "workspace",
          "--name",
          "my-new-workspace",
          "--workspacePath",
          testContext.testEnvVars.workspacePath.original,
          "--configPath",
          configPath.original,
          "--cliRegistry",
          "http://localhost:4873",
        ],
        { logLevel: "debug" }
      );

      // if (assertIsOk(res)) {
      //   const success = res.success
      // }
      // assertIsOk()

      // console.log(`res :>> `, res)

      expectIsOk(res);

      // console.log(`res.res.tree. :>> `, res.res.tree.getDir("."));
      // console.log(
      //   `res.res.tree.read('./BOLLOCKS.md') :>> `,
      //   res.res.tree.readText("./BOLLOCKS.md")
      // );

      // const expectStdout = res.res.expectUtil.createStdout()
      // const expectStderr = res.res.expectUtil.createStderr()
      const expectFs = res.res.expectUtil.createFs();
      const expectConfig = res.res.expectUtil.createConfig();
      // expectStderr.lineContainsString({match: `Missing required flag workspacePath`, occurrences: 1})
      // expectStdout.lineContainsString({match: `Missing required flag workspacePath`, occurrences: 0})

      // console.log(`res :>> `, res)
      // console.log(`expectFs :>> `, expectFs)

      expectConfig.isValid();

      res.res.expectUtil
        .createText(expectFs.readText("./.npmrc"))
        .lineContainsString({ match: `@business-as-code:`, occurrences: 1 }); // local npm registry set up
      res.res.expectUtil
        .createText(expectFs.readText("./BOLLOCKS.md"))
        .lineContainsString({ match: `PANTS`, occurrences: 1 }); // coming from second schematic synchronise-workspace
      // expect(expectFs.existsSync('./bac-tester.txt')).toBeTruthy() // unique file; sourced from bac-tester GH repo
      // res.res.expectUtil.createText(expectFs.readText("./README.md")).lineContainsString({match: `this is a tester repository for bac yo`, occurrences: 1}) // pulled down from GH repo and overwrites previous README.md

      // {
      //   "name": "my-new-workspace",
      //   "version": "0.0.0",
      //   "description": "A schematics",
      //   "scripts": {
      //     "build": "tsc -p tsconfig.json",
      //     "test": "npm run build && jasmine src/**/*_spec.js"
      //   },
      //   "keywords": [
      //     "schematics"
      //   ],
      //   "license": "MIT",
      //   "schematics": "./src/collection.json",
      //   "dependencies": {
      //     "@moonrepo/cli": "*"
      //   },
      //   "devDependencies": {
      //     "@types/node": "^14.15.0"
      //   }
      // }
      res.res.expectUtil
        .createText(expectFs.readText("./package.json"))
        .lineContainsString({
          match: `"name": "my-new-workspace"`,
          occurrences: 1,
        })
        .lineContainsString({ match: `"private": true`, occurrences: 1 });

      // expect(expectFs.readText("./README.md")).toEqual("PANTS");

      // console.log(`testContext.testEnvVars.workspacePath.original :>> `, testContext.testEnvVars.workspacePath.original)

      // expect(exitCode).toEqual(0)

      // console.log(`exitCode :>> `, exitCode)
    });
  });
  describe("errors", () => {
    it("nonexistent command is handled and added to stderr", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});

      await persistentTestEnv.test({}, async (testContext) => {
        // testContext.mockStdStart();
        const res = await testContext.command(["does-not-exist"], {
          logLevel: "debug",
        });

        expectIsFail(res);

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

        // expect(res.res.outputs.stderr).toMatch(`command does-not-exist not found`);
      });
    });
    it("incorrect command flags", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "workspace",
            "init",
            "--blah",
            "noThere",
            "--workspacePath",
            testContext.testEnvVars.workspacePath.original,
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
          occurrences: 1,
        }); // oclif diverts to stdout?
      });

      // const persistentTestEnv = await createPersistentTestEnv({});
      // await persistentTestEnv.test({}, async (testContext) => {
      //   // testContext.mockStdStart();
      //   const res = await testContext.command(["does-not-exist"], {
      //     logLevel: "debug",
      //   });

      //   expectIsFail(res);

      //   const expectStdout = res.res.expectUtil.createStdout()
      //   const expectStderr = res.res.expectUtil.createStderr()
      //   expectStderr.lineContainsString({match: 'Error: Nonexistent flag: --blah', occurrences: 1})
      //   expectStdout.lineContainsString({match: 'Error: Nonexistent flag: --blah', occurrences: 0})
      // });
    });
    it("incorrect command args", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "workspace",
            "init",
            "nonExistentArg",
            "--workspacePath",
            testContext.testEnvVars.workspacePath.original,
          ],
          { logLevel: "debug" }
        );

        expectIsFail(res);
        const expectStdout = res.res.expectUtil.createStdout();
        const expectStderr = res.res.expectUtil.createStderr();
        expectStderr.lineContainsString({
          match: `Error: command workspace:init:nonExistentArg not found`,
          occurrences: 1,
        });
        expectStdout.lineContainsString({
          match: `Error: command workspace:init:nonExistentArg not found`,
          occurrences: 0,
        });
      });
    });
    it("--workspacePath is required", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          ["workspace", "init", "--name", "something"],
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
          occurrences: 1,
        }); // oclif diverts to stdout
      });
    });
  });
});
