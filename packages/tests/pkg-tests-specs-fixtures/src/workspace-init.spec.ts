import { createPersistentTestEnv } from '@business-as-code/tests-core'

/** simply ensures the testEnv core util is operating properly */
describe('workspace init', () => {
  // it ('blah', async () => {
  //   expect(true).toBeTruthy()

  // let persistentTestEnv: PersistentTestEnv

  // beforeAll(async () => {
  //   persistentTestEnv = await createPersistentTestEnv({
  //     // needs to be inside configured Moon directory
  //     // basePath: () => addr.pathUtils.resolve(addr.parsePath('..')),
  //     // basePath: () => addr.parseAsType('../', 'portablePathPosixAbsolute'),
  //   })
  // })

  // })
  it.only('creates a skeleton workspace without config', async () => {

    const persistentTestEnv = await createPersistentTestEnv({})
    await persistentTestEnv.test({},
    async (testContext) => {

      // const {envVars} = testContext

      // console.log(`envVars :>> `, envVars)

      // expect(envVars.checkoutPath.original).toEqual('/Users/matt/dev/org-repo-moonrepo')
      // expect(envVars.basePath.original).toEqual('/Users/matt/dev/org-repo-moonrepo/etc/var')
      // expect(envVars.destinationPath.original).toMatch('/Users/matt/dev/org-repo-moonrepo/etc/var/tests')

      // console.log(`envVars :>> `, envVars)

      // const {} = testContext

      // let outputs: Outputs = {
      //   stdout: '',
      //   stderr: '',
      // }

      // testContext.mockStdStart()
      const exitCode = await testContext.command(['workspace', 'init', testContext.envVars.destinationPath.original])
      expect(exitCode).toEqual(0)
      console.log(`exitCode :>> `, exitCode)
      // await testContext.command(['something', 'else'])
      // const outputs = testContext.mockStdEnd()

      // expect(outputs).not.toMatch('')

      // console.log(`outputs :>> `, outputs)

      // return {
      //   outputs,
      // }
    })
  })
  describe('errors', () => {
    it('nonexistent command', async () => {

      const persistentTestEnv = await createPersistentTestEnv({})
      await persistentTestEnv.test({},
      async (testContext) => {
        const exitCode = await testContext.command(['does-not-exist', testContext.envVars.destinationPath.original])
        expect(exitCode).toBeGreaterThan(0)
      })
    })
    it('incorrect command options', async () => {

      const persistentTestEnv = await createPersistentTestEnv({})
      await persistentTestEnv.test({},
      async (testContext) => {
        const exitCode = await testContext.command(['workspace', 'init', '--blah=noThere', testContext.envVars.destinationPath.original])
        expect(exitCode).toBeGreaterThan(0)
      })
    })
    it('incorrect command arg', async () => {

      const persistentTestEnv = await createPersistentTestEnv({})
      await persistentTestEnv.test({},
      async (testContext) => {
        const exitCode = await testContext.command(['workspace', 'init', 'nonExistentArg', testContext.envVars.destinationPath.original])
        expect(exitCode).toBeGreaterThan(0)
      })
    })
  })
})
