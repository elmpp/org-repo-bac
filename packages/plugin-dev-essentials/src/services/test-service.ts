import {
  ServiceInitialiseCommonOptions,
  execUtils as _execUtils,
  Result,
  expectIsOk,
} from "@business-as-code/core";
import { BacError } from "@business-as-code/error";

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

  async test({
    testFileMatch,
    // testMatch,
    stage,
    cliSource,
    watch = false,
  }: {
    /** actual test file name match */
    testFileMatch?: string;
    // /** it/describe name match - DOES NOT WORK? */
    // testMatch?: string;
    stage: `stage${number}`;
    cliSource: "cliRegistry" | "cliLinked";
    watch?: boolean;
  }): Promise<Result<{}, { error: BacError }>> {
    const { context } = this.options;

    const packageManagerService = await context.serviceFactory(
      "packageManager",
      {
        context,
        workingPath: ".",
      }
    );

    context.logger.info(`RUNNING STAGE0 TESTS - ${cliSource}`);

    const stage0Res = await packageManagerService.run({
      command: `jest 'stage0'${
        stage === 'stage0' ? ` --watch` : ``
      }`,
      options: {
        env: {
          BAC_TEST_CLISOURCE: cliSource,
          FORCE_COLOR: 'true',
        },
        stdin: 'inherit',
      },
    });
    expectIsOk(stage0Res);

    context.logger.info(`RUNNING STAGE1 TESTS - ${cliSource}`);

    const stage1Res = await packageManagerService.run({
      command: `jest 'stage1'${
        stage === 'stage1' ? ` --watch` : ``
      }`,
      options: {
        env: {
          BAC_TEST_CLISOURCE: cliSource,
          FORCE_COLOR: 'true',
        },
        stdin: 'inherit',
      },
    });
    expectIsOk(stage1Res);

    if (!["stage0", "stage1"].includes(stage)) {
      context.logger.info(
        `RUNNING ${stage.toUpperCase()} TESTS - ${cliSource} - testFileMatch: '${testFileMatch}'`
      );

      const stageXRes = await packageManagerService.run({
        command: `jest ${
          testFileMatch ? ` '${testFileMatch}.*${stage}'` : ` '${stage}'`
        } --config jest.config.js${
          watch ? ` --watch` : ``
        }`,
        options: {
          logLevel: "debug",
          env: {
            BAC_TEST_CLISOURCE: cliSource,
            FORCE_COLOR: 'true',
          },
          stdin: 'inherit',
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
