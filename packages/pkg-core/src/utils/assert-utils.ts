export function assertNonEmpty<
  T extends Record<PropertyKey, any> | Record<never, any>
>(obj: T): asserts obj is Extract<T, Record<PropertyKey, any>> {
  if (!Object.keys(obj).length) {
    throw new Error(
      `Object expected to be non-empty. Supplied: '${JSON.stringify(obj)}'`
    )
  }
}

export function assertUnreachable(_x: never): never {
  throw new Error(
    `Unreachable codepath encountered. See previous stacktrace entry. Value: '${JSON.stringify(_x)}'`
  )
}
