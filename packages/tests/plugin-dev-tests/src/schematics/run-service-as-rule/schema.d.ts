// type Config = import('@business-as-code/core').Config

import { Rule } from '@angular-devkit/schematics'
import { ServiceOptions } from '@business-as-code/core'

// export type RepoMap = {
//   // language: 'javascript' | 'rust'
//   // committers: {
//   //   name: string
//   //   email: string
//   //   message: string
//   // }[]
//   // // languageVariant: 'typescript' | 'javascript' | 'rust'
//   // packages: {
//   // },
//   // commits: {
//   //   committer: {
//   //     name: string
//   //     email: string
//   //     message: string
//   //   }
//   // }[]
// };

export interface Schema {
  // rule: Rule,
  cb: <SName extends keyof Services>(options: {
    service: Services[SName]
    serviceName: SName
  }) => Promise<void>
  // }) => ReturnType<TaskExecutor<ServiceExecTaskOptions>>;
  serviceName: SName
  originPath?: string
  initialiseOptions: ServiceOptions<SName>['initialiseOptions']
  // name: string,

  _bacContext: import('@business-as-code/core').Context
}
