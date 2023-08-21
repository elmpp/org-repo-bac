import { BacErrorWrapper, MessageName } from '@business-as-code/error'
import JSON5 from 'json5'
import os from 'os'
import { stringifyDeterministic } from './hash-utils'

export type JsonSerialisable = Record<string, any>

export const JSONNormalize = (content: string, prettify = false): string => JSON.stringify(JSONParse(content), null, prettify ? 2 : 0)
export const JSONParse = (content: string): JsonSerialisable => {
  try {
    return JSON5.parse(content)
  } catch (err) {
    throw new BacErrorWrapper(MessageName.UNNAMED, `Caught error when parsing content \n'${content}'`, err as Error)
  }
}
export const JSONStringify = (content: JsonSerialisable, prettify = false): string => {
  return JSON.stringify(content, null, prettify ? 2 : 0)
}

export function trimFileContent(contents: string): string {
  return contents.replace(/^\s+|\s+$/g, '')
}

export function normalizeFileContent(contents: string): string {
  return `${trimFileContent(contents)}${os.EOL}`
}

export function determinize(content: any): any {
  return JSON.parse(stringifyDeterministic(content))
}
