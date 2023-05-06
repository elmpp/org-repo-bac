import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError, MessageName } from "@business-as-code/error";
// const {
//   execa,
//   ExecaError,
//   ExecaReturnValue,
//   Options: ExecaOptions,
// } = await import("execa");
import execa from "execa";
import {
  ExecaError,
  ExecaReturnValue,
  Options as ExecaOptions,
} from "execa";
// import {
//   execa,
//   ExecaError,
//   ExecaReturnValue,
//   Options as ExecaOptions,
// } from "execa";
import { constants } from "../constants";
import { assertIsOk, Context, fail, ok, Outputs, Result } from "../__types__";
import { objectMapAndFilter } from "./object-utils";

// export interface ExecOptions
//   extends Omit<import("child_process").SpawnOptions, "stdio" | "env" | "cwd"> {
//   // stdioString?: StdioStringExpandedUnion
//   // stdioStreams?: StdioStreamTuple
//   env?: {
//     [k: string]: any;
//   };
//   cwd: AddressPathAbsolute; // this must be mandatory
//   context: Context;
// }
export interface DoExecOptions extends Omit<ExecaOptions, "cwd"> {
  // /** signals that the exec target is spawned from an mnt checkout. Dev only! @internal */
  // checkoutCwd?: AddressPathAbsolute
  // /** Returns the childProcess directly */
  // raw?: boolean
  // /**
  //  * when launching a new node process, we'll pipe in its output. This output may have different formats
  //  * e.g. merged unformatted/formatted from mnt subprocesses
  //  */
  // subProcessType: Exclude<
  //   Parameters<Mnt.Util.InstanceType<typeof Configuration>['createSubProcess']>[0]['subProcessType'],
  //   'virtual'
  // >

  cwd: AddressPathAbsolute; // this must be mandatory
  context: Context;
  /** @see createStreams#streamVerbosity */
  streamVerbosity?: number;
}

// type ErrorSpawnSetup = BacError<
//   MessageName.EXEC_SPAWN_ERROR,
//   { exitCode: number }
// >;
// type ErrorDuringProcess = BacError<
//   MessageName.EXEC_SERVICE,
//   { outputs: Outputs; exitCode: number }
// >;

type ExecError = BacError<
  MessageName.EXEC_SERVICE,
  { execa: ExecaError; outputs: Outputs }
>;

/**
 Launches node process. Handles output capturing and gives a promise-based approach
 */
export async function doExec({
  cmd,
  options,
}: {
  cmd: string;
  options: DoExecOptions;
}): Promise<Result<{outputs: Outputs; execa: ExecaReturnValue;}, ExecError>> {
  // }): Promise<{success: boolean, outputs: Outputs}> {
  const {
    context,
    // cwd,
    // subProcessType,
    streamVerbosity,
    // raw,
    ...spawnOptions
  } = options;

  // const {JEST_WORKER_ID, ...allowableProcessEnvs} = process.env

  const filterAndStringifyEnvs = (
    envs: Record<string, string>
  ): Record<string, string> => {
    // return Object.entries(envs).map(([key, val]) => (val && val.toString() && !`${val}`.includes(`'`)) ? `${key}='${val}'` : '').join(` `)
    return objectMapAndFilter(envs, (val, key) => {
      const nonMntWhitelist = [
        // https://tinyurl.com/24gbgbln
        "TEMP",
        "TMP",
        "TMPDIR",
      ];
      const mntBlacklist = [
        "MNT_REPORT_TYPE", // envTest process uses PassthroughReport
      ];

      /** we need a good strategy for passing through envs */
      if (
        (!key.toLowerCase().startsWith(constants.ENVIRONMENT_PREFIX) &&
          !nonMntWhitelist.includes(key.toUpperCase())) ||
        mntBlacklist.includes(key.toUpperCase())
      ) {
        return objectMapAndFilter.skip;
      }
      /** if isn't stringifyable or has non-json friendly chars don't allow */
      if (val && val.toString() && !`${val}`.includes(`'`)) {
        return val;
      }
      return objectMapAndFilter.skip;
    });
  };

  // const stdio: StdioOptions = ["inherit", "pipe", "pipe"];

  // console.log(`context.cliOptions.flags["log-level"] :>> `, context.cliOptions.flags["log-level"])

  /** Execa options - https://tinyurl.com/2qndy7hr */
  const execaOptions: ExecaOptions = {
    // shell: true,
    ...spawnOptions,
    cwd: spawnOptions.cwd.original,
    env: {
      ...filterAndStringifyEnvs({
        // ...toEnvironmentSettings(context.configuration.initialSettings), // pass along anything that was in this process's explicit initialSetting
        ...(process.env as Record<string, string>), // want to keep any environment variables
      }), // required
      // PATH: process.env.PATH,
      FORCE_COLOR: "1", // spawn dropping terminal colours - https://tinyurl.com/yyhl9kmu
      YARN_IGNORE_CWD: "true",
    } satisfies ExecaOptions["env"],
    // verbose: true,
    // verbose: context.cliOptions.flags["logLevel"] === "debug",
    // stdio,
  };

  console.log(`execaOptions :>> `, execaOptions)

  // const fullSpawnOptions: CommonSpawnOptions = {
  //   shell: true,
  //   ...spawnOptions,
  //   cwd: spawnOptions.cwd.original,
  //   env: identity<ExecOptions["env"]>({
  //     ...filterAndStringifyEnvs({
  //       // ...toEnvironmentSettings(context.configuration.initialSettings), // pass along anything that was in this process's explicit initialSetting
  //       ...(process.env as Record<string, string>), // want to keep any environment variables
  //     }), // required
  //     PATH: process.env.PATH,
  //     FORCE_COLOR: "1", // spawn dropping terminal colours - https://tinyurl.com/yyhl9kmu
  //     YARN_IGNORE_CWD: true,
  //   }),
  //   stdio,
  // };

  const optionsAsCommand = (cmd: string, options: ExecaOptions): string => {
    const blacklist = [] as string[];
    const envs = Object.entries(options.env!)
      .filter(([key, val]) => !blacklist.includes(key))
      .map(([key, val]) => `${key}='${val}'`)
      .join(` `);
    if (options.shell) {

    }
    return `(cd ${options.cwd}; ${envs} ${cmd};)`;
  };

  await options.context.logger.debug(
    // MessageName.UNNAMED,
    `DoExec: Command: '${cmd}'. Cwd: '${
      spawnOptions.cwd.original
    }'. Full cmd: '${optionsAsCommand(cmd, execaOptions)}'`
  );

  try {
    const execaResult = await execa(cmd, execaOptions);
    const successPayload = {
      execa: execaResult,
      outputs: {
        stdout: execaResult.stdout,
        stderr: execaResult.stderr,
      },
    };
    return ok(successPayload);
  } catch (err) {
    const caughtError = err as ExecaError;
    const execError = BacError.fromError(caughtError, {reportCode: MessageName.EXEC_SERVICE, extra: {
      execa: caughtError,
      outputs: {
        stdout: caughtError.stdout,
        stderr: caughtError.stderr,
      },
    }})
    // (
    //   MessageName.EXEC_SERVICE,
    //   caughtError.message,
    //   {
    //     extra: {
    //       execa: caughtError,
    //       outputs: {
    //         stdout: caughtError.stdout,
    //         stderr: caughtError.stderr,
    //       },
    //     },
    //   }
    // );
    // const execError: ExecError = new BacError(
    //   MessageName.EXEC_SERVICE,
    //   caughtError.message,
    //   {
    //     extra: {
    //       execa: caughtError,
    //       outputs: {
    //         stdout: caughtError.stdout,
    //         stderr: caughtError.stderr,
    //       },
    //     },
    //   }
    // );

    return fail(execError);
  }
}

export async function doExecThrow(options: {
  cmd: string;
  options: DoExecOptions;
}): Promise<{ execa: ExecaReturnValue; outputs: Outputs }> {
  const res = await doExec(options);
// console.log(`reswwwwwwwwwww :>> `, res.res, Object.keys(res.res))
  if (assertIsOk(res)) {
    return res.res;
  }

  // throw new Error('bollards')
  throw res.res;
}
