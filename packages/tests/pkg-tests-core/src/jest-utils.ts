// export type PackageStatus = {
//   name: AddressPackage
//   creationDate: Date
//   worktree?: AddressPackage
//   path: PortablePath
//   archived: boolean
//   dependents: AddressPackage[]
//   ancestors: AddressPackage[]
//   upstream?: UpstreamStatusUnion
//   // upstreamDuplex?: PackageUpstreamPushStatus
//   // upstreamForked?: PackageUpstreamPushStatus
//   // splittable?: PackageUpstreamPushStatus
// }

import { virtualFs } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import { Tree } from "@angular-devkit/schematics";
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import {
  configSchema,
  constants,
  fsUtils,
  formatUtils,
  Outputs,
  stringUtils,
} from "@business-as-code/core";
import { assertIsError } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";
import os from "os";
import { TestEnvVars } from "./test-env";
import assert from "assert";
// @ts-ignore
import expectMatchers from "expect/build/matchers";
import fs from "fs";
import path from "path";
import { HostCreateLazyTree } from "./schematics/schematics-host-lazy-tree";

// const REGEX_STRIP_ANSI_ESCAPE_CODES = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

export const escapeForRegexp = (str: string) =>
  str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); // https://tinyurl.com/2ey6wbqk

type Options = {
  outputs: Outputs;
  //  mntExec: MntExecService
  /** Guaranteed to be the path to ultimate destination content. You should not be asserting on content outside of here as this may be subject to different cache mechanisms possibly */
  //  destinationPath: AddressPathAbsolute
  // /** The base path where this testing is happening. Will be same as TEST_CACHE_PATH */
  // enclosingPath: AddressPathAbsolute
  //  context: Context
  testEnvVars: TestEnvVars;
  tree: Tree;
  exitCode: number;

  //  /** as returned from setupFunction */
  //  projectCwd: AddressPathAbsolute
  //  // /** the same projectDefinition as supplied through makeTestEnv */
  //  // projectDefinition: ProjectDefinition
  //  // /** Calling this will roll back to post-scaffold - ideal for secondary mntExec within implement phase */
  //  // reset: () => Promise<void>
};

export function createAssertFail(err: string | Error) {
  return Object.assign(assertIsError(err) ? err : new Error(err), {
    matcherResult: () => err,
    pass: false,
  });
}
/** node assert does not break execution path */
export function assertFail(logicTest: any, err: string | Error) {
  if (!!!logicTest) {
    throw createAssertFail(err);
  }
}
/** Jest 27+ includes jest-circus as a test runner which does not have fail() - https://tinyurl.com/2hu8zcpo */
export function fail(err: string | Error) {
  throw createAssertFail(err);
}

// type RunPropsAnchored = RunFunctionProps & {scaffoldPath: PortablePath}
export class ExpectUtil {
  options: Options;

  constructor(options: Options) {
    // this.options = {...runProps, scaffoldPath: normalizePath(ppath.join(runProps.projectScaffoldPath, scaffoldPath))}
    this.options = options;

    // expect(options.testEnvVars.checkoutMntCwd.original).toMatch(new RegExp('/mnt-pkg-cli/src/bin$'))
    expect(options.testEnvVars.workspacePath.originalNormalized).not.toMatch(
      new RegExp("/content$")
    ); // ensure envs does not pass the cache subdir through
    expect(
      options.testEnvVars.workspacePath.originalNormalized.match(
        new RegExp(
          "packages/tests/packages/tests-fixtures/test-env/tests/[^]+/"
        )
      )
    ); // i.e. not the cache path
  }

  createStdout(): ExpectText {
    return new ExpectText(this.options.outputs.stdout, this.options);
  }
  createStderr(): ExpectText {
    return new ExpectText(this.options.outputs.stderr, this.options);
  }
  createText(text: string): ExpectText {
    return new ExpectText(text, this.options);
  }
  createFs(): ExpectFs & Tree {
    return ExpectFs.fromTree(this.options, this.options.tree);
  }
  createConfig(): ExpectConfig {
    return new ExpectConfig(this.createFs(), this.options);
  }
  // createBootstrap(): ExpectBootstrap {
  //   return new ExpectBootstrap(this.options)
  // }
  // createRecipe(recipe: string): ExpectRecipe {
  //   return new ExpectRecipe(recipe, this.options)
  // }
}

/** assertions on the workspace config */
class ExpectConfig {
  options: Options;
  expectFs: ExpectFs;
  /** @internal - do not use!! */
  _tmpResolvablePath: AddressPathAbsolute;

  constructor(expectFs: ExpectFs, options: Options) {
    this.options = options;
    this.expectFs = expectFs;
    this._tmpResolvablePath = fsUtils.tmpResolvablePath;
  }

  // protected async importConfig() {

  //   const sourcePath = addr.pathUtils.join(this.options.testEnvVars.workspacePath, addr.parsePath(constants.RC_FILENAME))
  //   xfs.copyFileSync(sourcePath.address, this._tmpResolvablePath.address)

  //   const configModule = require(`../etc/resolvable-tmp/${constants.RC_FILENAME}`)

  //   // // console.log(`configModule :>> `, configModule)

  //   assert(configModule.config)
  //   return configModule.config

  //   // return fsUtils.loadConfig(this._tmpResolvablePath)
  // }

  async isValid(): Promise<ExpectConfig> {
    const config = fsUtils.loadConfig(this.options.testEnvVars.workspacePath);
    configSchema.parse(config);
    return this;
  }

  get expectText() {
    const fileEntry = this.expectFs.get(constants.RC_FILENAME);
    assert(fileEntry);
    return new ExpectText(fileEntry.content.toString(), this.options);
  }
}

/** small wrapper around the tree */
class ExpectFs extends HostCreateLazyTree {
  // class ExpectFs extends HostTree {
  options: Options;

  // constructor(options: Options, protected override _backend: virtualFs.ReadonlyHost<{}> = new virtualFs.Empty()) {
  constructor(options: Options) {
    const _backend = new virtualFs.ScopedHost(
      new NodeJsSyncHost(),
      options.testEnvVars.workspacePath.original as any
    );
    super(_backend);
    this.options = options;
  }

  static fromTree(options: Options, tree: Tree): ExpectFs {
    // return new ExpectFs(tree._backend, options)
    const nextIns = new ExpectFs(options);
    nextIns.merge(tree); // may not actually be required here - driven purely from fs?
    return nextIns;
  }

  existsSync(filePath: string): boolean {
    const filePathAbs = path.join(
      this.options.testEnvVars.workspacePath.original,
      filePath
    );
    // console.log(`:>> DDDDDDDDDDDDDDDDDDDD`, filePath, filePathAbs, fs.existsSync(filePath));
    // console.log(`this.options.tree :>> `, this.options.tree)
    return this.options.tree.exists(filePath) || fs.existsSync(filePathAbs);
  }

  // debug() {
  //   return {
  //     files: schematicTestUtils.getFiles(this.options.tree),
  //   }
  // }
}

class ExpectText {
  options: Options;
  outputRaw: string;
  outputLines: string[];
  outputLinesStripped: string[];
  debugFolderPath: AddressPathAbsolute;

  constructor(output: string, options: Options) {
    this.options = options;
    this.outputRaw = output;
    this.outputLines = output.trimRight().split(os.EOL);
    this.outputLinesStripped = stringUtils
      .stripAnsi(output.trimRight())
      .split(os.EOL);
    this.debugFolderPath = addr.parsePPath(
      xfs.mktempSync()
      // xfs.mktempSync({
      //   persist: true,
      //   foldername: 'expect_out',
      // })
    ) as AddressPathAbsolute;
  }

  // /** saves state to a temp file for better and more concise debugging */
  // async persistToTmp(): Promise<AddressPathAbsolute> {
  //   const filename = addr.parsePath(`${Math.ceil(Math.random() * 0x100000000)
  //     .toString(16)
  //     .padStart(8, `0`)}`)
  //   const filePath = addr.pathUtils.join(this.debugFolderPath, filename) as AddressPathAbsolute
  //   await xfs.writeFilePromise(filePath.address, this.outputRaw, {encoding: 'utf8'})
  //   return filePath
  // }
  /** saves state to a temp file for better and more concise debugging */
  persistToTmp(content: string): AddressPathAbsolute {
    const filename = addr.parsePath(
      `${Math.ceil(Math.random() * 0x100000000)
        .toString(16)
        .padStart(8, `0`)}`
    );
    const filePath = addr.pathUtils.join(
      this.debugFolderPath,
      filename
    ) as AddressPathAbsolute;
    xfs.writeFileSync(filePath.address, content, { encoding: "utf8" });
    return filePath;
  }

  equals(text: string) {
    expect(text).toEqual(this.outputRaw);
  }

  asJson({ json5 = false }: { json5?: boolean } = {}) {
    let res: any;
    if (json5) {
      res = formatUtils.JSONParse(this.outputRaw);
    } else {
      res = JSON.parse(this.outputRaw);
    }
    expect(res).toBeTruthy();
    return res
  }

  /**
   @var occurrences:
      -1: non-zero
      Math.Infinity: all matching
      0..n: exact number
   */
  lineContainsString({
    match,
    messageNameMatch,
    occurrences = 0,
    stripAnsi = true,
  }: // formattingMatch,
  {
    match: string | RegExp;
    messageNameMatch?: number;
    occurrences: number;
    stripAnsi?: boolean;
    // formattingMatch?: {nodeProcessIdx: number; virtualProcessIdx: number; pkg?: {relativeCwd: string}}
  }): ExpectText {
    // const escapedSearchStr = escapeForRegexp(match)

    const getRegExpForMatch = (match: string | RegExp): RegExp => {
      if (typeof match === "object") return match;
      return new RegExp(escapeForRegexp(match), "i");
    };
    const escapedMessageRegex = new RegExp(`MNT[0]+${messageNameMatch}`);
    const matchMatcher = getRegExpForMatch(match);

    const [found, missed] = this.getOutputLines(stripAnsi).reduce<
      [string[], string[]]
    >(
      (acc, l) => {
        // console.log(`l,  :>> `, l, escapedMessageRegex)
        let matchRes = l.match(matchMatcher);
        if (messageNameMatch) {
          matchRes = matchRes && l.match(escapedMessageRegex);
        }
        // if (formattingMatch) {
        //   const formatDelimiter = '\u2800'
        //   const formattingMatcher = new RegExp(
        //     `^${` `.repeat(formattingMatch.virtualProcessIdx * 2)}${
        //       formattingMatch.pkg ? `\\\[${formattingMatch.pkg.relativeCwd}\\\]` : ''
        //     }${formattingMatch.nodeProcessIdx},${
        //       formattingMatch.virtualProcessIdx
        //     }(:? \\\[[^\\\]]+\\\])?${formatDelimiter}`
        //   )
        //   matchRes = matchRes && l.match(formattingMatcher)
        // }

        if (matchRes) {
          acc[0].push(l);
        } else {
          acc[1].push(l);
        }
        return acc;

        // return matchRes

        // ? // ? l.match(new RegExp(escapedSearchStr, 'i')) && l.match(messageName)
        //   l.match(getRegExpForMatch(match)) && l.match(escapedMessageRegex)
        // : l.match(getRegExpForMatch(match))
      },
      [[], []]
    );

    let failMessage: string;

    if (occurrences === Infinity) {
      if (found.length !== this.getOutputLines(stripAnsi).length) {
        failMessage = `expectOut#lineContainsString: Expected '${
          this.getOutputLines(stripAnsi).length
        }' (supplied=Infinity) occurrences of '${match}'. MessageNameMatch: '${
          messageNameMatch ?? "-"
        }'. MatchMatcher: '${matchMatcher}'. Matched '${
          found.length
        }'. Missed '${missed.length}'`;
        // expect(true).toEqual(true) // keep assertions number consistent
      } else {
        // console.log(`found :>> `, found)
        // console.log(`missed :>> `, missed)
        // throw createAssertFail(
        //   `expectOut#lineContainsString: Expected '${this.outputLines.length}' (supplied=Infinity) occurrences of '${match}'. FormattingMatch: '${[formattingMatch?.nodeProcessIdx ?? '-', formattingMatch?.virtualProcessIdx ?? '-', formattingMatch?.pkg ?? '-']}'. MessageNameMatch: '${messageNameMatch ?? '-'}'. MatchMatcher: '${matchMatcher}'. Matched '${found.length}'. Missed '${missed.length}' Content : '${this.outputRaw}'`
        // )
        // failMessage = `expectOut#lineContainsString: Expected '${this.outputLines.length}' (supplied=Infinity) occurrences of '${match}'. FormattingMatch: '${[formattingMatch?.nodeProcessIdx ?? '-', formattingMatch?.virtualProcessIdx ?? '-', formattingMatch?.pkg ?? '-']}'. MessageNameMatch: '${messageNameMatch ?? '-'}'. MatchMatcher: '${matchMatcher}'. Matched '${found.length}'. Missed '${missed.length}' Content : '${this.outputRaw}'`
      }
      return this;
    }
    if (occurrences === -1) {
      if (found.length === 0) {
        // console.log(`found :>> `, found)
        // console.log(`missed :>> `, missed)
        // throw createAssertFail(
        //   `expectOut#lineContainsString: Expected a non-zero (supplied=-1) occurrences of '${match}'. FormattingMatch: '${[formattingMatch?.nodeProcessIdx ?? '-', formattingMatch?.virtualProcessIdx ?? '-', formattingMatch?.pkg ?? '-']}'. MessageNameMatch: '${messageNameMatch ?? '-'}'. MatchMatcher: '${matchMatcher}'. Matched '${found.length}'. Missed '${missed.length}' Content : '${this.outputRaw}'`
        // )
        failMessage = `expectOut#lineContainsString: Expected a non-zero (supplied=-1) occurrences of '${match}'. MessageNameMatch: '${
          messageNameMatch ?? "-"
        }'. MatchMatcher: '${matchMatcher}'. Matched '${
          found.length
        }'. Missed '${missed.length}'.`;
      } else {
        // expect(true).toEqual(true) // keep assertions number consistent
      }
      return this;
    }

    if (occurrences !== found.length) {
      // console.error(`expectOut#lineContainsString: Expected '${occurrences}' occurrences of '${match}'. Matched '${found.length}'. Missed '${missed.length}' Content : '${this.outputLines.join(`\n`)}`)
      // expect(`${messageNameMatch ? `${escapedMessageRegex} .* ` : ''}${match}`).toEqual('<--- unmatched')

      // console.log(`found :>> `, found)
      // console.log(`missed :>> `, missed)
      // throw createAssertFail(
      //   `expectOut#lineContainsString: Expected '${occurrences}' occurrences of '${match}'. FormattingMatch: '${[formattingMatch?.nodeProcessIdx ?? '-', formattingMatch?.virtualProcessIdx ?? '-', formattingMatch?.pkg ?? '-']}'. MessageNameMatch: '${messageNameMatch ?? '-'}'. MatchMatcher: '${matchMatcher}'. Matched '${found.length}'. Missed '${missed.length}' Content : '${this.outputRaw}'`
      // )
      failMessage = `expectOut#lineContainsString: Expected '${occurrences}' occurrences of '${match}'. MessageNameMatch: '${
        messageNameMatch ?? "-"
      }'. MatchMatcher: '${matchMatcher}'. Matched '${found.length}'. Missed '${
        missed.length
      }'.`;
    } else {
      // expect(true).toEqual(true) // keep assertions number consistent
      // if (occurrences !== undefined) {
      //   expect(found).toHaveLength(occurrences)
      // }
    }
    // if (!found) {
    //   console.log(`unmatched content. Expected '${match}' :>> `, this.outputLines.join(`\n`))
    //   expect(`${messageNameMatch ? `${escapedMessageRegex} .* ` : ''}${escapedSearchStr}`).toEqual('<--- unmatched')
    // } else {
    //   expect(true).toEqual(true) // keep assertions number consistent
    //   if (occurrences !== undefined) {
    //     expect(found).toHaveLength(occurrences)
    //   }
    // }
    // console.log(`this.outputLines.slice(0, -10) :>> `, this.outputLines.slice(0, -10))

    if (failMessage!) {
      const debugPath = this.persistToTmp(
        this.getOutputLines(stripAnsi).join(os.EOL)
      );
      throw createAssertFail(
        `${failMessage}. DestinationPath: '${this.options.testEnvVars.workspacePath.original}'. Content: '(${debugPath.original})'`
      );
    }
    expect(true).toEqual(true); // keep assertions number consistent
    return this;
  }

  protected getOutputLines(stripAnsi?: boolean): string[] {
    return stripAnsi ? this.outputLinesStripped : this.outputLines;
  }

  // /**
  //  checks the contained lines have been formatted correctly according to supplied parameters. Checks the first and last lines as other
  //  subProcesses may be contained
  //  */
  // hasFormatting({
  //   nodeProcessIdx,
  //   virtualProcessIdx,
  //   pkg,
  //   matchDescendentProcessLines,
  // }: {
  //   nodeProcessIdx: number
  //   virtualProcessIdx?: number
  //   pkg?: {relativeCwd: string}
  //   matchDescendentProcessLines?: boolean
  // }) {
  //   const formatDelimiter = '\u2800'
  //   const indent = virtualProcessIdx ? ` `.repeat(virtualProcessIdx * 2) : '\\\s*'
  //   const matcher = new RegExp(
  //     `^${indent}${
  //       pkg ? `\\\[${pkg.relativeCwd}\\\]` : ''
  //     }${nodeProcessIdx},${virtualProcessIdx ?? '[0-9]+'}(:? \\\[[^\\\]]+\\\])?${formatDelimiter}`
  //   )

  //   // console.log(`this.outputLines :>> `, this.outputLines[0], this.outputLines[this.outputLines.length-1])

  //   if (!matchDescendentProcessLines) {
  //     if (!this.outputLines[0].match(matcher) || !this.outputLines[this.outputLines.length - 1].match(matcher)) {
  //       return assertFail(
  //         false,
  //         `jest-utils#hasFormatting failed. Matcher: '${matcher}'. MatchAllLines: '${!!matchDescendentProcessLines}'. Unmatched content: '(${
  //           this.persistToTmp().original
  //         })'`
  //       )
  //     }
  //   }
  //   else {

  //     const nonBookendedLines = this.outputLines.slice(1, -1)
  //     for (const line of nonBookendedLines) {
  //       if (!line.match(matcher)) {
  //         return assertFail(
  //           false,
  //           `jest-utils#hasFormatting failed. Matcher: '${matcher}'. MatchAllLines: '${!!matchDescendentProcessLines}'. Unmatched content: '(${
  //             this.persistToTmp(nonBookendedLines.join(os.EOL)).original
  //           })'`
  //         )
  //       }
  //     }
  //   }
  // }

  // /**
  //  returns an ExpectOut with lines that occurred during for the given subprocess. Does not handle nested subprocess of also-matching debugId
  //  */
  // getSubProcess({
  //   debugIdMatch,
  //   escapeDebugIdMatch = true,
  //   strict = true,
  // }: {
  //   debugIdMatch: string
  //   escapeDebugIdMatch?: boolean
  //   strict?: boolean
  // }): ExpectOut | undefined {
  //   const startSubProcessMsg = `Configuration#createSubProcess: subProcess created. DebugId: '`
  //   const closeSubProcessMsg = `Configuration#closeSubProcess: subProcess closing. DebugId: '`
  //   const debugIdMatchString = escapeDebugIdMatch ? escapeForRegexp(debugIdMatch) : debugIdMatch
  //   let startMatcher = new RegExp(`${startSubProcessMsg}${debugIdMatchString}`, 'i')
  //   let closeMatcher = new RegExp(`${closeSubProcessMsg}${debugIdMatchString}`, 'i')

  //   const startIdx = this.outputLines.findIndex((l) => l.match(startMatcher))
  //   if (startIdx === -1) {
  //     if (strict) {
  //       assertFail(
  //         false,
  //         `jest-utils#getSubProcess failed. Matcher: '${startMatcher}'. Unmatched content: '(${
  //           this.persistToTmp().original
  //         })'`
  //       )
  //     }
  //     // console.log(`jest-utils#getSubProcess fail: this.outputLines.slice(0, 5) :>> `, this.outputLines.slice(0, 5))
  //     return
  //   }
  //   let outputLines = this.outputLines.slice(startIdx)
  //   const closeIdx = outputLines.findIndex((l) => l.match(closeMatcher))
  //   if (closeIdx === -1) {
  //     if (strict) {
  //       assertFail(
  //         false,
  //         `jest-utils#getSubProcess failed. Matcher: '${closeMatcher}'. Unmatched content: '(${
  //           this.persistToTmp().original
  //         })'`
  //       )
  //     }
  //     return
  //     // console.log(`jest-utils#getSubProcess fail: this.outputLines.slice(0, 5) :>> `, this.outputLines.slice(0, 5))
  //     // console.log(`jest-utils#getSubProcess fail this.outputLines.slice(-5) :>> `, this.outputLines.slice(-5))
  //     // return
  //   }
  //   outputLines = outputLines.slice(0, closeIdx + 1)

  //   // if (closeIdx !== undefined) {
  //   //   outputLines = outputLines.slice(0, closeIdx)
  //   // }
  //   return new ExpectOut(outputLines.join(os.EOL), this.options)
  // }
}

type JestSyncExpectationResult = {
  pass: boolean;
  message: () => string;
};
(globalThis as any)?.expect &&
  expect.extend({
    arrayContainingObjectProperty<P extends string | string[]>(
      received: any[],
      propertyPath: P,
      value: any | any[]
    ): JestSyncExpectationResult {
      if (!Array.isArray(value)) value = [];

      const doMatchForValue = (value: any) => {
        return received.some((aReceived) => {
          const match = expectMatchers.toHaveProperty(
            aReceived,
            propertyPath,
            value
          ) as JestSyncExpectationResult;
          return match.pass;
        });
      };

      for (const aValue of value) {
        if (!doMatchForValue(aValue))
          return {
            pass: false,
            message: () =>
              `Array does not contain object with property: '${propertyPath}' and value: '${aValue}'`,
          };
      }

      return {
        pass: true,
        message: () =>
          `Array matches for all values with property '${propertyPath}'`,
      };
    },
  });

declare global {
  namespace jest {
    // @ts-ignore
    interface Matchers<R> {
      arrayContainingObjectProperty<P extends string | string[]>(
        propertyPath: P,
        value: any
      ): R;
    }
  }
}
