import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { expectIsOk } from "@business-as-code/tests-core/src/test-utils";

describe("repositories-create", () => {
  jest.setTimeout(25000);

  it("create normal", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const res = await testContext.runSchematic({
        parseOutput: {
          flags: {
            workspacePath: testContext.envVars.workspacePath.original,
            // destinationPath: testContext.envVars.workspacePath.original,
            schematicsAddress:
              "@business-as-code/plugin-core-tests#namespace=repositories-create",
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

      expectIsOk(res);

      await testContext.runSchematicServiceCb({
        serviceName: "git",
        tree: res.res.tree,
        cb: async ({ service }) => {
          const repo = service.getRepository();

          expect(
            await repo.checkIsRepo(service.CheckRepoActions.IS_REPO_ROOT)
          ).toBeTruthy();

          // try {
          //   // const logs = await repo.log();
          //   // console.log(`logs :>> `, logs);
          // }
          // catch (logErr) {
          //   console.log(`logErr :>> `, logErr)
          //   throw logErr
          // }
        },
        initialisationOptions: {},
        // originPath: testContext.envVars.workspacePath,
      });

      expect((res.res.tree.readJson("./package.json") as any)?.name).toEqual(
        "root-package"
      );
      expect(
        (res.res.tree.readJson("./packages/my-package-1/package.json") as any)
          ?.name
      ).toEqual("my-package-1");

      // expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);
    });
  });
});
