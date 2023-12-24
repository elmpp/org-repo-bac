import { AddressPathAbsolute, addr } from '@business-as-code/address'
import { constants, expectIsOk, fsUtils } from '@business-as-code/core'
import { AddressAbsoluteCacheManager } from '@business-as-code/core/src/cache/address-absolute-cache-manager'
import { createPersistentTestEnv } from '@business-as-code/tests-core'
import { describe, it, jest, expect } from 'bun:test'
// import { expect } from "@jest/globals";

describe('address-cache-manager', () => {
  /** i.e. RC files throughout a project, offering meta features only */
  describe('unmanaged content', () => {
    it('saves to meta, first time', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: `address-cache-manager : unmanaged content : saves to meta, first time`
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const sourceAddress = fsUtils.resolveCoreConfig('skeleton.js')
        const key = 'skeleton-js'

        // const namespace = sourceAddress.type;

        const cacheManager = await AddressAbsoluteCacheManager.initialise({
          metaBaseAddress: addr.pathUtils.join(
            testContext.testEnvVars.workspacePath,
            addr.parsePath(constants.RC_META_FOLDER)
          ) as AddressPathAbsolute,
          createAttributes(address) {
            return {
              key: fsUtils.sanitise(address.addressNormalized),
              namespace: fsUtils.sanitise(address.type)
            }
          },
          context: testContext.context,
          workspacePath: testContext.context.workspacePath,
          workingPath: '.'
        })

        const onHit = jest.fn()
        const onStale = jest.fn()
        const onMiss = jest.fn()

        const getRes = await cacheManager.get({
          address: sourceAddress,
          // namespace,
          cacheOptions: {},
          // expectedChecksum: "",
          createChecksum: async ({ existentChecksum, contentPath }) => {
            return {
              globalVersion: 1,
              key
            }
          },
          onHit,
          onStale,
          // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          onMiss
          // onHit: () => {},
          // onStale: async ({ contentPath, existentChecksum }) => {
          //   return await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
          // // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          // onMiss: async ({ contentPath }) => {
          //   throw new Error(`onStale should be called when meta not present but content exists`)
          //   // console.log(`contentPath :>> `, contentPath)
          //   // await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
        })

        // console.log(`fetchRes :>> `, getRes)

        expectIsOk(getRes)
        const entry = getRes.res

        expect(onStale).toHaveBeenCalledTimes(1) // onStale should be called when meta not present but content exists
        expect(onMiss).toHaveBeenCalledTimes(0) // onMiss only called when content does not exist
        expect(onHit).toHaveBeenCalledTimes(0) // onHit only called when content exists and checksum passes

        expect(entry.contentPath).toEqual(sourceAddress)
        expect(entry.metaPath.original).toMatch(/.json$/)
        expect(entry.metaPathRelative.original).toMatch(/.json$/)
        expect(entry.checksum).toEqual({
          globalVersion: 1,
          key
        })
        expect(entry.existentChecksum).toBeUndefined()
        expect(entry.checksumValid).toBeTrue()

        // expect(entry).toEqual(
        //   expect.objectContaining({
        //     // sourceAddress,
        //     contentPath: sourceAddress,
        //     // contentPath: expect.objectContaining({
        //     //   original: expect.stringMatching(
        //     //     `${testContext.testEnvVars.workspacePath.original}/content`
        //     //   ),
        //     // }),
        //     metaPath: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     metaPathRelative: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     checksum: {
        //       globalVersion: 1,
        //       key,
        //     },
        //     existentChecksum: undefined,
        //     checksumValid: true,
        //   })
        // );

        const expectUtil = await testContext.createExpectUtil({
          workspacePath: testContext.testEnvVars.workspacePath
        })
        const expectFs = await expectUtil.createFs()
        expect(expectFs.existsSync(`${constants.RC_META_FOLDER}`)).toBeTruthy()

        expect(
          expectFs.existsSync(`meta/${entry.metaPathRelative.original}`)
        ).toBeTruthy()
        expect(
          expectFs.readJson(`meta/${entry.metaPathRelative.original}`)
        ).toEqual({
          contentChecksum: { globalVersion: 1, key }
        })
        expect(
          expectFs.existsSync(`${constants.RC_CONTENT_FOLDER}`)
        ).toBeFalsy()
        // expect(
        //   expectFs.existsSync(`${constants.RC_CONTENT_FOLDER}/${entry.contentPathRelative.original}`)
        // ).toBeTruthy();
      })
    })
    it('saves to meta, existing', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: `address-cache-manager : unmanaged content : saves to meta, existing`
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const sourceAddress = fsUtils.resolveCoreConfig('skeleton.js')
        const key = 'skeleton-js'

        // const namespace = sourceAddress.type;

        const cacheManager = await AddressAbsoluteCacheManager.initialise({
          metaBaseAddress: addr.pathUtils.join(
            testContext.testEnvVars.workspacePath,
            addr.parsePath(constants.RC_META_FOLDER)
          ) as AddressPathAbsolute,
          createAttributes(address) {
            return {
              key: fsUtils.sanitise(address.addressNormalized),
              namespace: fsUtils.sanitise(address.type)
            }
          },
          context: testContext.context,
          workspacePath: testContext.context.workspacePath,
          workingPath: '.'
        })

        const onHit = jest.fn()
        const onStale = jest.fn()
        const onMiss = jest.fn()

        const getRes1 = await cacheManager.get({
          address: sourceAddress,
          // namespace,
          cacheOptions: {},
          // expectedChecksum: "",
          createChecksum: async ({ existentChecksum, contentPath }) => {
            return {
              globalVersion: 1,
              key
            }
          },
          onHit,
          onStale,
          // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          onMiss
          // onHit: () => {},
          // onStale: async ({ contentPath, existentChecksum }) => {
          //   return await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
          // // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          // onMiss: async ({ contentPath }) => {
          //   throw new Error(`onStale should be called when meta not present but content exists`)
          //   // console.log(`contentPath :>> `, contentPath)
          //   // await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
        })

        // console.log(`fetchRes :>> `, getRes)

        expectIsOk(getRes1)
        expect(onStale).toHaveBeenCalledTimes(1) // onStale should be called when meta not present but content exists
        expect(onMiss).toHaveBeenCalledTimes(0) // onMiss only called when content does not exist
        expect(onHit).toHaveBeenCalledTimes(0) // onHit only called when content exists and checksum passes

        const getRes2 = await cacheManager.get({
          address: sourceAddress,
          // namespace,
          cacheOptions: {},
          // expectedChecksum: "",
          createChecksum: async ({ existentChecksum, contentPath }) => {
            return {
              globalVersion: 1,
              key
            }
          },
          onHit,
          onStale,
          // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          onMiss
          // onHit: () => {},
          // onStale: async ({ contentPath, existentChecksum }) => {
          //   return await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
          // // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          // onMiss: async ({ contentPath }) => {
          //   throw new Error(`onStale should be called when meta not present but content exists`)
          //   // console.log(`contentPath :>> `, contentPath)
          //   // await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
        })

        // console.log(`fetchRes :>> `, getRes)

        expectIsOk(getRes2)
        const entry = getRes2.res

        expect(onStale).toHaveBeenCalledTimes(1) // onStale should be called when meta not present but content exists
        expect(onMiss).toHaveBeenCalledTimes(0) // onMiss only called when content does not exist
        expect(onHit).toHaveBeenCalledTimes(1) // onHit only called when content exists and checksum passes

        expect(entry.contentPath).toEqual(sourceAddress)
        expect(entry.metaPath.original).toMatch(/.json$/)
        expect(entry.metaPathRelative.original).toMatch(/.json$/)
        expect(entry.existentChecksum).toEqual({
          globalVersion: 1,
          key
        })
        expect(entry.checksum).toEqual({
          globalVersion: 1,
          key
        })
        expect(entry.checksumValid).toBeTrue()

        // expect(entry).toEqual(
        //   expect.objectContaining({
        //     // sourceAddress,
        //     contentPath: sourceAddress,
        //     // contentPath: expect.objectContaining({
        //     //   original: expect.stringMatching(
        //     //     `${testContext.testEnvVars.workspacePath.original}/content`
        //     //   ),
        //     // }),
        //     metaPath: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     metaPathRelative: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     checksum: {
        //       globalVersion: 1,
        //       key,
        //     },
        //     existentChecksum: {
        //       globalVersion: 1,
        //       key,
        //     },
        //     checksumValid: true,
        //   })
        // );

        const expectUtil = await testContext.createExpectUtil({
          workspacePath: testContext.testEnvVars.workspacePath
        })
        const expectFs = await expectUtil.createFs()
        expect(expectFs.existsSync(`${constants.RC_META_FOLDER}`)).toBeTruthy()

        expect(
          expectFs.existsSync(`meta/${entry.metaPathRelative.original}`)
        ).toBeTruthy()
        expect(
          expectFs.readJson(`meta/${entry.metaPathRelative.original}`)
        ).toEqual({
          contentChecksum: { globalVersion: 1, key }
        })
        expect(
          expectFs.existsSync(`${constants.RC_CONTENT_FOLDER}`)
        ).toBeFalsy()
        // expect(
        //   expectFs.existsSync(`${constants.RC_CONTENT_FOLDER}/${entry.contentPathRelative.original}`)
        // ).toBeTruthy();
      })
    })
    it('saves to meta, invalid checksum', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: `address-cache-manager : unmanaged content : saves to meta, invalid checksum`
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const sourceAddress = fsUtils.resolveCoreConfig('skeleton.js')
        const key1 = 'skeleton-js-1'
        const key2 = 'skeleton-js-2'

        // const namespace = sourceAddress.type;

        const cacheManager = await AddressAbsoluteCacheManager.initialise({
          metaBaseAddress: addr.pathUtils.join(
            testContext.testEnvVars.workspacePath,
            addr.parsePath(constants.RC_META_FOLDER)
          ) as AddressPathAbsolute,
          createAttributes(address) {
            return {
              key: fsUtils.sanitise(address.addressNormalized),
              namespace: fsUtils.sanitise(address.type)
            }
          },
          context: testContext.context,
          workspacePath: testContext.context.workspacePath,
          workingPath: '.'
        })

        const onHit = jest.fn()
        const onStale = jest.fn()
        const onMiss = jest.fn()
        const createChecksum = jest
          .fn()
          .mockImplementationOnce(async () => {
            return {
              globalVersion: 1,
              key: key1
            }
          })
          .mockImplementationOnce(async () => {
            return {
              globalVersion: 1,
              key: key2
            }
          })

        const getRes1 = await cacheManager.get({
          address: sourceAddress,
          // namespace,
          cacheOptions: {},
          // expectedChecksum: "",
          createChecksum,
          onHit,
          onStale,
          // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          onMiss
          // onHit: () => {},
          // onStale: async ({ contentPath, existentChecksum }) => {
          //   return await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
          // // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          // onMiss: async ({ contentPath }) => {
          //   throw new Error(`onStale should be called when meta not present but content exists`)
          //   // console.log(`contentPath :>> `, contentPath)
          //   // await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
        })

        // console.log(`fetchRes :>> `, getRes)

        expectIsOk(getRes1)
        expect(onStale).toHaveBeenCalledTimes(1) // onStale should be called when meta not present but content exists
        expect(onStale.mock.lastCall[0]).toEqual({
          message: `Appears that this is the first time indexing existent content`,
          existentChecksum: undefined,
          contentPath: sourceAddress
        })
        // expect(onStale).toHaveBeenLastCalledWith({
        //   message: `Appears that this is the first time indexing existent content`,
        //   existentChecksum: undefined,
        //   contentPath: sourceAddress });
        expect(onMiss).toHaveBeenCalledTimes(0) // onMiss only called when content does not exist
        expect(onHit).toHaveBeenCalledTimes(0) // onHit only called when content exists and checksum passes
        expect(createChecksum).toHaveBeenCalledTimes(1)
        expect(createChecksum.mock.lastCall[0]).toEqual({
          existentChecksum: undefined,
          contentPath: sourceAddress
        })
        // expect(createChecksum).toHaveBeenLastCalledWith({ existentChecksum: undefined, contentPath: sourceAddress });

        const getRes2 = await cacheManager.get({
          address: sourceAddress,
          // namespace,
          cacheOptions: {},
          // expectedChecksum: "",
          createChecksum,
          onHit,
          onStale,
          // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          onMiss
          // onHit: () => {},
          // onStale: async ({ contentPath, existentChecksum }) => {
          //   return await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
          // // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          // onMiss: async ({ contentPath }) => {
          //   throw new Error(`onStale should be called when meta not present but content exists`)
          //   // console.log(`contentPath :>> `, contentPath)
          //   // await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
        })

        // console.log(`fetchRes :>> `, getRes)

        expectIsOk(getRes2)
        const entry = getRes2.res

        expect(onStale).toHaveBeenCalledTimes(2) // onStale should be called when meta not present but content exists
        expect(onStale.mock.lastCall[0]).toEqual({
          message: expect.stringContaining(
            `Checksum miss: checksum keys do not match. Existing: '1::skeleton-js-1', expected: '1::skeleton-js-2' when validating cache entry`
          ),
          existentChecksum: {
            globalVersion: 1,
            key: key1
          },
          contentPath: sourceAddress
        })
        // expect(onStale).toHaveBeenLastCalledWith({
        //   message: expect.stringContaining(`Checksum miss: checksum keys do not match. Existing: '1::skeleton-js-1', expected: '1::skeleton-js-2' when validating cache entry`),
        //   existentChecksum: {
        //     globalVersion: 1,
        //     key: key1,
        //   },
        //   contentPath: sourceAddress });
        expect(onMiss).toHaveBeenCalledTimes(0) // onMiss only called when content does not exist
        expect(onHit).toHaveBeenCalledTimes(0) // onHit only called when content exists and checksum passes
        expect(createChecksum).toHaveBeenCalledTimes(2)
        expect(createChecksum.mock.lastCall[0]).toEqual({
          existentChecksum: {
            globalVersion: 1,
            key: key1
          },
          contentPath: sourceAddress
        })
        // expect(createChecksum).toHaveBeenLastCalledWith({ existentChecksum: {
        //   globalVersion: 1,
        //   key: key1,
        // }, contentPath: sourceAddress });

        expect(entry.contentPath).toEqual(sourceAddress)
        expect(entry.metaPath.original).toMatch(/.json$/)
        expect(entry.metaPathRelative.original).toMatch(/.json$/)
        expect(entry.checksum).toEqual({
          globalVersion: 1,
          key: key2
        })
        expect(entry.existentChecksum).toEqual({
          globalVersion: 1,
          key: key1
        })
        expect(entry.checksumValid).toBeFalse()

        // expect(entry).toEqual(
        //   expect.objectContaining({
        //     // sourceAddress,
        //     contentPath: sourceAddress,
        //     // contentPath: expect.objectContaining({
        //     //   original: expect.stringMatching(
        //     //     `${testContext.testEnvVars.workspacePath.original}/content`
        //     //   ),
        //     // }),
        //     metaPath: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     metaPathRelative: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     checksum: {
        //       globalVersion: 1,
        //       key: key2,
        //     },
        //     existentChecksum: {
        //       globalVersion: 1,
        //       key: key1,
        //     },
        //     checksumValid: false,
        //   })
        // );

        const expectUtil = await testContext.createExpectUtil({
          workspacePath: testContext.testEnvVars.workspacePath
        })
        const expectFs = await expectUtil.createFs()
        expect(expectFs.existsSync(`${constants.RC_META_FOLDER}`)).toBeTruthy()

        expect(
          expectFs.existsSync(`meta/${entry.metaPathRelative.original}`)
        ).toBeTruthy()
        expect(
          expectFs.readJson(`meta/${entry.metaPathRelative.original}`)
        ).toEqual({
          contentChecksum: { globalVersion: 1, key: key2 }
        })
        expect(
          expectFs.existsSync(`${constants.RC_CONTENT_FOLDER}`)
        ).toBeFalsy()
        // expect(
        //   expectFs.existsSync(`${constants.RC_CONTENT_FOLDER}/${entry.contentPathRelative.original}`)
        // ).toBeTruthy();
      })
    })
  })
  /** i.e. copying into well known categorised folders with meta features */
  describe('managed content', () => {
    const doFetch = async ({
      cacheManager,
      sourcePath,
      destinationPath
    }: {
      cacheManager: AddressAbsoluteCacheManager
      sourcePath: AddressPathAbsolute
      destinationPath: AddressPathAbsolute
    }): Promise<void> => {
      return AddressAbsoluteCacheManager.copyContent({
        sourcePath,
        destinationPath
      })
    }

    it('saves to meta, first time', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: `address-cache-manager : managed content : saves to meta, first time`
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const sourceAddress = fsUtils.resolveCoreConfig('skeleton.js')
        const key = 'skeleton-js'
        // const namespace = sourceAddress.type;

        const cacheManager = await AddressAbsoluteCacheManager.initialise({
          metaBaseAddress: addr.pathUtils.join(
            testContext.testEnvVars.workspacePath,
            addr.parsePath(constants.RC_META_FOLDER)
          ) as AddressPathAbsolute,
          createAttributes(address) {
            return {
              key: fsUtils.sanitise(address.addressNormalized),
              namespace: fsUtils.sanitise(address.type)
            }
          },
          context: testContext.context,
          workspacePath: testContext.context.workspacePath,
          workingPath: '.'
        })

        const contentBasePath = addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath(constants.RC_CONTENT_FOLDER)
        ) as AddressPathAbsolute
        const {
          absolute: managedContentAddress,
          relative: managedContentAddressRelative
        } = await cacheManager.createContentPaths({
          rootPath: contentBasePath,
          address: sourceAddress
        })
        await cacheManager.primeContent({
          rootPath: contentBasePath,
          address: sourceAddress
        })

        const onHit = jest.fn()
        const onStale = jest.fn()
        const onMiss = jest
          .fn()
          .mockImplementationOnce(async (contentPath: AddressPathAbsolute) =>
            doFetch({
              cacheManager,
              sourcePath: sourceAddress,
              destinationPath: managedContentAddress
            })
          )

        const getRes = await cacheManager.get({
          address: managedContentAddress,
          // namespace,
          cacheOptions: {},
          // expectedChecksum: "",
          createChecksum: async ({ existentChecksum, contentPath }) => {
            return {
              globalVersion: 1,
              key
            }
          },
          onHit,
          onStale,
          // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          onMiss
          // onHit: () => {},
          // onStale: async ({ contentPath, existentChecksum }) => {
          //   return await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
          // // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          // onMiss: async ({ contentPath }) => {
          //   throw new Error(`onStale should be called when meta not present but content exists`)
          //   // console.log(`contentPath :>> `, contentPath)
          //   // await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
        })

        expectIsOk(getRes)
        const entry = getRes.res

        expect(onStale).toHaveBeenCalledTimes(0) // onStale should be called when meta not present but content exists
        expect(onMiss).toHaveBeenCalledTimes(1) // onMiss only called when content does not exist
        expect(onHit).toHaveBeenCalledTimes(0) // onHit only called when content exists and checksum passes

        expect(entry.contentPath).toEqual(managedContentAddress)
        expect(entry.metaPath.original).toMatch(/.json$/)
        expect(entry.metaPathRelative.original).toMatch(/.json$/)
        expect(entry.checksum).toEqual({
          globalVersion: 1,
          key
        })
        expect(entry.existentChecksum).toBeUndefined()
        expect(entry.checksumValid).toBeTrue()

        // expect(entry).toEqual(
        //   expect.objectContaining({
        //     // sourceAddress,
        //     contentPath: managedContentAddress,
        //     // contentPath: expect.objectContaining({
        //     //   original: expect.stringMatching(
        //     //     `${testContext.testEnvVars.workspacePath.original}/content`
        //     //   ),
        //     // }),
        //     metaPath: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     metaPathRelative: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     checksum: {
        //       globalVersion: 1,
        //       key,
        //     },
        //     existentChecksum: undefined,
        //     checksumValid: true,
        //   })
        // );

        const expectUtil = await testContext.createExpectUtil({
          workspacePath: testContext.testEnvVars.workspacePath
        })
        const expectFs = await expectUtil.createFs()
        expect(expectFs.existsSync(`${constants.RC_META_FOLDER}`)).toBeTruthy()

        expect(
          expectFs.existsSync(`meta/${entry.metaPathRelative.original}`)
        ).toBeTruthy()
        expect(
          expectFs.readJson(`meta/${entry.metaPathRelative.original}`)
        ).toEqual({
          contentChecksum: { globalVersion: 1, key }
        })
        expect(
          expectFs.existsSync(`${constants.RC_CONTENT_FOLDER}`)
        ).toBeTruthy()
        expect(
          expectFs.existsSync(
            `${constants.RC_CONTENT_FOLDER}/${managedContentAddressRelative.original}`
          )
        ).toBeTruthy()
      })
    })
    it('saves to meta, second time', async () => {
      const persistentTestEnv = await createPersistentTestEnv({
        testName: `address-cache-manager : managed content : saves to meta, second time`
      })
      await persistentTestEnv.test({}, async (testContext) => {
        const sourceAddress = fsUtils.resolveCoreConfig('skeleton.js')
        const key = 'skeleton-js'
        // const namespace = sourceAddress.type;

        const cacheManager = await AddressAbsoluteCacheManager.initialise({
          metaBaseAddress: addr.pathUtils.join(
            testContext.testEnvVars.workspacePath,
            addr.parsePath(constants.RC_META_FOLDER)
          ) as AddressPathAbsolute,
          createAttributes(address) {
            return {
              key: fsUtils.sanitise(address.addressNormalized),
              namespace: fsUtils.sanitise(address.type)
            }
          },
          context: testContext.context,
          workspacePath: testContext.context.workspacePath,
          workingPath: '.'
        })

        const contentBasePath = addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath(constants.RC_CONTENT_FOLDER)
        ) as AddressPathAbsolute
        const {
          absolute: managedContentAddress,
          relative: managedContentAddressRelative
        } = await cacheManager.createContentPaths({
          rootPath: contentBasePath,
          address: sourceAddress
        })
        await cacheManager.primeContent({
          rootPath: contentBasePath,
          address: sourceAddress
        })

        const onHit = jest.fn()
        const onStale = jest.fn()
        const onMiss = jest
          .fn()
          .mockImplementationOnce(async (contentPath: AddressPathAbsolute) =>
            doFetch({
              cacheManager,
              sourcePath: sourceAddress,
              destinationPath: managedContentAddress
            })
          )

        const getRes = await cacheManager.get({
          address: managedContentAddress,
          // namespace,
          cacheOptions: {},
          // expectedChecksum: "",
          createChecksum: async ({ existentChecksum, contentPath }) => {
            return {
              globalVersion: 1,
              key
            }
          },
          onHit,
          onStale,
          // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          onMiss
          // onHit: () => {},
          // onStale: async ({ contentPath, existentChecksum }) => {
          //   return await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
          // // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
          // onMiss: async ({ contentPath }) => {
          //   throw new Error(`onStale should be called when meta not present but content exists`)
          //   // console.log(`contentPath :>> `, contentPath)
          //   // await doFetch({sourcePath: sourceAddress, destinationPath: contentPath, cacheManager});
          // },
        })

        expectIsOk(getRes)
        const entry = getRes.res

        expect(onStale).toHaveBeenCalledTimes(0) // onStale should be called when meta not present but content exists
        expect(onMiss).toHaveBeenCalledTimes(1) // onMiss only called when content does not exist
        expect(onHit).toHaveBeenCalledTimes(0) // onHit only called when content exists and checksum passes

        expect(entry.contentPath).toEqual(managedContentAddress)
        expect(entry.metaPath.original).toMatch(/.json$/)
        expect(entry.metaPathRelative.original).toMatch(/.json$/)
        expect(entry.checksum).toEqual({
          globalVersion: 1,
          key
        })
        expect(entry.existentChecksum).toBeUndefined()
        expect(entry.checksumValid).toBeTrue()

        // expect(entry).toEqual(
        //   expect.objectContaining({
        //     // sourceAddress,
        //     contentPath: managedContentAddress,
        //     // contentPath: expect.objectContaining({
        //     //   original: expect.stringMatching(
        //     //     `${testContext.testEnvVars.workspacePath.original}/content`
        //     //   ),
        //     // }),
        //     metaPath: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     metaPathRelative: expect.objectContaining({
        //       original: expect.stringMatching(/.json$/),
        //     }),
        //     checksum: {
        //       globalVersion: 1,
        //       key,
        //     },
        //     existentChecksum: undefined,
        //     checksumValid: true,
        //   })
        // );

        const expectUtil = await testContext.createExpectUtil({
          workspacePath: testContext.testEnvVars.workspacePath
        })
        const expectFs = await expectUtil.createFs()
        expect(expectFs.existsSync(`${constants.RC_META_FOLDER}`)).toBeTruthy()

        expect(
          expectFs.existsSync(`meta/${entry.metaPathRelative.original}`)
        ).toBeTruthy()
        expect(
          expectFs.readJson(`meta/${entry.metaPathRelative.original}`)
        ).toEqual({
          contentChecksum: { globalVersion: 1, key }
        })
        expect(
          expectFs.existsSync(`${constants.RC_CONTENT_FOLDER}`)
        ).toBeTruthy()
        expect(
          expectFs.existsSync(
            `${constants.RC_CONTENT_FOLDER}/${managedContentAddressRelative.original}`
          )
        ).toBeTruthy()
      })
    })
  })

  it('sets up ok', async () => {
    const persistentTestEnv = await createPersistentTestEnv({
      testName: `address-cache-manager : managed content : sets up ok`
    })
    await persistentTestEnv.test({}, async (testContext) => {
      await AddressAbsoluteCacheManager.initialise({
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath(constants.RC_META_FOLDER)
        ) as AddressPathAbsolute,
        createAttributes(address) {
          return {
            key: address.addressNormalized,
            namespace: address.type
          }
        },
        context: testContext.context,
        workspacePath: testContext.context.workspacePath,
        workingPath: '.'
      })

      const expectUtil = await testContext.createExpectUtil({
        workspacePath: testContext.testEnvVars.workspacePath
      })
      const expectFs = await expectUtil.createFs()

      expect(expectFs.existsSync(constants.RC_META_FOLDER)).toBeFalsy() // done when .get() called
      expect(expectFs.existsSync(constants.RC_CONTENT_FOLDER)).toBeFalsy() // done when .get() called
    })
  })

  it.skip('throws when a key/namespace are not sanitised', async () => {
    const persistentTestEnv = await createPersistentTestEnv({
      testName: `address-cache-manager : managed content : throws when a key/namespace are not sanitised`
    })
    await persistentTestEnv.test({}, async (testContext) => {
      const sourceAddress = fsUtils.resolveCoreConfig('skeleton.js')
      const key = 'skeleton-js'

      const cacheManager = await AddressAbsoluteCacheManager.initialise({
        metaBaseAddress: addr.pathUtils.join(
          testContext.testEnvVars.workspacePath,
          addr.parsePath(constants.RC_META_FOLDER)
        ) as AddressPathAbsolute,
        createAttributes(address) {
          return {
            key: address.addressNormalized, // not sanitised
            namespace: address.type // not sanitised
          }
        },
        context: testContext.context,
        workspacePath: testContext.context.workspacePath,
        workingPath: '.'
      })

      expect(() =>
        cacheManager.get({
          address: sourceAddress,
          cacheOptions: {},
          createChecksum: async ({ existentChecksum, contentPath }) => {
            return {
              globalVersion: 1,
              key
            }
          },
          onHit: () => {},
          onStale: () => {},
          onMiss: async () => {}
        })
      ).rejects.toBe(
        `AddressCacheManager attributes not sanitised sufficiently for filesystem storage`
      )
    })
  })
})
