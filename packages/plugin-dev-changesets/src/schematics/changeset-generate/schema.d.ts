export interface Schema {
  // destinationPath: string,
  // name: string,
  config: {
    message: string
    changes: Record<string, 'major' | 'minor' | 'patch'>
  }
  _bacContext: import('@business-as-code/core').Context
}
