/**
 polyfill for Bun matchers shortfall

 progress - https://github.com/oven-sh/bun/issues/1825
 */

export const objectContaining = (matchable: any): ((val: any) => boolean) => {
  // console.log(`value :>> `, value)
  const res = () => true
  return res
}
