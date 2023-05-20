export interface Schema {
  // destinationPath: string,
  name: string,
  configPath?: string,
  cliVersion?: string
  registry?: string
  _bacContext: import('@business-as-code/core').Context
}