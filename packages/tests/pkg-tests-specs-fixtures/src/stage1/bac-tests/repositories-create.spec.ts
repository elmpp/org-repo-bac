import { createPersistentTestEnv } from "@business-as-code/tests-core";
import {
  expectIsFail,
  expectIsOk,
} from "@business-as-code/tests-core/src/test-utils";

/** check the repositories are accessible via the daemon. See repositories-create-stage0.spec for content tests */
describe("repositories-create", () => {
  jest.setTimeout(25000);

  it.only("repositories available via git-ssh", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {


      const assertForRepo = async (repo: string) => {
        // const expectFs = res.res.expectUtil.createFs()

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


      // testContext.mockStdStart()
      // const exitCode = await testContext.command(['workspace', 'init', testContext.envVars.workspacePath.original])

      // const configPath = addr.pathUtils.join(
      //   testContext.envVars.fixturesPath,
      //   addr.parsePath("mocks/input1.json")
      // );

      // const res = await testContext.command(
      //   [
      //     "bac-tests",
      //     "repositories-create",
      //     // "--name",
      //     // "my-new-repository",
      //     "--workspacePath",
      //     testContext.testEnvVars.workspacePath.original,
      //     "--repositoriesPath",
      //     testContext.testEnvVars.workspacePath.original,
      //   ],
      //   { logLevel: "debug" }
      // );

      // if (assertIsOk(res)) {
      //   const success = res.success
      // }
      // assertIsOk()

      // expectIsOk(res);

      // console.log(`res.res.tree. :>> `, res.res.tree.getDir("."));
      // console.log(
      //   `res.res.tree.read('./BOLLOCKS.md') :>> `,
      //   res.res.tree.readText("./BOLLOCKS.md")
      // );
      expect((res.res.tree.readJson("./package.json") as any)?.name).toEqual("root-package");
      expect(
        (res.res.tree.readJson("./packages/my-package-1/package.json") as any)?.name
      ).toEqual("my-package-1");

      // expect(exitCode).toEqual(0)

      // console.log(`exitCode :>> `, exitCode)
    });
  });
  describe("errors", () => {
    it("incorrect command args", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        testContext.mockStdStart();
        const res = await testContext.command(
          [
            "bac-tests",
            "repositories-create",
            "invalidArgs",
            // testContext.envVars.workspacePath.original,
          ],
          { logLevel: "debug" }
        );
        const outputs = testContext.mockStdEnd();

        expectIsFail(res);
        expect(outputs.stderr).toMatch(
          `Error: command bac-tests:repositories-create:invalidArgs not found`
        );
      });
    });
    it("--workspacePath is required", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        testContext.mockStdStart();
        const res = await testContext.command(
          [
            "bac-tests",
            "repositories-create",
            // testContext.envVars.workspacePath.original,
          ],
          { logLevel: "debug" }
        );
        const outputs = testContext.mockStdEnd();

        expectIsFail(res);
        expect(outputs.stderr).toMatch(`Missing required flag name`);
      });
    });
  });
});
