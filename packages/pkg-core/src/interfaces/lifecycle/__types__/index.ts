import { AsyncHook, Hook } from "tapable";

export type InferHookParams<T extends Hook<any, any, any>> = T extends Hook<
  infer T,
  infer R,
  infer AdditionalOptions
>
  ? T
  : never;
export type InferHookReturn<T extends Hook<any, any, any>> = T extends AsyncHook<
  infer T,
  infer R,
  infer AdditionalOptions
>
  ? R
  : never;
