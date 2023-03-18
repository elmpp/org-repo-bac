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
