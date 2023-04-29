export function assertNonEmpty<
  T extends Record<PropertyKey, any> | Record<never, any>
>(obj: T): asserts obj is Extract<T, Record<PropertyKey, any>> {
  if (!Object.keys(obj).length) {
    throw new Error(
      `Object expected to be non-empty. Supplied: '${JSON.stringify(obj)}'`
    );
  }
}
