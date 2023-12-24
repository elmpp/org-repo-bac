import {
  AddressDescriptor,
  AddressDescriptorUnion,
  AddressPathAbsolute,
  AddressUrl,
  addr
} from '@business-as-code/address'
import {
  FetchOptions,
  LifecycleReturnByMethodArray,
  Result,
  constants,
  expectIsOk
} from '@business-as-code/core'
import { BacError, MessageName } from '@business-as-code/error'
import {
  TestContext,
  createPersistentTestEnv
} from '@business-as-code/tests-core'
import { describe, expect, it } from 'bun:test'

/**
 ensure the test harness around publishing to local verdaccio is working ok
 */
describe('test-cli-registry', () => {
  it('build, cleans and publishes a snapshot', async () => {
    const persistentTestEnv = await createPersistentTestEnv({
      testName: 'fetch-content:git:fetches and caches new content'
    })
    await persistentTestEnv.test({}, async (testContext) => {
      // expectIsOk(fetchLifecycleCachedRes);
      // const fetchResCachedFirstProvider = fetchLifecycleCachedRes.res[0];
      // expect(fetchResCachedFirstProvider).toHaveProperty("provider", "git");
      // expect(fetchResCachedFirstProvider).toHaveProperty("options");
      // expect(fetchResCachedFirstProvider.options.contentPath.original).toMatch(
      //   `/${constants.RC_CONTENT_FOLDER}/gitSshRepoUrl/`
      // );
      // expect(fetchResCachedFirstProvider.options.checksum).toEqual({
      //   globalVersion: 1,
      //   key: "b88173a5be2c98375765b949fdb2d235a8d55e12",
      // });
    })
  })
})
