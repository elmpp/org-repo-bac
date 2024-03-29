import { constants, expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { CheckRepoActions } from "simple-git";

describe("git-service", () => {
  jest.setTimeout(25000);

  /** @online-only */
  describe("cloning", () => {
    it.only("clone standard", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.runServiceCb({
          serviceOptions: {
            serviceName: "git",
            cb: async ({ service }) => {
              const res = await service.clone(
                // `https://github.com/elmpp/bac-tester.git`,
                `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/repo1.git`,
                {}
              );
              expectIsOk(res)
            },
            initialiseOptions: {
              workingPath: ".",
            },
          },
          // originPath: testContext.envVars.workspacePath,
        });

        expectIsOk(res);

        const expectFs = res.res.expectUtil.createFs();
        // expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);
        // expect(
        //   res.res.expectUtil
        //     .createText(expectFs.readText("./package.json"))
        //     .lineContainsString({ match: `# bac-tester`, occurrences: 1 })
        // );
        expect(
          res.res.expectUtil
            .createText(expectFs.readText("./package.json")).asJson()
        ).toHaveProperty('name', 'root-package');
        expect(
          res.res.expectUtil
            .createText(expectFs.readText("./packages/my-package-1/package.json")).asJson()
        ).toHaveProperty('name', 'my-package-1');

        await testContext.runServiceCb({
          serviceOptions: {
            serviceName: "git",
            cb: async ({ service }) => {
              const repo = service.getRepository();
              expect(
                repo.checkIsRepo(CheckRepoActions.IS_REPO_ROOT)
              ).toBeTruthy();
              // const currentDir = (await service.getRepository()).cwd()/
              // console.log(`currentDir :>> `, currentDir)
              // console.log(
              //   `service.getWorkingDestinationPath :>> `,
              //   service.getWorkingDestinationPath()
              // );
              // const logs = await repo.log();
              // console.log(`logs :>> `, logs);
              // expect((await service.getRepository()).log()).toBeTruthy()
              // expect((await service.getRepository()).commit(CheckRepoActions.BARE)).toBeTruthy()
              // await service.clone(`https://github.com/elmpp/bac-tester.git`, {bare: null});
            },
            initialiseOptions: {
              workingPath: ".",
            },
          },
          tree: res.res.expectUtil.options.tree,
          // originPath: testContext.envVars.workspacePath,
        });
      });
    });
    // it.only("clone bare", async () => {
    //   const persistentTestEnv = await createPersistentTestEnv({});
    //   await persistentTestEnv.test({}, async (testContext) => {
    //     const res = await testContext.runSchematicServiceCb({
    //       serviceName: "git",
    //       cb: async ({ service }) => {
    //           await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
    //       },
    //       initialiseOptions: {},
    //       // originPath: testContext.envVars.workspacePath,
    //     });

    //     expectIsOk(res);

    //     await testContext.runSchematicServiceCb({
    //       serviceName: "git",
    //       tree: res.res.tree,
    //       cb: async ({ service }) => {
    //           expect((await service.getRepository()).checkIsRepo(CheckRepoActions.BARE)).toBeTruthy()
    //           // const currentDir = (await service.getRepository()).cwd()/
    //           // console.log(`currentDir :>> `, currentDir)
    //           const repo = await service.getRepository()
    //           console.log(`service.getWorkingDestinationPath :>> `, service.getWorkingDestinationPath())
    //           // const logs = await repo.log()
    //           // console.log(`logs :>> `, logs)
    //           // expect((await service.getRepository()).log()).toBeTruthy()
    //           // expect((await service.getRepository()).commit(CheckRepoActions.BARE)).toBeTruthy()
    //           // await service.clone(`https://github.com/elmpp/bac-tester.git`, {bare: null});
    //       },
    //       initialiseOptions: {workingPath: '.git'},
    //       // originPath: testContext.envVars.workspacePath,
    //     })

    //     expect(() => res.res.tree.readText("./README.md")).toThrow() // bare repo
    //     // expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);
    //   });
    // });
  });
  describe("initialising repo", () => {
    it("initialise standard", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.runServiceCb({
          serviceOptions: {
            serviceName: "git",
            cb: async ({ service }) => {
              await service.init();
            },
            initialiseOptions: {
              workingPath: ".",
            },
          },
          // originPath: testContext.envVars.workspacePath,
        });

        expectIsOk(res);

        // expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);

        await testContext.runServiceCb({
          serviceOptions: {
            serviceName: "git",
            cb: async ({ service }) => {
              const repo = service.getRepository();
              expect(
                repo.checkIsRepo(service.CheckRepoActions.IS_REPO_ROOT)
              ).toBeTruthy();
            },
            initialiseOptions: {
              workingPath: ".",
            },
          },
          tree: res.res.expectUtil.options.tree,
          // originPath: testContext.envVars.workspacePath,
        });
      });
    });
  });
});
