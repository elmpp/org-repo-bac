import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { expectIsOk } from "@business-as-code/tests-core/src/test-utils";
import assert from "assert";

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

      const assertForWorkingPath = async (workingPath: string) => {
        await testContext.runSchematicServiceCb({
          serviceOptions: {
            serviceName: "git",
            cb: async ({ service }) => {
              const repo = service.getRepository(false);

              expect(service.getWorkingDestinationPath().original).toMatch(
                new RegExp(`/${workingPath}$`)
              );
              assert(
                repo,
                `Initialised repo not found at '${
                  service.getWorkingDestinationPath().original
                }'`
              );

              expect(
                await repo.checkIsRepo(service.CheckRepoActions.IS_REPO_ROOT)
              ).toBeTruthy();
            },
            initialiseOptions: {
              workingPath,
            },
          },
          tree: res.res.tree,
        });

        expect(
          (res.res.tree.readJson(`./${workingPath}/package.json`) as any)?.name
        ).toEqual("root-package");
        expect(
          (
            res.res.tree.readJson(
              `./${workingPath}/packages/my-package-1/package.json`
            ) as any
          )?.name
        ).toEqual("my-package-1");
      };

      await assertForWorkingPath("repo1");
      await assertForWorkingPath("repo2");
      await assertForWorkingPath("repo3");
    });
  });
});
