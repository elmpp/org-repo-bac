import { addr } from '@business-as-code/address'
import {
  Result,
  ServiceMap,
  UnwrapPromise,
  constants,
  expectIsOk
} from '@business-as-code/core'
import { Filename, xfs } from '@business-as-code/fslib'
import {
  TestContext,
  createPersistentTestEnv
} from '@business-as-code/tests-core'
import { describe, it, jest, expect } from 'bun:test'
import { CheckRepoActions } from 'simple-git'

describe('git-service', () => {
  // jest.setTimeout(25000);

  async function assertCommon({
    testContext,
    res,
    service
  }: {
    testContext: TestContext
    service: ServiceMap['SubrepoService'][0]
    res: Result<unknown, { error: Error }>
  }) {
    expectIsOk(res)

    const expectUtil = await testContext.createExpectUtil({
      workspacePath: testContext.testEnvVars.workspacePath
    })
    const expectFs = await expectUtil.createFs()

    expect(
      (
        await expectUtil.createText(expectFs.readText('./package.json'))
      ).asJson()
    ).toHaveProperty('name', 'root-package')
    expect(
      (
        await expectUtil.createText(
          expectFs.readText('./packages/my-package-1/package.json')
        )
      ).asJson()
    ).toHaveProperty('name', 'my-package-1')

    const repo = service.getRepository()
    expect(repo.checkIsRepo(CheckRepoActions.IS_REPO_ROOT)).toBeTruthy()
  }

  /** @online-only */
  describe('cloning', () => {
    it('clone http', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: 'git-service cloning clone http'
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const service = await testContext.context.serviceFactory(
          'SubrepoService',
          {
            context: testContext.context,
            workingPath: '.'
          }
        )
        const res = await service.clone(
          // `https://github.com/elmpp/bac-tester.git`,
          `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/repo1.git`,
          {}
        )

        await assertCommon({ testContext, res, service })
      })
    })
    it('clone ssh anonymous', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: 'git-service cloning clone ssh'
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const service = await testContext.context.serviceFactory(
          'SubrepoService',
          {
            context: testContext.context,
            workingPath: '.'
          }
        )
        const res = await service.clone(
          `ssh://localhost:${constants.GIT_SSH_ANONYMOUS_MOCK_SERVER_PORT}/repo1.git`,
          { sshStrictHostCheckingDisable: true }
        )
        await assertCommon({ testContext, res, service })
      })
    })
    it('clone ssh pubkey', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: 'git-service cloning clone pubkey'
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const service = await testContext.context.serviceFactory(
          'SubrepoService',
          {
            context: testContext.context,
            workingPath: '.'
          }
        )
        const res = await service.clone(
          `ssh://localhost:${constants.GIT_SSH_PUBKEY_MOCK_SERVER_PORT}/repo1.git`,
          {
            sshStrictHostCheckingDisable: false,
            sshPrivateKeyPath:
              testContext.testEnvVars.sshPrivateKeyPath.original
          }
        )
        await assertCommon({ testContext, res, service })
      })
    })
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
  describe('ls-remote', () => {
    it('remote list', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: 'git-service remote list'
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const service = await testContext.context.serviceFactory(
          'SubrepoService',
          {
            context: testContext.context,
            workingPath: '.'
          }
        )

        const res = await service.remoteList(
          `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/repo1.git`,
          {}
        )

        expectIsOk(res)

        const expectUtil = await testContext.createExpectUtil({
          workspacePath: testContext.testEnvVars.workspacePath,
          outputs: {
            stdout: res.res,
            stderr: ''
          }
        })

        const expectOut = await expectUtil.createStdout()
        expectOut.lineContainsString({
          match: '\trefs/heads/main',
          occurrences: 1
        })
        expectOut.lineContainsString({ match: '\tHEAD', occurrences: 1 })
      })
    })
  })
  describe('initialising repo', () => {
    it('initialise standard', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: 'git-service initialising repo initialise standard'
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const service = await testContext.context.serviceFactory(
          'SubrepoService',
          {
            context: testContext.context,
            workingPath: '.'
          }
        )
        const res = await service.init()
        expectIsOk(res)

        const repo = service.getRepository()
        expect(
          repo.checkIsRepo(service.CheckRepoActions.IS_REPO_ROOT)
        ).toBeTruthy()

        // const res = await testContext.runServiceCb({
        //   serviceOptions: {
        //     serviceName: "git",
        //     cb: async ({ service }) => {
        //       await service.init();
        //     },
        //     initialiseOptions: {
        //       workingPath: ".",
        //     },
        //   },
        //   // originPath: testContext.envVars.workspacePath,
        // });

        // expectIsOk(res);

        // expect(res.res.tree.readText("./README.md")).toMatch(`# bac-tester`);

        // await testContext.runServiceCb({
        //   serviceOptions: {
        //     serviceName: "git",
        //     cb: async ({ service }) => {
        //       const repo = service.getRepository();
        //       expect(
        //         repo.checkIsRepo(service.CheckRepoActions.IS_REPO_ROOT)
        //       ).toBeTruthy();
        //     },
        //     initialiseOptions: {
        //       workingPath: ".",
        //     },
        //   },
        //   tree: res.res.expectUtil.options.tree,
        //   // originPath: testContext.envVars.workspacePath,
        // });
      })
    })
  })
})
