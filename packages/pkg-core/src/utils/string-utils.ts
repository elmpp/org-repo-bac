/** BOM = Byte Order Mark - Wikipedia https://tinyurl.com/cx6ujjy */
export function stripBOM(content: string) {
  if (content.charCodeAt(0) === 0xfeff) {
    return content.slice(1)
  } else {
    return content
  }
}

export function stripClearScreen(content: string) {
  return content.replace(/^\u{001b}\[2K\u{001b}\[1G/gu, '')
}

/**
 Ansi escape codes removal
  - strip-ansi GH: https://tinyurl.com/2kw2cdal
  - ansi-regex GH - https://tinyurl.com/2j3wspy2
 */
export function stripAnsi(content: string) {
  const ANSI_REGEX = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))'
	].join('|')
  return content.replace(new RegExp(ANSI_REGEX, 'g'), '')
}

export function arrayIntersection(arr1: unknown[], arr2: unknown[]): {matched: unknown[], unmatched: unknown[]} {
  const matchedArray = arr1.filter(value => arr2.includes(value))
  const unmatchedArray = arr1.filter(value => !arr2.includes(value))
  return {
    matched: matchedArray,
    unmatched: unmatchedArray,
  }
}
