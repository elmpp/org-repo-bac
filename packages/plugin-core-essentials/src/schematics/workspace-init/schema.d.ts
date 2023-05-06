export interface Schema {
  // destinationPath: string,
  name: string,
  configPath?: string,
  cliVersion?: string
  cliPmRegistry?: string
  _bacContext: import('@business-as-code/core').Context
}