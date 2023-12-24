import { assertIsOk, expectIsOk } from '@business-as-code/core'
import { createPersistentTestEnv } from '@business-as-code/tests-core'
import { describe, it } from 'bun:test'

describe('package-manager-npm-service', () => {
  describe('info', () => {
    it('retrieves info', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: 'package-manager-npm-service:info'
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const packageManagerService = await testContext.context.serviceFactory(
          'packageManager',
          {
            context: testContext.context,
            workingPath: '.',
            packageManager: 'packageManagerNpm'
          }
        )

        const infoRes = await packageManagerService.info({ pkg: `left-pad` })

        expectIsOk(infoRes)
        assertIsOk(infoRes)

        // console.log(`infoRes :>> `, infoRes.res.outputs.stdout)
      })
    })
    it('throws with registry parameter', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: 'package-manager-npm-service:info'
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const packageManagerService = await testContext.context.serviceFactory(
          'packageManager',
          {
            context: testContext.context,
            workingPath: '.',
            packageManager: 'packageManagerNpm'
          }
        )

        const configRes = await packageManagerService.configList({})
        expectIsOk(configRes)

        const infoRes = await packageManagerService.info({
          pkg: `@business-as-code/cli`,
          options: { registry: 'http://localhost:4873' }
        })

        expectIsOk(infoRes)
        assertIsOk(infoRes)
      })
    })
  })
})
