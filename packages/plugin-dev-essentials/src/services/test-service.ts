import {
  ServiceInitialiseCommonOptions,
  execUtils as _execUtils,
  Result,
  expectIsOk,
  assertIsOk,
  ok,
} from "@business-as-code/core";
import { BacError, MessageName } from "@business-as-code/error";

declare global {
  namespace Bac {
    interface Services {
      test: {
        insType: TestService;
        staticType: typeof TestService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {};

export class TestService {
  static title = "test" as const;

  get ctor(): typeof TestService {
    return this.constructor as unknown as typeof TestService;
  }
  get title(): (typeof TestService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof TestService)["title"];
  }

  static async initialise(options: Options) {
    const ins = new TestService(options);
    return ins;
  }

  constructor(protected options: Options) {}

  /**
   the following need to be running to run our tests:
    - git server (http/ssh)
    - verdaccio registry
   */
  async startDaemons(): Promise<Result<{}, { error: BacError }>> {
    const packageManagerService = await this.options.context.serviceFactory(
      "packageManager",
      {
        context: this.options.context,
        workingPath: ".",
        packageManager: "packageManagerPnpm", // we're in dev mode. This allows filtering query
      }
    );

    const proms: Promise<unknown>[] = [];

    if (
      !assertIsOk(
        await packageManagerService.run({
          command: `--filter @business-as-code/tests-verdaccio run verdaccio:isRunning`,
        })
      )
    ) {
      // const res1 = await packageManagerService.run({
      //   command: `--filter @business-as-code/tests-verdaccio run verdaccio:startBackground`,
      //   options: {detached: true},
      // });
      // if (!assertIsOk(res1)) return res1
      proms.push(
        packageManagerService.run({
          command: `--filter @business-as-code/tests-verdaccio run verdaccio:startBackground`,
        })
      );
      // if (!assertIsOk(res1)) return res1
    }
    if (
      !assertIsOk(
        await packageManagerService.run({
          command: `--filter @business-as-code/tests-git-server run gitServerHttp:isRunning`,
        })
      )
    ) {
      // const res2 = await packageManagerService.run({
      //   command: `--filter @business-as-code/tests-git-server run gitServerHttp:startBackground`,
      //   options: {detached: true},
      // });
      // if (!assertIsOk(res2)) return res2
      proms.push(
        packageManagerService.run({
          command: `--filter @business-as-code/tests-git-server run gitServerHttp:startBackground`,
        })
      );
    }
    if (
      !assertIsOk(
        await packageManagerService.run({
          command: `--filter @business-as-code/tests-git-server run gitServerSshPubKey:isRunning`,
        })
      )
    ) {
      // const res3 = await packageManagerService.run({
      //   command: `--filter @business-as-code/tests-git-server run gitServerSshPubKey:startBackground`,
      //   options: {detached: true},
      // });
      // if (!assertIsOk(res3)) return res3
      proms.push(
        packageManagerService.run({
          command: `--filter @business-as-code/tests-git-server run gitServerSshPubKey:startBackground`,
        })
      );
    }
    if (
      !assertIsOk(
        await packageManagerService.run({
          command: `--filter @business-as-code/tests-git-server run gitServerSshPassword:isRunning`,
        })
      )
    ) {
      // const res3 = await packageManagerService.run({
      //   command: `--filter @business-as-code/tests-git-server run gitServerSshPubKey:startBackground`,
      //   options: {detached: true},
      // });
      // if (!assertIsOk(res3)) return res3
      proms.push(
        packageManagerService.run({
          command: `--filter @business-as-code/tests-git-server run gitServerSshPassword:startBackground`,
        })
      );
    }
    if (
      !assertIsOk(
        await packageManagerService.run({
          command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:isRunning`,
        })
      )
    ) {
      // const res3 = await packageManagerService.run({
      //   command: `--filter @business-as-code/tests-git-server run gitServerSshPubKey:startBackground`,
      //   options: {detached: true},
      // });
      // if (!assertIsOk(res3)) return res3
      proms.push(
        packageManagerService.run({
          command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:startBackground`,
        })
      );
    }

    // if (!assertIsOk((await packageManagerService.run({
    //   command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:isRunning`,
    // })))) {
    //   // const res4 = await packageManagerService.run({
    //   //   command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:startBackground`,
    //   //   options: {detached: true}
    //   // });
    //   // if (!assertIsOk(res4)) return res4
    //   proms.push(packageManagerService.run({
    //     command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:startBackground`,
    //   }))
    // }

    proms.push(
      new Promise((resolve, reject) =>
        setTimeout(() => {
          this.ensureDaemons().then(resolve).catch(reject);
        }, 10000)
      )
    );

    await Promise.all(proms).then(() =>
      this.options.context.logger.info(`Daemons already all started`)
    );

    // const res1 = await (async function verdaccio() {
    //   const isRunning = await packageManagerService.run({
    //     command: `--filter @business-as-code/tests-verdaccio run verdaccio:isRunning`,
    //   });
    //   if (!assertIsOk(isRunning)) {
    //     return await packageManagerService.run({
    //       command: `--filter @business-as-code/tests-verdaccio run verdaccio:startBackground`,
    //     });
    //   }
    // })();
    // if (!assertIsOk(res1)) return res1;
    // const res2 = await (async function gitServerHttp() {
    //   const isRunning = await packageManagerService.run({
    //     command: `--filter @business-as-code/tests-git-server run gitServerHttp:isRunning`,
    //   });
    //   if (!assertIsOk(isRunning)) {
    //     return packageManagerService.run({
    //       command: `--filter @business-as-code/tests-git-server run gitServerHttp:startBackground`,
    //     });
    //   }
    // })();
    // if (!assertIsOk(res2)) return res2;
    // const res3 = await (async function gitServerSshPubKey() {
    //   const isRunning = await packageManagerService.run({
    //     command: `--filter @business-as-code/tests-git-server run gitServerSshPubKey:isRunning`,
    //   });
    //   if (!assertIsOk(isRunning)) {
    //     return packageManagerService.run({
    //       command: `--filter @business-as-code/tests-git-server run gitServerSshPubKey:startBackground`,
    //     });
    //   }
    // })();
    // if (!assertIsOk(res3)) return res3;
    // const res4 = await (async function gitServerSshAnonymous() {
    //   const isRunning = await packageManagerService.run({
    //     command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:isRunning`,
    //   });
    //   if (!assertIsOk(isRunning)) {
    //     return packageManagerService.run({
    //       command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:startBackground`,
    //     });
    //   }
    // })();
    // if (!assertIsOk(res4)) return res4;

    return ok({});
  }

  protected async ensureDaemons() {
    const packageManagerService = await this.options.context.serviceFactory(
      "packageManager",
      {
        context: this.options.context,
        workingPath: ".",
        packageManager: "packageManagerPnpm", // we're in dev mode. This allows filtering query
      }
    );

    await (async function verdaccio() {
      const isRunning = await packageManagerService.run({
        command: `--filter @business-as-code/tests-verdaccio run verdaccio:isRunning`,
      });
      if (!assertIsOk(isRunning)) {
        throw new BacError(
          MessageName.UNNAMED,
          `Verdaccio server not running. Do you need to start the daemons?`
        );
      }
    })();
    await (async function gitServerHttp() {
      const isRunning = await packageManagerService.run({
        command: `--filter @business-as-code/tests-git-server run gitServerHttp:isRunning`,
      });
      if (!assertIsOk(isRunning)) {
        throw new BacError(
          MessageName.UNNAMED,
          `Git http server not running. Do you need to start the daemons?`
        );
      }
    })();
    await (async function gitServerSshPubKey() {
      const isRunning = await packageManagerService.run({
        command: `--filter @business-as-code/tests-git-server run gitServerSshPubKey:isRunning`,
      });
      if (!assertIsOk(isRunning)) {
        throw new BacError(
          MessageName.UNNAMED,
          `Git ssh public key server not running. Do you need to start the daemons?`
        );
      }
    })();
    await (async function gitServerSshPassword() {
      const isRunning = await packageManagerService.run({
        command: `--filter @business-as-code/tests-git-server run gitServerSshPassword:isRunning`,
      });
      if (!assertIsOk(isRunning)) {
        throw new BacError(
          MessageName.UNNAMED,
          `Git ssh password server not running. Do you need to start the daemons?`
        );
      }
    })();
    await (async function gitServerSshAnonymous() {
      const isRunning = await packageManagerService.run({
        command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:isRunning`,
      });
      if (!assertIsOk(isRunning)) {
        throw new BacError(
          MessageName.UNNAMED,
          `Git ssh anonymous server not running. Do you need to start the daemons?`
        );
      }
    })();

    this.options.context.logger.info(`Daemons running ok`);

    // ;await (async function gitServerSshAnonymous() {
    //   const isRunning = await packageManagerService.run({
    //     command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:isRunning`
    //   });
    //   if (!assertIsOk(isRunning)) {
    //       throw new Error(`Git ssh anonymous server not running`)
    //   }
    // })()
  }

  async stopDaemons(): Promise<Result<{}, { error: BacError }>> {
    const packageManagerService = await this.options.context.serviceFactory(
      "packageManager",
      {
        context: this.options.context,
        workingPath: ".",
        packageManager: "packageManagerPnpm", // we're in dev mode. This allows filtering query
      }
    );

    await (async function verdaccio() {
      await packageManagerService.run({
        command: `--filter @business-as-code/tests-verdaccio run verdaccio:stopBackground`,
      });
    })();
    await (async function gitServerHttp() {
      await packageManagerService.run({
        command: `--filter @business-as-code/tests-git-server run gitServerHttp:stopBackground`,
      });
    })();
    await (async function gitServerSshPubKey() {
      await packageManagerService.run({
        command: `--filter @business-as-code/tests-git-server run gitServerSshPubKey:stopBackground`,
      });
    })();
    await (async function gitServerSshPassword() {
      await packageManagerService.run({
        command: `--filter @business-as-code/tests-git-server run gitServerSshPassword:stopBackground`,
      });
    })();
    await (async function gitServerSshAnonymous() {
      await packageManagerService.run({
        command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:stopBackground`,
      });
    })();
    // await (async function gitServerSshAnonymous() {
    //   await packageManagerService.run({
    //     command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:stopBackground`,
    //   });
    // })();

    this.options.context.logger.info(`Daemons stopped`);

    return ok({});

    // ;await (async function gitServerSshAnonymous() {
    //     await packageManagerService.run({
    //       command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:stopBackground`
    //     });
    // })()
  }

  async buildAndPublishSnapshot(): Promise<Result<{}, { error: BacError }>> {
    const moonService = await this.options.context.serviceFactory("moon", {
      context: this.options.context,
      workingPath: ".",
    });
    return moonService.runTask({ command: "publishDev" });
  }

  async test({
    testFileMatch,
    // testMatch,
    stage,
    cliSource,
    watch = false,
    skipEarlier = false,
  }: {
    /** actual test file name match */
    testFileMatch?: string;
    // /** it/describe name match - DOES NOT WORK? */
    // testMatch?: string;
    stage: `stage${number}`;
    cliSource: "cliRegistry" | "cliLinked";
    watch?: boolean;
    skipEarlier?: boolean;
  }): Promise<Result<{}, { error: BacError }>> {
    const { context } = this.options;

    try {
      await this.ensureDaemons();
      if (cliSource === "cliRegistry") {
        await this.buildAndPublishSnapshot();
      }
    } catch (err) {
      return {
        success: false as const,
        res: {
          error: err as BacError,
        },
      };
    }

    const packageManagerService = await context.serviceFactory(
      "packageManager",
      {
        context,
        workingPath: ".",
      }
    );

    async function runIf(cb: () => {}, aStage: `stage${number}`) {
      const stageNumberCurrent = parseInt(stage.at(-1)!)
      const stageNumberIntended = parseInt(aStage.at(-1)!)

      // console.log(`stageNumberCurrent, stageNumberIntended :>> `, stageNumberCurrent, stageNumberIntended, stage, aStage, stage.at(-1), aStage.at(-1))

      if (skipEarlier && (stageNumberIntended <= stageNumberCurrent)) {
        context.logger.info(
          `SKIPPING ${aStage.toUpperCase()} TESTS (due to --skipEarlier) - ${cliSource}`
        );
        return
      }
      await cb()
    }

    await runIf(async () => {
      context.logger.info(
        `RUNNING STAGE0 TESTS (non content-dependent test-env tests) - ${cliSource}`
      );

      const stage0Res = await packageManagerService.run({
        command: `jest ${
          testFileMatch && stage === "stage0"
            ? ` '${testFileMatch}.*stage0'`
            : ` 'stage0'`
        } ${stage === "stage0" ? ` --watch` : ``}`,
        options: {
          env: {
            BAC_TEST_CLISOURCE: cliSource,
            FORCE_COLOR: "true",
          },
          stdin: "inherit",
          logLevel: 'debug', // always
        },
      });
      expectIsOk(stage0Res);
    }, "stage0");

    await runIf(async () => {
      context.logger.info(
        `RUNNING STAGE1 TESTS (content-creating test-env tests) - ${cliSource}`
      );

      const stage1Res = await packageManagerService.run({
        command: `jest ${
          testFileMatch && stage === "stage1"
            ? ` '${testFileMatch}.*stage1'`
            : ` 'stage1'`
        } ${stage === "stage1" ? ` --watch` : ``}`,
        options: {
          env: {
            BAC_TEST_CLISOURCE: cliSource,
            FORCE_COLOR: "true",
          },
          stdin: "inherit",
          logLevel: 'debug', // always
        },
      });
      expectIsOk(stage1Res);
    }, "stage1");

    await runIf(async () => {
      context.logger.info(
        `RUNNING STAGE2 TESTS (content-validating test-env tests) - ${cliSource}`
      );

      const stage2Res = await packageManagerService.run({
        command: `jest ${
          testFileMatch && stage === "stage2"
            ? ` '${testFileMatch}.*stage2'`
            : ` 'stage2'`
        } ${stage === "stage2" ? ` --watch` : ``}`,
        options: {
          env: {
            BAC_TEST_CLISOURCE: cliSource,
            FORCE_COLOR: "true",
          },
          stdin: "inherit",
          logLevel: 'debug', // always
        },
      });
      expectIsOk(stage2Res);
    }, "stage2");

    if (!["stage0", "stage1", "stage2"].includes(stage)) {
      context.logger.info(
        `RUNNING ${stage.toUpperCase()} TESTS - ${cliSource} - testFileMatch: '${testFileMatch}'`
      );

      const stageXRes = await packageManagerService.run({
        command: `jest ${
          testFileMatch ? ` '${testFileMatch}.*${stage}'` : ` '${stage}'`
        } --config jest.config.js${watch ? ` --watch` : ``}`,
        options: {
          env: {
            BAC_TEST_CLISOURCE: cliSource,
            FORCE_COLOR: "true",
          },
          stdin: "inherit",
          logLevel: "debug",
        },
      });

      expectIsOk(stageXRes);
    }

    return {
      success: true,
      res: {},
    };
  }
}
