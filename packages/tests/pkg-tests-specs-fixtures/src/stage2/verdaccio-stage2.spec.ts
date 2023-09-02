import { AddressPathAbsolute, addr } from "@business-as-code/address";
import { constants } from "@business-as-code/core";
import {
  createExpectUtil,
  createPersistentTestEnv,
} from "@business-as-code/tests-core";

describe("verdaccio", () => {
  it("caches uplinked packages", async () => {
    const persistentTestEnv = await createPersistentTestEnv({
      defaultLogLevel: "debug",
    });
    await persistentTestEnv.test({}, async (testContext) => {
      if (testContext.testEnvVars.cliSourceActive !== "cliRegistry") {
        return;
      }

      // because stage2, we can assume verdaccio has been hit

      const verdaccioStoragePath = addr.parsePath(
        constants.VERDACCIO_STORAGE_PATH
      ) as AddressPathAbsolute;

      const expectUtil = createExpectUtil({
        workspacePath: verdaccioStoragePath,
        testEnvVars: testContext.testEnvVars,
      });
      const expectFs = expectUtil.createFs();

      // console.log(`verdaccioStoragePath :>> `, verdaccioStoragePath);
      // console.log(`expectFs.di :>> `, expectFs.getDir(".").subdirs);

      expect(expectFs.getDir(".").subdirs).toEqual(
        expect.arrayContaining([
          "@business-as-code", // is created when we publish snapshots anyway
          "@moonrepo", // verdaccio caching of uplink packages - https://tinyurl.com/29f7dvfw. Perhaps you need to do a `pnpm install --force` to flush through verdaccio
        ])
      );
    });
  });
});
