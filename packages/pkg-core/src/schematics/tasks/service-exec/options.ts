import {
  Context,
  ServiceInitialiseOptions,
  Services,
  ServicesStatic,
} from "../../../__types__";

export const ServiceExecName = "service-exec";

export interface ServiceExecTaskFactoryOptions {
  rootDirectory: string;
  // context: Context // supply at usage task level below
}

// export interface Options<SName extends keyof ServicesStatic> {
//   cb: (options: {
//     service: Services[SName];
//     serviceName: SName;
//   }) => Promise<any>;
//   // }) => ReturnType<TaskExecutor<ServiceExecTaskOptions>>;
//   serviceName: SName;
//   NEED TO SORT THESE OPTIONS OUT (INFER) + FINISH UP THE SCHEMATICS-SERVICE::RUNRULEEXTERNAL METHOD
//   serviceOptions: ServiceInitialiseOptions;
//   // workingPath: AddressPathRelative
//   context: Context;
// }

export type ServiceExecTaskOptions<SName extends keyof Services> =
  Options<SName>;
// export interface ServiceExecTaskOptions {
//   // workingDirectory: string;
//   options: Options<keyof ServicesStatic>; // must be optional due to TaskExecutor having optional params
//   // context: Context
//   // commit?: boolean;
//   // message?: string;
//   // authorName?: string;
//   // authorEmail?: string;
// }
