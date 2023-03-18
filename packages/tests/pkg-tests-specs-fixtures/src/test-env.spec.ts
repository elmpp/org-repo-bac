import {createPersistentTestEnv, PersistentTestEnv} from '@business-as-code/tests-core'
import {Outputs} from '@business-as-code/core'
import {addr} from '@business-as-code/address'

/** simply ensures the testEnv core util is operating properly */
describe('testEnv', () => {
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
      console.log(`testContext :>> `, testContext);





      // const {} = testContext

      // let outputs: Outputs = {
      //   stdout: '',
      //   stderr: '',
      // }

      testContext.mockStdStart()
      await testContext.command(['help'])
      // await testContext.command(['something', 'else'])
      const outputs = testContext.mockStdEnd()

      console.log(`outputs :>> `, outputs)

      // return {
      //   outputs,
      // }
    })
  })
})
