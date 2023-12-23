#!/usr/bin/env node

import { LogLevel, ServiceProvidersForAsByMethod, handleCommandError } from "@business-as-code/core";
import { BacError } from '@business-as-code/error';
import * as oclif from '@oclif/core';
import { OclifError, PrettyPrintableError } from '@oclif/core/lib/interfaces';
import { EOL } from 'os';

// In dev mode, always show stack traces
oclif.settings.debug = true;

// console.log(`process.argv :>> `, process.argv)

oclif
  // .run()
  .run(undefined, { root: __dirname })
  // .then(() => oclif.flush())
  .then(require('@oclif/core/flush'))
  .catch(err => {
    // console.log(`errbbbb :>> `, err)
    // console.log(`err.stack :>> `, err.stack)
    handleCommandError({ err, exitProcess: true })
  });
// .catch(require('@oclif/core/handle'))


// /**
//    catastrophic process error. Replaces - https://github.com/oclif/core/blob/ca88895bcfdca2d1c1ae5eda6e879ae6b1ac4122/src/errors/handle.ts#L10
//    Defined here because causes panic during `bun build` when in core
//    */
// export function handleCommandError({
//   err,
//   exitProcess,
//   extra,
// }: {
//   err: Error & Partial<PrettyPrintableError> & Partial<OclifError>;
//   exitProcess: boolean;
//   extra?: {
//     args: string[];
//     cwd: string;
//     logLevel: LogLevel;
//     packageManager?: ServiceProvidersForAsByMethod<"packageManager">;
//   };
// }) {
//   // console.log(`:>> handling error`, extra, err, exitProcess);

//   // const logger = process.stderr.write; // reference does not seem to work

//   try {
//     // console.log(`err :>> `, err.stack)
//     // if (!err) err = new Error("no error?");
//     if (err.message === "SIGINT") process.exit(1);
//     // console.log(`err.message :>> `, err.message)

//     // const shouldPrint = !(err instanceof ExitError)
//     // const pretty = prettyPrint(err)
//     // const stack = clean(err.stack || '', {pretty: true})
//     // const stack = err.stack || "";

//     // if (shouldPrint) {
//     //   logger(err.stack)
//     //   // console.error(pretty ? pretty : stack)
//     // }

//     // console.log(`err.message :>> `, err.message)
//     let wrapped = BacError.fromError(err, { messagePrefix: `Failure during command invocation.` })
//     // process.stderr.write(`:>> BBBBBBBBB`);
//     // let msg = `Failure during command invocation.`

//     // console.log(`err.message :>> `, err.message)

//     // const errWrapped = BacErrorWrapper()

//     // console.log(`extra :>> `, extra)
//     if (extra) {
//       wrapped = BacError.fromError(err, {
//         messagePrefix: `Failure during command invocation. Command: '${extra.args.join(
//           " "
//         )}'. Cwd: '${extra.cwd}'. Full command: 'cd ${extra.cwd
//           }; ${extra.packageManager ? extra.packageManager.replace('packageManager', '').toLowerCase() : 'bun --bun'} bac-test ${extra.args.join(" ")}'`
//       })
//       // process.stdout.write(
//       //   `Failure during command invocation. Command: '${extra.args.join(
//       //     " "
//       //   )}'. Cwd: '${extra.cwd}'. Full command: 'cd ${
//       //     extra.cwd
//       //   }; ${extra.packageManager ? extra.packageManager.replace('packageManager', '').toLowerCase() : 'bun --bun'} bac-test ${extra.args.join(" ")}'` + EOL
//       // );
//     }

//     // const wrappedErr = new BacErrorWrapper(MessageName.UNNAMED, msg, err)
//     const exitCode =
//       err.oclif?.exit !== undefined && err.oclif?.exit !== false
//         ? err.oclif?.exit
//         : 1;


//     if (process.stderr.write && err.code !== "EEXIT") {


//       // console.log(`err :>> `, err.stack) // you're probably still waiting for this to be fixed - https://github.com/oven-sh/bun/issues/3311
//       process.stderr.write(wrapped.stack ?? wrapped.message + EOL)
//       // console.error(wrapped.stack)

//       // config.errorLogger.flush()
//       try {
//         return exitProcess && process.exit(exitCode);
//       } catch (err2) {
//         process.stderr.write(err2 as any);
//       }
//     } else {
//       exitProcess && process.exit(exitCode);
//     }
//   } catch (error: any) {
//     // logger(err.stack)
//     // logger(error.stack)
//     exitProcess && process.exit(1);
//   }
// }