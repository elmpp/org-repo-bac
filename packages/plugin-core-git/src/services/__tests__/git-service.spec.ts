import { createPersistentTestEnv } from "@business-as-code/tests-core";
import { expectIsOk } from "@business-as-code/tests-core/src/test-utils";
import { CheckRepoActions } from "simple-git";

describe("git-service", () => {
  jest.setTimeout(25000);

  /** @online-only */
  describe('cloning', () => {
    it("clone standard", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.runSchematicServiceCb({
          serviceName: "git",
          cb: async ({ service }) => {
              await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
          },
          initialiseOptions: {},
          // originPath: testContext.envVars.workspacePath,
        });

        expectIsOk(res);

        expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);

        await testContext.runSchematicServiceCb({
          serviceName: "git",
          tree: res.res.tree,
          cb: async ({ service }) => {
              const repo = service.getRepository()
              expect(repo.checkIsRepo(CheckRepoActions.IS_REPO_ROOT)).toBeTruthy()
              // const currentDir = (await service.getRepository()).cwd()/
              // console.log(`currentDir :>> `, currentDir)
              console.log(`service.getWorkingDestinationPath :>> `, service.getWorkingDestinationPath())
              const logs = await repo.log()
              console.log(`logs :>> `, logs)
              // expect((await service.getRepository()).log()).toBeTruthy()
              // expect((await service.getRepository()).commit(CheckRepoActions.BARE)).toBeTruthy()
              // await service.clone(`https://github.com/elmpp/bac-tester.git`, {bare: null});
          },
          initialiseOptions: {},
          // originPath: testContext.envVars.workspacePath,
        })
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
  })
  describe('initialising repo', () => {
    it("initialise standard", async () => {
      const persistentTestEnv = await createPersistentTestEnv({});
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.runSchematicServiceCb({
          serviceName: "git",
          cb: async ({ service }) => {
              await service.init();
          },
          initialiseOptions: {},
          // originPath: testContext.envVars.workspacePath,
        });

        expectIsOk(res);

        // expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);

        await testContext.runSchematicServiceCb({
          serviceName: "git",
          tree: res.res.tree,
          cb: async ({ service }) => {
              const repo = service.getRepository()
              expect(repo.checkIsRepo(service.CheckRepoActions.IS_REPO_ROOT)).toBeTruthy()
          },
          initialiseOptions: {},
          // originPath: testContext.envVars.workspacePath,
        })
      });
    });
  })
});
