import {createPersistentTestEnv, PersistentTestEnv} from '@business-as-code/tests-core'
import {Outputs} from '@business-as-code/core'
import {addr} from '@business-as-code/address'

describe('init workspace', () => {
  // it ('blah', async () => {
  //   expect(true).toBeTruthy()

  let persistentTestEnv: PersistentTestEnv

  beforeAll(async () => {
    persistentTestEnv = await createPersistentTestEnv({
      // needs to be inside configured Moon directory
      basePath: () => addr.pathUtils.resolve(addr.parsePath('..')),
      // basePath: () => addr.parseAsType('../', 'portablePathPosixAbsolute'),
    })
  })

  // })
  it('completes', async () => {

    await persistentTestEnv.test({
      destinationPath: (...args: any[]) => {
        console.log(`args :>> `, args)
        return ''
      }
    },
    async (testContext) => {
      // const {} = testContext

      let outputs: Outputs = {
        stdout: '',
        stderr: '',
      }

      testContext.mockStdStart()
      await testContext.command(['help'])
      // await testContext.command(['something', 'else'])
      outputs = testContext.mockStdEnd()

      console.log(`outputs :>> `, outputs)

      return {
        outputs,
      }
    })

    // test.command
    // .stdout()
    // .command(['init', 'workspace'])
    // // .command(['init', 'workspace', '--from=oclif'])
    // .it('runs hello cmd', ctx => {
    //   // test.command.expect(ctx.stdout).to.contain('hello friend from oclif!')
    //   // expect(ctx.stdout).toContain('hello friend from oclif!')
    //     expect(true).toBeTruthy()
    //   })
  })
})
