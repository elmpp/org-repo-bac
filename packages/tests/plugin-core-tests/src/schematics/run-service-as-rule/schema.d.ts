// type Config = import('@business-as-code/core').Config

import { Rule } from '@angular-devkit/schematics'

export type RepoMap = {
  // language: 'javascript' | 'rust'
  // committers: {
  //   name: string
  //   email: string
  //   message: string
  // }[]
  // // languageVariant: 'typescript' | 'javascript' | 'rust'
  // packages: {

  // },
  // commits: {
  //   committer: {
  //     name: string
  //     email: string
  //     message: string
  //   }

  // }[]
}

export interface Schema {
  // rule: Rule,
  cb: <SName extends keyof Services>(options: {
    service: Services[SName];
    serviceName: SName;
  }) => Promise<void>;
  // }) => ReturnType<TaskExecutor<ServiceExecTaskOptions>>;
  serviceName: SName;
  originPath?: string
  initialisationOptions: IsEmptyObject<Omit<Parameters<ServicesStatic[SName]['initialise']>[0], keyof ServiceInitialiseOptions>> extends true ? Record<never, any> : Omit<Parameters<ServicesStatic[SName]['initialise']>[0], keyof ServiceInitialiseOptions>
  // name: string,

  _bacContext: import('@business-as-code/core').Context
}