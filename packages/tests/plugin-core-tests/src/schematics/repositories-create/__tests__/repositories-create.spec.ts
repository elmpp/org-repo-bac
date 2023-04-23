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

      console.log(`res :>> `, res)
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

              const logs = await repo.log();

              expect(logs.all).toHaveLength(2)
              expect(logs.all[0]).toHaveProperty('message', 'second commit')
              expect(logs.latest).toHaveProperty('message', 'second commit')
            },
            initialiseOptions: {
              workingPath,
            },
          },
          tree: res.res.tree,
        });

        expect(res.res.tree.exists(`./${workingPath}/package.json`)).toBeFalsy() // bare repo

        // expect(
        //   (res.res.tree.readJson(`./${workingPath}/package.json`) as any)?.name
        // ).not.toEqual("root-package"); // bare repo
        // expect(
        //   (
        //     res.res.tree.readJson(
        //       `./${workingPath}/packages/my-package-1/package.json`
        //     ) as any
        //   )?.name
        // ).toEqual("my-package-1");
      };

      await assertForWorkingPath("repo1.git");
      // await assertForWorkingPath("repo2.git");
      // await assertForWorkingPath("repo3.git");

      const dirEntries = res.res.tree.getDir('.')

      expect(dirEntries.subdirs).toHaveLength(1) // cleared up
      // expect(dirEntries.subdirs).toHaveLength(3) // cleared up
      console.log(`dirEntries.subdirs :>> `, dirEntries.subdirs)
    });
  });
});
