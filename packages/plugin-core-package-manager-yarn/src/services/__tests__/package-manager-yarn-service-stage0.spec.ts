import {
  assertIsOk,
  expectIsOk
} from "@business-as-code/core";
import {
  createPersistentTestEnv
} from "@business-as-code/tests-core";
import { describe, expect, it } from "bun:test";

describe("package-manager-yarn-service", () => {
  describe('info', () => {
    it("retrieves info", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: "package-manager-yarn-service:info",
      });
      await persistentTestEnv.test({}, async (testContext) => {

        const packageManagerService = await testContext.context.serviceFactory('packageManager', {
          context: testContext.context,
          workingPath: '.',
          packageManager: 'packageManagerYarn',
        })

        const infoRes = await packageManagerService.info({ pkg: `left-pad` })

        expectIsOk(infoRes)
        assertIsOk(infoRes)

        // console.log(`infoRes :>> `, infoRes.res.outputs.stdout)
      })
    });
    it("throws with registry parameter", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: "package-manager-yarn-service:info",
      });
      await persistentTestEnv.test({}, async (testContext) => {

        const packageManagerService = await testContext.context.serviceFactory('packageManager', {
          context: testContext.context,
          workingPath: '.',
          packageManager: 'packageManagerYarn',
        })

        const configRes = await packageManagerService.configList({})
        expectIsOk(configRes)

        expect(() => packageManagerService.info({ pkg: `@business-as-code/cli`, options: { registry: 'http://localhost:4873' } })).toThrow()
      })
    });
  })
});
