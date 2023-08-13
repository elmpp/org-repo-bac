import { addr } from "@business-as-code/address";
import { expectIsOk, UnwrapPromise } from "@business-as-code/core";
import { xfs } from "@business-as-code/fslib";
import {
  createPersistentTestEnv,
  TestContext,
} from "@business-as-code/tests-core";


declare global {
  interface Stage0Content {
    'initialise:workspace default skeleton config': true,
    'initialise:workspace git-minimal relative config': true,
  }
}

/**
 * Stage0 tests are the only ones that may be copied by successive stage tests. Therefore, it is important
 * to keep them to a minimum as they'll always be ran before
 * Note also that the content produced will include both cliRegistry+cliLinked variants, to support other
 * tests being E2E or dev
 */
describe("initialise workspace", () => {
  jest.setTimeout(40000);

  async function assertCommon(
    testContext: TestContext,
    res: UnwrapPromise<ReturnType<TestContext["command"]>>,
    configFilename: string
  ) {
    expectIsOk(res);

    const expectFs = res.res.expectUtil.createFs();
    const expectConfig = res.res.expectUtil.createConfig();

    const cliCheckoutPath = addr.packageUtils.resolve({
      address: addr.parsePackage(`@business-as-code/cli`),
      projectCwd: testContext.testEnvVars.checkoutPath,
      strict: true,
    });

    const skeletonConfigPath = addr.packageUtils.resolve({
      address: addr.parsePackage(
        `@business-as-code/core/src/etc/config/${configFilename}`
      ),
      projectCwd: cliCheckoutPath,
      strict: true,
    });

    await expectConfig.isValid();
    expectConfig.expectText.equals(
      xfs.readFileSync(skeletonConfigPath.address, "utf8")
    );

    res.res.expectUtil
      .createText(expectFs.readText("./BOLLOCKS.md"))
      .lineContainsString({ match: `PANTS`, occurrences: 1 }); // coming from second schematic synchronise-workspace
    res.res.expectUtil
      .createText(expectFs.readText("./package.json"))
      .lineContainsString({
        match: `"name": "my-new-workspace"`,
        occurrences: 1,
      })
      .lineContainsString({ match: `"private": true`, occurrences: 1 });
  }

  describe("initialise:workspace default skeleton config", () => {
    it('cliRegistry', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        cliSource: "cliRegistry",
        cacheNamespaceFolder: 'initialise:workspace default skeleton config',
      });
      await persistentTestEnv.test({}, async (testContext) => {
        // testContext.setActiveWorkspaceCliPath(testContext.testEnvVars.checkoutPath)
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "--name",
            "my-new-workspace",
            "--workspacePath",
            // `invalid:path`,
            `${testContext.testEnvVars.workspacePath.original}`,
            "--cliRegistry",
            "http://localhost:4873",
          ],
          { logLevel: "debug" }
        );

        await assertCommon(testContext, res, 'skeleton.js');

        const expectFs = res.res.expectUtil.createFs();
        res.res.expectUtil
          .createText(expectFs.readText("./.npmrc"))
          .lineContainsString({ match: `@business-as-code:registry=http://localhost:4873`, occurrences: 1 }); // local npm registry set up
      });
    })
    it('cliLinked', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        cliSource: "cliLinked",
        cacheNamespaceFolder: 'initialise:workspace default skeleton config',
      });
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "--name",
            "my-new-workspace",
            "--workspacePath",
            `${testContext.testEnvVars.workspacePath.original}`,
            "--cliPath",
            testContext.testEnvVars.checkoutCliPath.original,
          ],
          { logLevel: "debug" }
        );

        await assertCommon(testContext, res, 'skeleton.js');

        const expectFs = res.res.expectUtil.createFs();
        res.res.expectUtil
          .createText(expectFs.readText("./.npmrc"))
          .lineContainsString({ match: `@business-as-code:registry=https://registry.npmjs.org`, occurrences: 1 });
      });
    })
  })

  describe.only("initialise:workspace git-minimal relative config", () => {
    it('cliRegistry', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        cliSource: "cliRegistry",
        cacheNamespaceFolder: 'initialise:workspace git-minimal relative config',
      });
      await persistentTestEnv.test({}, async (testContext) => {
        // testContext.setActiveWorkspaceCliPath(testContext.testEnvVars.checkoutPath)
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "--name",
            "my-new-workspace",
            "--workspacePath",
            `${testContext.testEnvVars.workspacePath.original}`,
            "--configPath",
            "packages/pkg-core/src/etc/config/git-minimal.js",
            "--cliRegistry",
            "http://localhost:4873",
          ],
          { logLevel: "debug" }
        );

        await assertCommon(testContext, res, 'git-minimal.js');

        const expectFs = res.res.expectUtil.createFs();
        res.res.expectUtil
          .createText(expectFs.readText("./.npmrc"))
          .lineContainsString({ match: `@business-as-code:registry=http://localhost:4873`, occurrences: 1 }); // local npm registry set up
      });
    })
    it('cliLinked', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        cliSource: "cliLinked",
        cacheNamespaceFolder: 'initialise:workspace git-minimal relative config',
      });
      await persistentTestEnv.test({}, async (testContext) => {
        const res = await testContext.command(
          [
            "initialise",
            "workspace",
            "--name",
            "my-new-workspace",
            "--workspacePath",
            `${testContext.testEnvVars.workspacePath.original}`,
            "--configPath",
            "packages/pkg-core/src/etc/config/git-minimal.js",
            "--cliPath",
            testContext.testEnvVars.checkoutCliPath.original,
          ],
          { logLevel: "debug" }
        );

        await assertCommon(testContext, res, 'git-minimal.js');

        const expectFs = res.res.expectUtil.createFs();
        res.res.expectUtil
          .createText(expectFs.readText("./.npmrc"))
          .lineContainsString({ match: `@business-as-code:registry=https://registry.npmjs.org`, occurrences: 1 });
      });
    })
  })
});
