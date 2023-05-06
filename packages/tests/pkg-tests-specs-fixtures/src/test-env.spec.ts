import { createPersistentTestEnv } from '@business-as-code/tests-core'

/** simply ensures the testEnv core util is operating properly */
describe('test-env', () => {
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
  it('picks up paths from moon', async () => {

    const persistentTestEnv = await createPersistentTestEnv({})
    await persistentTestEnv.test({},
    async (testContext) => {

      const {testEnvVars} = testContext

      expect(testEnvVars.checkoutPath.original).toEqual('/Users/matt/dev/org-repo-moonrepo')
      expect(testEnvVars.basePath.original).toEqual('/Users/matt/dev/org-repo-moonrepo/etc/var')
      expect(testEnvVars.workspacePath.original).toMatch('/Users/matt/dev/org-repo-moonrepo/etc/var/tests')

      // console.log(`envVars :>> `, envVars)

      // const {} = testContext

      // let outputs: Outputs = {
      //   stdout: '',
      //   stderr: '',
      // }

      // testContext.mockStdStart()
      // const exitCode = await testContext.command(['help'])
      // await testContext.command(['something', 'else'])
      // const outputs = testContext.mockStdEnd()

      // expect(outputs).not.toMatch('')

      // console.log(`outputs :>> `, outputs)

      // return {
      //   outputs,
      // }
    })
  })
})
