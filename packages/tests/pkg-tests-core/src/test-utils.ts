import {fsUtils} from '@business-as-code/core'
import assert from "assert"
import path from 'path'
import { expect, test } from "bun:test"
import * as bun from 'bun'
// import * as bunbun from "bun"
// import * as bunbunTest from "bun:test"


export function getCurrentTestFilenameSanitised(): string {
// export function getCurrentTestFilenameSanitised(strict: false): string | undefined
// export function getCurrentTestFilenameSanitised(strict?: boolean): string
// export function getCurrentTestFilenameSanitised(strict: boolean = true): string | undefined {
  // console.log(`bunbunTest :>> `, require('util').inspect(bunbunTest, {showHidden: false, depth: undefined, colors: true}))
  // console.log(`import.meta.dir :>> `, import.meta.dir)
  // console.log(`test :>> `, require('util').inspect(test, {showHidden: false, depth: undefined, colors: true}))

  return path.basename(bun.main)

  // if (!!!expect.getState().currentTestName && !strict) return
  // assert(!!expect.getState().testPath)
  // return fsUtils.sanitise(path.basename(expect.getState().testPath!))
  // return (expect.getState().currentTestName ?? testEnvVars?.debugId ?? 'setupFilesAfterEnv')
}
// export function getCurrentTestNameSanitised(strict: false): string | undefined
// export function getCurrentTestNameSanitised(strict?: boolean): string
// export function getCurrentTestNameSanitised(strict: boolean = true): string | undefined {
export function getCurrentTestNameSanitised(): never {
  throw new Error('impossible in Bun')

  // if (!!!expect.getState().currentTestName && !strict) return
  // assert(!!expect.getState().currentTestName)
  // return fsUtils.sanitise(expect.getState().currentTestName!)
  // return (expect.getState().currentTestName ?? testEnvVars?.debugId ?? 'setupFilesAfterEnv')
}


// export function expectIsOk<T extends Result<any, any>>(res: T): asserts res is Extract<T, {success: true}> {
//   if (assertIsOk(res)) {
//     return
//   }
//   // fail(new Error(`res is not successful`)) // can't use jest fail() - https://tinyurl.com/2hu8zcpo
//   throw new Error(`Expected res to be successful. '${JSON.stringify(res)}'`)
// }
// export function expectIsFail<T extends Result<any, any>>(res: T): asserts res is Extract<T, {success: false}> {
//   if (!assertIsOk(res)) {
//     return
//   }
//   // fail(new Error(`res is not successful`)) // can't use jest fail() - https://tinyurl.com/2hu8zcpo
//   throw new Error(`Expected res to be fail. '${JSON.stringify(res)}'`)
// }
