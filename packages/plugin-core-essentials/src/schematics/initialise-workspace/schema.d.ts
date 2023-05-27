export interface Schema {
  // destinationPath: string,
  name: string,
  configPath?: string,
  cliVersion?: string
  cliRegistry?: string
  _bacContext: import('@business-as-code/core').Context
}