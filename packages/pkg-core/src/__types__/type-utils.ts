export function assertIsOk<R, E>(res: Result<R, E>): res is Extract<Result<R, E>, {success: true}> {
  if (res.success === undefined) throw new Error(`assertIsSuccess: res is not valid Result object. res: '${require('util').inspect(res, {showHidden: false, depth: 2, colors: true})}'`)
  return !!res.success
}
export function assertIsResult<R, E>(res: any): res is Result<R, E> {
  if (res?.success !== true && res?.success !== false) throw new Error(`assertIsResult: res is not valid Result object. res: '${require('util').inspect(res, {showHidden: false, depth: 2, colors: true})}'`)
  return true
}


/** poor man's neverthrow - https://tinyurl.com/2xuoxzp5 */
type Ok<Res> = {
  success: true,
  res: Res
}
type Fail<Err> = {
  success: false,
  res: Err
}
export type Result<Res, Err> = Ok<Res> | Fail<Err>
export const ok = <T>(res: T): Ok<T> => {
  return {
    success: true,
    res,
  }
}
export const fail = <T>(res: T): Fail<T> => {
  return {
    success: false,
    res,
  }
}
