
export function arrayIntersection(arr1: unknown[], arr2: unknown[]): {matched: unknown[], unmatched: unknown[]} {
  const matchedArray = arr1.filter(value => arr2.includes(value))
  const unmatchedArray = arr1.filter(value => !arr2.includes(value))
  return {
    matched: matchedArray,
    unmatched: unmatchedArray,
  }
}