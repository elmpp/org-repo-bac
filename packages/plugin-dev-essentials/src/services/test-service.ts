import {
  ServiceInitialiseCommonOptions,
  execUtils as _execUtils,
  Result,
  expectIsOk,
  assertIsOk,
  ok,
  mapExecUtils,
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

  constructor(protected options: Options) { }

  /**
   the following need to be running to run our tests:
    - git server (http/ssh)
    - verdaccio registry
   */
  async startDaemons(): Promise<Result<{}, { error: BacError }>> {
    const checkBefore = false;
    const packageManagerService = await this.options.context.serviceFactory(
      "packageManager",
      {
        context: this.options.context,
        workingPath: ".",
        packageManager: "packageManagerBun", // blocked until this ticket is complete :cry - https://github.com/oven-sh/bun/issues/6418
        // packageManager: "packageManagerPnpm",
      }
    );

    const proms: Promise<unknown>[] = [];

    if (
      !checkBefore ||
      !assertIsOk(
        await packageManagerService.run({
          command: `verdaccio:isRunning`,
          pkg: "@business-as-code/tests-verdaccio",
        })
      )
    ) {
      proms.push(
        packageManagerService.run({
          command: `verdaccio:startBackground`,
          pkg: "@business-as-code/tests-verdaccio",
          options: {
            stdio: "inherit",
          },
        })
      );
    }

    if (
      !checkBefore ||
      !assertIsOk(
        await packageManagerService.run({
          command: `gitServerHttp:isRunning`,
          pkg: `@business-as-code/tests-git-server`,
        })
      )
    ) {
      proms.push(
        packageManagerService.run({
          command: `gitServerHttp:startBackground`,
          pkg: "@business-as-code/tests-git-server",
          options: {
            stdio: "inherit",
          },
        })
      );
    }

    if (
      !checkBefore ||
      !assertIsOk(
        await packageManagerService.run({
          command: `gitServerSshPubKey:isRunning`,
          pkg: "@business-as-code/tests-git-server",
        })
      )
    ) {
      proms.push(
        packageManagerService.run({
          command: `gitServerSshPubKey:startBackground`,
          pkg: "@business-as-code/tests-git-server",
          options: {
            stdio: "inherit",
          },
        })
      );
    }

    // github does not support password authentication currently + hard to test
    // if (
    //   !checkBefore ||
    //   !assertIsOk(
    //     await packageManagerService.run({
    //       command: `gitServerSshPassword:isRunning`,
    //       pkg: "@business-as-code/tests-git-server",
    //     })
    //   )
    // ) {
    //   proms.push(
    //     packageManagerService.run({
    //       command: `gitServerSshPassword:startBackground`,
    //       pkg: "@business-as-code/tests-git-server",
    //       options: {
    //         stdio: "inherit",
    //       },
    //     })
    //   );
    // }

    if (
      !checkBefore ||
      !assertIsOk(
        await packageManagerService.run({
          command: `gitServerSshAnonymous:isRunning`,
          pkg: "@business-as-code/tests-git-server",
        })
      )
    ) {
      proms.push(
        packageManagerService.run({
          command: `gitServerSshAnonymous:startBackground`,
          pkg: "@business-as-code/tests-git-server",
          options: {
            stdio: "inherit",
          },
        })
      );
    }

    proms.push(
      new Promise((resolve, reject) =>
        setTimeout(() => {
          this.ensureDaemons().then(resolve).catch(reject);
        }, 7000)
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
        // packageManager: "packageManagerBun", // BASED ON THE CHECKOUT REPO. we're in dev mode. This allows filtering query
      }
    );

    await (async function verdaccio() {
      const isRunning = await packageManagerService.run({
        command: `verdaccio:isRunning`,
        pkg: "@business-as-code/tests-verdaccio",
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
        command: `gitServerHttp:isRunning`,
        pkg: `@business-as-code/tests-git-server`,
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
        command: `gitServerSshPubKey:isRunning`,
        pkg: `@business-as-code/tests-git-server`,
      });
      if (!assertIsOk(isRunning)) {
        throw new BacError(
          MessageName.UNNAMED,
          `Git ssh public key server not running. Do you need to start the daemons?`
        );
      }
    })();
    // github does not support password authentication currently + hard to test
    // await (async function gitServerSshPassword() {
    //   const isRunning = await packageManagerService.run({
    //     command: `gitServerSshPassword:isRunning`,
    //     pkg: `@business-as-code/tests-git-server`,
    //   });
    //   if (!assertIsOk(isRunning)) {
    //     throw new BacError(
    //       MessageName.UNNAMED,
    //       `Git ssh password server not running. Do you need to start the daemons?`
    //     );
    //   }
    // })();
    await (async function gitServerSshAnonymous() {
      const isRunning = await packageManagerService.run({
        command: `gitServerSshAnonymous:isRunning`,
        pkg: `@business-as-code/tests-git-server`,
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
        // packageManager: "packageManagerPnpm", // BASED ON THE CHECKOUT REPO. we're in dev mode. This allows filtering query
      }
    );

    await (async function verdaccio() {
      await packageManagerService.run({
        command: `verdaccio:stopBackground`,
        pkg: `@business-as-code/tests-verdaccio`,
      });
    })();
    await (async function gitServerHttp() {
      await packageManagerService.run({
        command: `gitServerHttp:stopBackground`,
        pkg: `@business-as-code/tests-git-server`,
      });
    })();
    await (async function gitServerSshPubKey() {
      await packageManagerService.run({
        command: `gitServerSshPubKey:stopBackground`,
        pkg: `@business-as-code/tests-git-server`,
      });
    })();
    // github does not support password authentication currently + hard to test
    // await (async function gitServerSshPassword() {
    //   await packageManagerService.run({
    //     command: `gitServerSshPassword:stopBackground`,
    //     pkg: `@business-as-code/tests-git-server`,
    //   });
    // })();
    await (async function gitServerSshAnonymous() {
      await packageManagerService.run({
        command: `gitServerSshAnonymous:stopBackground`,
        pkg: `@business-as-code/tests-git-server`,
      });
    })();
    // await (async function gitServerSshAnonymous() {
    //   await packageManagerService.run({
    //     command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:stopBackground`,
    //   });
    // })();

    // this.options.context.logger.info(`Daemons stopped`);

    return ok({});

    // ;await (async function gitServerSshAnonymous() {
    //     await packageManagerService.run({
    //       command: `--filter @business-as-code/tests-git-server run gitServerSshAnonymous:stopBackground`
    //     });
    // })()
  }

  async cleanProjects(): Promise<Result<unknown, { error: BacError }>> {
    const moonService = await this.options.context.serviceFactory('moon', {
      context: this.options.context,
      workingPath: '.',
    })
    const moonProjects = await moonService.findProjects({ query: 'projectType=library || projectType=application' })

    const mapRes = await mapExecUtils.doMapExec({
      command: `rm -rf dist`,
      projects: moonProjects.projects,
      execOptions: {
        context: this.options.context,
        shell: true,
        logLevel: 'warn',
      },
    })
    // console.log(`mapRes :>> `, mapRes)
    expectIsOk(mapRes)

    return {
      success: true,
      res: undefined,
    }


    // NEED TO EXTENDS EXEC-UTIL OR LOOK AT THAT MICROSOFT TOOL. SHOULD BE ABLE TO EXEC ARBITRARY STUFF ACROSS PROJECTS

    // console.log(`projects :>> `, projects)
    // await this.options.context.lifecycles.runProject.executeRunProject({common: {
    //   context: this.options.context,
    //   workspacePath: this.options.workspacePath,
    //   workingPath: '.',
    // }, projects: moonProjects.projects, options: [
    //   {

    //   }
    // ]})
  }

  async buildAndPublishSnapshot(): Promise<Result<unknown, { error: BacError }>> {

    const bacService = await this.options.context.serviceFactory("bac", {
      context: this.options.context,
      workingPath: ".",
      packageManager: 'packageManagerBun',
    });
    // return bacService.runTask({ command: "publishDev" });
    // console.log(`:>> LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL`);

    await this.cleanProjects()

    const buildRes = await bacService.run({ command: `build bun-bundle --workspacePath=${this.options.context.workspacePath.original}` })
    // console.log(`buildRes :>> `, buildRes)
    expectIsOk(buildRes)

    const snapshotRes = await bacService.run({ command: `release snapshot --message 'this is a snapshot release' --workspacePath ${this.options.context.workspacePath.original} --tag bollards --logLevel debug` })
    expectIsOk(snapshotRes)

    return snapshotRes
    // return {success: true, res: undefined}
  }

  // with bun, don't need the moon layer
  // async buildAndPublishSnapshot(): Promise<Result<{}, { error: BacError }>> {
  //   const moonService = await this.options.context.serviceFactory("moon", {
  //     context: this.options.context,
  //     workingPath: ".",
  //   });
  //   return moonService.runTask({ command: "publishDev" });
  // }

  async test({
    testFileMatch,
    // testNameMatch,
    stage,
    cliSource,
    watch = false,
    skipEarlier = false,
    skipDaemons = false,
    skipPublish = false,
  }: {
    /** actual test file name match */
    testFileMatch?: string;
    // /** it/describe name match - DOES NOT WORK? */
    // testMatch?: string;
    stage: `stage${number}`;
    cliSource: "cliRegistry" | "cliLinked";
    watch?: boolean;
    skipEarlier?: boolean;
    skipDaemons?: boolean;
    skipPublish?: boolean;
  }): Promise<Result<{}, { error: BacError }>> {
    const { context } = this.options;

    if (!skipDaemons) {
      try {
        await this.ensureDaemons();
      } catch (err) {
        console.log(`err test :>> `, err);
        return {
          success: false as const,
          res: {
            error: err as BacError,
          },
        };
      }
    }

    if (cliSource === "cliRegistry" && !skipPublish) {
      const publishRes = await this.buildAndPublishSnapshot();
      if (!assertIsOk(publishRes)) {
        return publishRes;
      }
    }

    const packageManagerService = await context.serviceFactory(
      "packageManager",
      {
        context,
        workingPath: ".",
      }
    );

    async function runIf(cb: () => {}, aStage: `stage${number}`) {
      const stageNumberCurrent = parseInt(stage.at(-1)!);
      const stageNumberIntended = parseInt(aStage.at(-1)!);

      // if (skipEarlier && stageNumberIntended < stageNumberCurrent) {
      if (skipEarlier) {
        context.logger.info(
          `🛑 SKIPPING ${aStage.toUpperCase()} TESTS (due to --skipEarlier) - ${cliSource}`
        );
        return;
      }
      if (stageNumberIntended > stageNumberCurrent) {
        return;
      }
      return await cb();
    }

    await runIf(async () => {
      context.logger.info(
        `🟢 RUNNING STAGE0 TESTS (non content-dependent test-env tests) - ${cliSource}`
      );

      const stage0Res = await packageManagerService.run({
        command: `${stage === "stage0" ? `dev:testWatch` : `dev:test`} ${testFileMatch && stage === "stage0"
          ? ` '${testFileMatch}-stage0'`
          : ` 'stage0'`
          }`,
        options: {
          env: {
            BAC_TEST_CLISOURCE: cliSource,
            BAC_LOG_LEVEL: this.options.context.cliOptions.flags.logLevel,
            FORCE_COLOR: "true",
          },
          stdin: "inherit",
          logLevel: "debug", // always
        },
      });
      expectIsOk(stage0Res);
    }, "stage0");

    await runIf(async () => {
      context.logger.info(
        `🟢 RUNNING STAGE1 TESTS (content-creating test-env tests) - ${cliSource}`
      );

      const stage1Res = await packageManagerService.run({
        command: `${stage === "stage1" ? `dev:testWatch` : `dev:test`} ${testFileMatch && stage === "stage1"
          ? ` '${testFileMatch}-stage1'`
          : ` 'stage1'`
          }`,
        options: {
          env: {
            BAC_TEST_CLISOURCE: cliSource,
            BAC_LOG_LEVEL: this.options.context.cliOptions.flags.logLevel,
            FORCE_COLOR: "true",
          },
          stdin: "inherit",
          logLevel: "debug", // always
        },
      });
      expectIsOk(stage1Res);
    }, "stage1");

    await runIf(async () => {
      context.logger.info(
        `🟢 RUNNING STAGE2 TESTS (content-validating test-env tests) - ${cliSource}`
      );

      const stage2Res = await packageManagerService.run({
        command: `${stage === "stage2" ? `dev:testWatch` : `dev:test`} ${testFileMatch && stage === "stage2"
          ? ` '${testFileMatch}-stage2'`
          : ` 'stage2'`
          }`,
        options: {
          env: {
            BAC_TEST_CLISOURCE: cliSource,
            BAC_LOG_LEVEL: this.options.context.cliOptions.flags.logLevel,
            FORCE_COLOR: "true",
          },
          stdin: "inherit",
          logLevel: "debug", // always
        },
      });
      expectIsOk(stage2Res);
    }, "stage2");

    // if (!["stage0", "stage1", "stage2"].includes(stage)) {
    context.logger.info(
      `🟢 RUNNING ${stage.toUpperCase()} TESTS - ${cliSource} - testFileMatch: '${testFileMatch}'`
    );

    const stageXRes = await packageManagerService.run({
      command: `${watch ? `dev:testWatch` : `dev:test`} ${testFileMatch ? ` '${testFileMatch}-${stage}'` : ` '${stage}'`
        }`,
      options: {
        env: {
          BAC_TEST_CLISOURCE: cliSource,
          BAC_LOG_LEVEL: this.options.context.cliOptions.flags.logLevel,
          FORCE_COLOR: "true",
        },
        stdin: "inherit",
        logLevel: "debug",
      },
    });

    expectIsOk(stageXRes);
    // }

    return {
      success: true,
      res: {},
    };
  }
}
