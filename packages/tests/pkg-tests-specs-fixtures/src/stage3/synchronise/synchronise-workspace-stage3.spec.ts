import { addr } from '@business-as-code/address'
import { constants, expectIsOk, fsUtils } from '@business-as-code/core'
import { Filename, xfs } from '@business-as-code/fslib'
import {
  TestContext,
  createPersistentTestEnv
} from '@business-as-code/tests-core'
import { describe, it } from 'bun:test'

describe('synchronise workspace', () => {
  // jest.setTimeout(25000);

  async function setup(testContext: TestContext, configFilename: Filename) {
    const resCopy = await testContext.copy(
      'initialise:workspace default skeleton config bun',
      testContext.testEnvVars.workspacePath
    )

    let expectConfig = await resCopy.res.expectUtil.createConfig()

    await (async function updateConfig() {
      // const rootPath = addr.packageUtils.resolveRoot({
      //   address: addr.parsePackage("root"),
      //   strict: true,
      //   projectCwd: addr.parsePath(__dirname) as AddressPathAbsolute,
      // });
      const configPath = fsUtils.resolveCoreConfig(configFilename)
      // const gitHttpRepoUrl = addr.pathUtils.join(fsUtils.tmpResolvableFolder, addr.parsePath(`config/${configFilename}`))
      // console.log(
      //   `gitHttpRepoUrl.address, addr.parsePath(expectConfig.dest inationPath).address :>> `,
      //   configPath.address,
      //   expectConfig._tmpResolvablePath.address
      // );
      await xfs.copyFilePromise(
        configPath.address,
        addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath(constants.RC_FILENAME)
        ).address
      )

      expectConfig = await resCopy.res.expectUtil.createConfig()

      expectConfig.expectText.equals(
        xfs.readFileSync(configPath.address, 'utf8')
      ) // it's updated
    })()
  }

  it('updating the config will trigger the configure lifecycle and update projects', async () => {
    const persistentTestEnv = await createPersistentTestEnv({
      testName: `synchronise workspace: updating the config will trigger the configure lifecycle and update projects`
    })
    await persistentTestEnv.test({}, async (testContext) => {
      testContext.setActiveWorkspacePaths({
        workspace: testContext.testEnvVars.workspacePath
      })

      await setup(testContext, 'git-minimal-http.js' as Filename)

      const res = await testContext.command(
        [
          'synchronise',
          'workspace',
          '--workspacePath',
          `${testContext.testEnvVars.workspacePath.original}`
        ],
        { logLevel: 'debug' }
      )

      // console.log(`res :>> `, res)

      expectIsOk(res)
    })
  })
})
