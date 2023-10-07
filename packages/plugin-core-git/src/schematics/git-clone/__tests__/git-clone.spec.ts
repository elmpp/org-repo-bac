import { expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { describe, it, jest, expect } from "bun:test";
import {describe, test} from 'bun:test'

describe("git-clone", () => {
  // jest.setTimeout(25000);

  /** @online-only */
  describe('remote cloning', () => {
    it("clone normal", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.runSchematic({
          parseOutput: {
            flags: {
              workspacePath: testContext.testEnvVars.workspacePath.original,
              // destinationPath: testContext.testEnvVars.workspacePath.original,
              schematicsAddress:
                "@business-as-code/plugin-core-git#namespace=git-clone",
              json: false,
              payload: {},
              logLevel: 'info',
            },
            args: {},
            argv: [],
            metadata: {} as any,
            raw: {} as any,
            nonExistentFlags: {} as any,
          },
        });

        expectIsOk(res);

        const expectFs = await res.res.expectUtil.createFs();
        // expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);
        expect(
          res.res.expectUtil
            .createText(expectFs.readText("./README.md"))
            .lineContainsString({ match: `# bac-tester`, occurrences: 1 })
        );
      });
    });
    // it("clone bare", async () => {
    //   const persistentTestEnv = await createPersistentTestEnv({});
    //   await persistentTestEnv.test({}, async (testContext) => {
    //     const res = await testContext.runSchematicServiceCb({
    //       serviceName: "git",
    //       cb: async ({ service }) => {
    //           await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
    //       },
    //       // originPath: testContext.envVars.workspacePath,
    //     });

    //     expectIsOk(res);

    //     expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);
    //   });
    // });
    // it.only("clone bare", async () => {
    //   const persistentTestEnv = await createPersistentTestEnv({});
    //   await persistentTestEnv.test({}, async (testContext) => {
    //     const res = await testContext.runSchematicServiceCb({
    //       serviceName: "git",
    //       cb: async ({ service }) => {
    //           await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
    //       },
    //       // originPath: testContext.envVars.workspacePath,
    //     });

    //     expectIsOk(res);

    //     expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);
    //   });
    // });
  })
});
