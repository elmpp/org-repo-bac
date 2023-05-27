import { expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";

/** simply ensures the testEnv core util is operating properly */
describe("changesets-snapshot", () => {
  jest.setTimeout(15000);

  it.only("pushes a unique tagged artifact for all applicable projects", async () => {
    const persistentTestEnv = await createPersistentTestEnv({
      // basePath(basePathChoices) {
      //   return basePathChoices.stage1
      // },
    });
    await persistentTestEnv.test({
      workspacePath: ({checkoutPath}) => checkoutPath, // this is required when pointing a command at a different location like below. It creates the tree etc
    }, async (testContext) => {

      const res = await testContext.command(
        [
          "changesets",
          "snapshot",
          "--registry",
          "http://localhost:4873",
          "--workspacePath",
          // testContext.testEnvVars.workspacePath.original,
          testContext.testEnvVars.checkoutPath.original,
        ],
        { logLevel: "debug" }
      );

      expectIsOk(res);

      // const expectStdout = res.res.expectUtil.createStdout();
      const expectFs = res.res.expectUtil.createFs();
// console.log(`expectFs :>> `, expectFs.options.tree)

      // const changesetFiles = res.res.expectUtil.options.tree
      // console.log(`res.res.expectUtil.options.tree.exists('.changeset') :>> `, res.res.expectUtil.options.tree.exists('.changeset'))
      const changesetFolderFiles = res.res.expectUtil.options.tree.getDir('.changeset').subfiles
      // const changesetFolderFiles = schematicTestUtils.getFiles(res.res.expectUtil.options.tree)
      // console.log(`changesetFolderFiles :>> `, changesetFolderFiles)
      const changesetFiles = changesetFolderFiles.filter(f => f.startsWith('changeset-'))

      expect(changesetFiles).toHaveLength(1)
      const changesetFilename = changesetFiles[0]

      res.res.expectUtil.createText(expectFs.readText(changesetFilename))
        .lineContainsString({match: `"name": "my-new-workspace"`, occurrences: 1})
        .lineContainsString({match: `"private": true`, occurrences: 1})

      // expectStdout.lineContainsString({match: `Publishing`, occurrences: 1})


      // expectStderr.lineContainsString({match: `Missing required flag workspacePath`, occurrences: 1})
      // expectStdout.lineContainsString({match: `Missing required flag workspacePath`, occurrences: 0})

      // console.log(`res :>> `, res)
      // console.log(`expectFs :>> `, expectFs)

      // res.res.expectUtil
      //   .createText(expectFs.readText("./.npmrc"))
      //   .lineContainsString({ match: `@business-as-code:`, occurrences: 1 }); // local npm registry set up
      // res.res.expectUtil
      //   .createText(expectFs.readText("./BOLLOCKS.md"))
      //   .lineContainsString({ match: `PANTS`, occurrences: 1 }); // coming from second schematic synchronise-workspace
      // expect(expectFs.existsSync("./bac-tester.txt")).toBeTruthy(); // unique file; sourced from bac-tester GH repo
      // res.res.expectUtil
      //   .createText(expectFs.readText("./README.md"))
      //   .lineContainsString({
      //     match: `this is a tester repository for bac yo`,
      //     occurrences: 1,
      //   }); // pulled down from GH repo and overwrites previous README.md

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
      // res.res.expectUtil
      //   .createText(expectFs.readText("./package.json"))
      //   .lineContainsString({
      //     match: `"name": "my-new-workspace"`,
      //     occurrences: 1,
      //   })
      //   .lineContainsString({ match: `"private": true`, occurrences: 1 });

      // expect(expectFs.readText("./README.md")).toEqual("PANTS");

      // console.log(`testContext.testEnvVars.workspacePath.original :>> `, testContext.testEnvVars.workspacePath.original)

      // expect(exitCode).toEqual(0)

      // console.log(`exitCode :>> `, exitCode)
    });
  });
});
