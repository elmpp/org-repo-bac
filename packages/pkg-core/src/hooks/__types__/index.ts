import { AsyncHook } from '..'

export type InferAsyncHookOptions<T extends AsyncHook<any, any, any>> =
  T extends AsyncHook<infer T, infer R, infer AdditionalOptions> ? T : never
export type InferAsyncHookReturn<T extends AsyncHook<any, any, any>> =
  T extends AsyncHook<infer T, infer R, infer AdditionalOptions> ? R : never
