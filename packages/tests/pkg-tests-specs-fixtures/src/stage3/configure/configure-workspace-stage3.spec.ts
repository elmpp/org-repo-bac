import { expectIsOk } from '@business-as-code/core'
import { createPersistentTestEnv } from '@business-as-code/tests-core'
import { describe, it } from 'bun:test'

describe('configure workspace', () => {
  // jest.setTimeout(25000);

  it('skeleton workspace produces empty rc', async () => {
    const persistentTestEnv = await createPersistentTestEnv({
      testName: `configure workspace: skeleton workspace produces empty rc`
    })

    await persistentTestEnv.test({}, async (testContext) => {
      testContext.setActiveWorkspacePaths({
        workspace: testContext.testEnvVars.workspacePath
      })

      const resCopy = await testContext.copy(
        'initialise:workspace default skeleton config bun',
        testContext.testEnvVars.workspacePath
      )

      // @ts-ignore
      let expectConfig = await resCopy.res.expectUtil.createConfig()

      const res = await testContext.command(
        [
          'configure',
          'workspace',
          '--workspacePath',
          `${testContext.testEnvVars.workspacePath.original}`,
          '--force'
        ]
        // { logLevel: "debug" }
      )

      expectIsOk(res)
    })
  })
})
