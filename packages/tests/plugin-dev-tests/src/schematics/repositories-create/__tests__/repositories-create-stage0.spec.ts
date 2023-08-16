import { expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import assert from "assert";

describe("repositories-create", () => {
  jest.setTimeout(25000);

  it("create normal", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      const res = await testContext.runSchematic({
        parseOutput: {
          flags: {
            workspacePath: testContext.testEnvVars.workspacePath.original,
            schematicsAddress:
              "@business-as-code/plugin-dev-tests#namespace=repositories-create",
            payload: {},
            ["logLevel"]: "info",
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
        const expectFs = res.res.expectUtil.createFs()

        await testContext.runServiceCb({
          serviceOptions: {
            serviceName: "git",
            cb: async ({ service: gitService }) => {
              const repo = gitService.getRepository(false);

              expect(gitService.getWorkingDestinationPath().original).toMatch(
                new RegExp(`/${workingPath}$`)
              );
              assert(
                repo,
                `Initialised repo not found at '${
                  gitService.getWorkingDestinationPath().original
                }'`
              );

              expect(
                await repo.checkIsRepo(gitService.CheckRepoActions.IS_REPO_ROOT)
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
          tree: expectFs,
        });

        expect(expectFs.exists(`./${workingPath}/package.json`)).toBeFalsy() // bare repo

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
      await assertForWorkingPath("repo2.git");
      await assertForWorkingPath("repo3.git");



      const expectFs = res.res.expectUtil.createFs()
      const dirEntries = expectFs.getDir('.')

      expect(dirEntries.subdirs).toHaveLength(3) // cleared up
    });
  });
});
