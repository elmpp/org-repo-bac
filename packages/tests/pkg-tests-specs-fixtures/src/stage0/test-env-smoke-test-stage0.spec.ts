import { expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";

/** simply ensures the testEnv core util is operating properly */
describe("test-env-smoke-test-stage0", () => {
  jest.setTimeout(30000);

  it("creates a skeleton workspace using local published cli. Default configPath", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      // testContext.mockStdStart()
      // const exitCode = await testContext.command(['workspace', 'init', testContext.envVars.workspacePath.original])

      // const configPath = addr.pathUtils.join(
      //   testContext.testEnvVars.fixturesPath,
      //   addr.parsePath("mocks/input1.json")
      // );

// console.log(`configPath :>> `, configPath)

      const res = await testContext.command(
        [
          "initialise",
          "workspace",
          "--name",
          "my-new-workspace",
          "--workspacePath",
          testContext.testEnvVars.workspacePath.original,
          // "--configPath",
          // configPath.original,
          "--cliVersion",
          'bollards', // the localcli dist tag
          "--cliRegistry",
          'http://localhost:4873',
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

      const expectStdout = res.res.expectUtil.createStdout()
      // const expectStderr = res.res.expectUtil.createStderr()
      const expectFs = res.res.expectUtil.createFs()
      // expectStderr.lineContainsString({match: `Missing required flag workspacePath`, occurrences: 1})

      const expectConfig = res.res.expectUtil.createConfig();

      expectStdout.lineContainsString({match: new RegExp(`@business-as-code/cli/.*-bollards-.*`), occurrences: 1}) // local snapshot used

      // console.log(`res :>> `, res)
      // console.log(`expectFs :>> `, expectFs)

      // console.log(`expectFs. :>> `, expectFs.debug())

      // const res = await testContext.runServiceCb(
      //   [
      //     "initialise",
      //     "workspace",
      //     "--name",
      //     "my-new-workspace",
      //     "--workspacePath",
      //     testContext.testEnvVars.workspacePath.original,
      //     "--configPath",
      //     configPath.original,
      //     "--cliVersion",
      //     'bollards', // the localcli dist tag
      //     "--registry",
      //     'http://localhost:4873',
      //   ],
      //   { logLevel: "debug" }
      // );

      // expectFs.exists('.npmrc')
      // res.res.expectUtil.createText(expectFs.readText(".npmrc")).lineContainsString({match: `@business-as-code:`, occurrences: 1}) // local npm registry set up
      // res.res.expectUtil.createText(expectFs.readText("BOLLOCKS.md")).lineContainsString({match: `PANTS`, occurrences: 1}) // coming from second schematic synchronise-workspace
      // expect(expectFs.readJson("package.json")).toHaveProperty('dependencies.@business-as-code/cli', 'bollards') // coming from second schematic synchronise-workspace
      // // expect(expectFs.existsSync('./bac-tester.txt')).toBeTruthy() // unique file; sourced from bac-tester GH repo
      // res.res.expectUtil.createText(expectFs.readText("./README.md")).lineContainsString({match: `this is a tester repository for bac yo`, occurrences: 1}) // pulled down from GH repo and overwrites previous README.md

      expectConfig.isValid();

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
      res.res.expectUtil.createText(expectFs.readText("./package.json"))
        .lineContainsString({match: `"name": "my-new-workspace"`, occurrences: 1})
        .lineContainsString({match: `"private": true`, occurrences: 1})

      // expect(expectFs.readText("./README.md")).toEqual("PANTS");


      // console.log(`testContext.testEnvVars.workspacePath.original :>> `, testContext.testEnvVars.workspacePath.original)

      // expect(exitCode).toEqual(0)

      // console.log(`exitCode :>> `, exitCode)
    });
  });
});
