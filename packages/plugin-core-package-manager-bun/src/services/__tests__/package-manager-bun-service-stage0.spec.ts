import {
  assertIsOk,
  expectIsOk
} from "@business-as-code/core";
import {
  createPersistentTestEnv
} from "@business-as-code/tests-core";
import { describe, it, expect } from "bun:test";

describe("package-manager-bun-service", () => {
  describe('info', () => {
    it("retrieves info - not supported atm", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: "package-manager-bun-service:info",
      });
      await persistentTestEnv.test({}, async (testContext) => {

        const packageManagerService = await testContext.context.serviceFactory('packageManager', {
          context: testContext.context,
          workingPath: '.',
          packageManager: 'packageManagerBun',
        })

        expect(() => packageManagerService.info({ pkg: `@business-as-code/cli`, options: { registry: 'http://localhost:4873' } })).toThrow()
      })
    });
    it("throws with registry parameter - also not supported atm", async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: "package-manager-bun-service:info",
      });
      await persistentTestEnv.test({}, async (testContext) => {

        const packageManagerService = await testContext.context.serviceFactory('packageManager', {
          context: testContext.context,
          workingPath: '.',
          packageManager: 'packageManagerBun',
        })

        expect(() => packageManagerService.info({ pkg: `@business-as-code/cli`, options: { registry: 'http://localhost:4873' } })).toThrow()
      })
    });
  })
});
