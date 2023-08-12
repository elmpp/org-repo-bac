import { addr } from "@business-as-code/address";
import { constants, expectIsOk } from "@business-as-code/core";
import { Filename, xfs } from "@business-as-code/fslib";
import {
  createPersistentTestEnv,
  TestContext,
} from "@business-as-code/tests-core";

/** simply ensures the testEnv core util is operating properly */
describe("configure workspace", () => {
  jest.setTimeout(25000);

  async function setup(testContext: TestContext, configFilename: Filename) {
    const resCopy = await testContext.copy(
      'creates a skeleton workspace without configPath using skeleton config',
      testContext.testEnvVars.workspacePath
    );

    let expectConfig = resCopy.res.expectUtil.createConfig();

    await (async function updateConfig() {
      const gitHttpRepoUrl = addr.pathUtils.resolve(
        addr.parsePath(__dirname),
        addr.parsePath(`../../etc/config/${configFilename}`)
      );
      console.log(
        `gitHttpRepoUrl.address, addr.parsePath(expectConfig.destinationPath).address :>> `,
        gitHttpRepoUrl.address,
        expectConfig._tmpResolvablePath.address
      );
      await xfs.copyFilePromise(
        gitHttpRepoUrl.address,
        addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath(constants.RC_FILENAME)
        ).address
      );

      expectConfig = resCopy.res.expectUtil.createConfig();

      expectConfig.expectText.equals(
        xfs.readFileSync(gitHttpRepoUrl.address, "utf8")
      ); // it's updated
    })();
  }

  it.only("updating the config will trigger the configure lifecycle and update projects", async () => {
    const persistentTestEnv = await createPersistentTestEnv({});
    await persistentTestEnv.test({}, async (testContext) => {
      testContext.setActiveWorkspaceCliPath(testContext.testEnvVars.workspacePath)

      await setup(testContext, "git-http-default-master.js" as Filename);

      const res = await testContext.command(
        [
          "synchronise",
          "workspace",
          "--workspacePath",
          `${testContext.testEnvVars.workspacePath.original}`,
        ],
        { logLevel: "debug" }
      );

      expectIsOk(res);
    });
  });
});
