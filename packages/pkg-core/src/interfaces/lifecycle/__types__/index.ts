import { AsyncHook, Hook } from "tapable";
import { Context } from "../../../__types__";
import { AddressPathAbsolute } from "@business-as-code/address";

export type CommonExecuteOptions = {
  context: Context;
  workspacePath: AddressPathAbsolute;
  workingPath: string,
}
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
