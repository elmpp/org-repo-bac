/** ensure our schematic amendments are ok, such as the 'external' semantics */
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { expectIsOk } from "@business-as-code/tests-core/src/test-utils";

describe("schematic-utils", () => {
  describe("external", () => {
    it("allows deletion after an external wrap", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        testContext.mockStdStart();
        const res = await testContext.runSchematic({
          parseOutput: {
            flags: {
              workspacePath: testContext.envVars.workspacePath.original,
              schematicsAddress:
                "@business-as-code/plugin-core-tests#namespace=schematic-utils",
              ["log-level"]: "info",
              json: false,
            },
            args: {},
            argv: [],
            metadata: {} as any,
            raw: {} as any,
            nonExistentFlags: {} as any,
          },
        });
        const outputs = testContext.mockStdEnd();

        expectIsOk(res);

        expect(outputs.stdout).toMatch("DELETE package.json");
        expect(outputs.stdout).toMatch("DELETE packages/.gitkeep");
        expect(outputs.stdout).toMatch("DELETE packages");

        expect(res.res.tree.getDir("./.git")).toBeTruthy(); // tree.getDir() is crap and always returns

        // deletion helper is able to effect changes to FS files even after a wrapExternal block...
        expect(res.res.tree.exists("./package.json")).toBeFalsy();
        expect(res.res.tree.exists("./packages/.gitkeep")).toBeFalsy();
        expect(res.res.tree.exists("./packages")).toBeFalsy();
      });
    });
  });
});
