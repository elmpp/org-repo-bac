import { AddressPathAbsolute } from "@business-as-code/address";
import { Context } from "./index";
import { SetOptional, ValueOf } from "./util";

/** instance types of all loaded services */
export type ServiceMap = {
  [ServiceName in keyof Bac.Services as Bac.Services[ServiceName] extends {
    as: any;
  }
    ? Bac.Services[ServiceName]["as"]
    : ServiceName]: [Bac.Services[ServiceName]["insType"]];
  // [ServiceName in keyof Bac.Services]: Bac.Services[ServiceName]["insType"];
};

/** instance types of all loaded services */
export type ServiceStaticMap = {
  [ServiceName in keyof Bac.Services as Bac.Services[ServiceName] extends {
    as: any;
  }
    ? Bac.Services[ServiceName]["as"]
    : ServiceName]: [Bac.Services[ServiceName]["staticType"]];
  // [ServiceName in keyof Bac.Services]: Bac.Services[ServiceName]["staticType"];
};

export type ServiceInitialiseCommonOptions = {
  context: Context;
  /** service instances are recreated when targeting different directories */
  workspacePath: AddressPathAbsolute;
  /** relative path that is joined to destinationPath. Useful for cwd() of clients, e.g. git, pwd */
  workingPath: string;
};
export type ServiceInitialiseOptions<SName extends keyof ServiceMap> =
  Parameters<ServiceStaticMap[SName][number]["initialise"]>[0];
export type ServiceInitialiseLiteOptions<SName extends keyof ServiceMap> = SetOptional<
  Parameters<ServiceStaticMap[SName][number]["initialise"]>[0],
  "workspacePath"
>; // workspacePath found inside the context
// export type ServiceInitialiseOptions = { context: Context; workingPath: AddressPathRelative }; // workingPath must be runtime value for services

export type ServiceStaticInterface = {
  title: string;
  as?: string;
  initialise(
    options: ServiceInitialiseCommonOptions
  ): Promise<ValueOf<ServiceMap>[number] | undefined>;
  // initialise<T extends {new (...args: any[]): T}>(options: ContextPrivate): Promise<T>;
  // new (...args: any[]): any;
};
