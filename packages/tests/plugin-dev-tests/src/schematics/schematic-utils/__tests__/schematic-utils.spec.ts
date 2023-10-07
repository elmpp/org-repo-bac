/** ensure our schematic amendments are ok, such as the 'external' semantics */
import {
  expectIsOk,
  Interfaces as _Interfaces,
} from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { describe, it, jest, expect } from "bun:test";

describe("schematic-utils", () => {
  describe("external", () => {
    it("allows deletion after an external wrap", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.runSchematic({
          parseOutput: {
            flags: {
              workspacePath: testContext.testEnvVars.workspacePath.original,
              schematicsAddress:
                "@business-as-code/plugin-dev-tests#namespace=schematic-utils",
              ["logLevel"]: "info",
              payload: {},
              json: false,
            },
            args: {},
            argv: [],
            metadata: {} as any,
            raw: {} as any,
            nonExistentFlags: {} as any,
          },
        });

        expectIsOk(res);

        const expectStdout = await res.res.expectUtil.createStdout();
        expectStdout.lineContainsString({ match: /FLUSH$/, occurrences: 2 });
        // expectStdout.lineContainsString({match: /DELETE package.json$/, occurrences: 1})
        // expectStdout.lineContainsString({match: /DELETE packages\/.gitkeep$/, occurrences: 1})
        // expectStdout.lineContainsString({match: /DELETE packages\/another-file.txt$/, occurrences: 1})
        expectStdout.lineContainsString({
          match: /DELETE DIR packages$/,
          occurrences: 1,
        }); // includes directories, boom!
        // expectStdout.lineContainsString({match: /DELETE packages\/nested-folder\/.gitkeep$/, occurrences: 1})
        // expectStdout.lineContainsString({match: /DELETE packages\/nested-folder\/another-file.txt$/, occurrences: 1})
        // expectStdout.lineContainsString({match: /DELETE packages\/nested-folder$/, occurrences: 0}) // although nested directories are deleted, they're not reported

        const expectFs = await res.res.expectUtil.createFs();
        expect(expectFs.existsSync("./package.json")).toBeFalsy();
        expect(expectFs.existsSync("./packages/.gitkeep")).toBeFalsy();
        expect(expectFs.existsSync("./packages")).toBeFalsy();
        expect(expectFs.existsSync("./packages/nested-folder")).toBeFalsy();
      });
    });
  });
});
