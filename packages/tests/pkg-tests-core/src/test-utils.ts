import assert from "assert"
import path from 'path'


export function getCurrentTestFilenameSanitised(strict: false): string | undefined
export function getCurrentTestFilenameSanitised(strict?: boolean): string
export function getCurrentTestFilenameSanitised(strict: boolean = true): string | undefined {
  if (!!!expect.getState().currentTestName && !strict) return
  assert(!!expect.getState().testPath)
  return sanitise(path.basename(expect.getState().testPath!))
  // return (expect.getState().currentTestName ?? testEnvVars?.debugId ?? 'setupFilesAfterEnv')
}
export function getCurrentTestNameSanitised(strict: false): string | undefined
export function getCurrentTestNameSanitised(strict?: boolean): string
export function getCurrentTestNameSanitised(strict: boolean = true): string | undefined {
  if (!!!expect.getState().currentTestName && !strict) return
  assert(!!expect.getState().currentTestName)
  return sanitise(expect.getState().currentTestName!)
  // return (expect.getState().currentTestName ?? testEnvVars?.debugId ?? 'setupFilesAfterEnv')
}
export const sanitise = (str: string): string => str.replace(/['"~><]/, '').replace(/[\s;+/\\]+/g, '_')


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
