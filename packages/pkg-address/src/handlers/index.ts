// more annoying definition linking
import './portable-path-posix-absolute-handler'
import './portable-path-posix-relative-handler'
import './portable-path-windows-absolute-handler'
import './portable-path-windows-relative-handler'
import './portable-path-filename-handler'
import './github-repo-url-handler'
import './github-url-handler'
import './url-handler'
// import './mnt-template-ident-package-handler'
// import './mnt-plugin-ident-package-handler'
// import './ident-package-handler'
import './param-ident-package-handler'
import './param-descriptor-package-handler'
import './param-descriptor-stringified-package-handler'
import './param-ident-stringified-package-handler'
import './template-ident-package-handler'


import {handler as portablePathPosixAbsoluteHandler} from './portable-path-posix-absolute-handler'
import {handler as portablePathPosixRelativeHandler} from './portable-path-posix-relative-handler'
import {handler as portablePathWindowsAbsoluteHandler} from './portable-path-windows-absolute-handler'
import {handler as portablePathWindowsRelativeHandler} from './portable-path-windows-relative-handler'
import {handler as portablePathFilenameHandler} from './portable-path-filename-handler'
import {handler as githubRepoUrlHandler} from './github-repo-url-handler'
import {handler as githubUrlHandler} from './github-url-handler'
import {handler as urlHandler} from './url-handler'
// import {handler as mntTemplateIdentPackageHandler} from './mnt-template-ident-package-handler'
// import {handler as mntPluginIdentPackageHandler} from './mnt-plugin-ident-package-handler'
// import {handler as identPackageHandler} from './ident-package-handler'
import {handler as paramIdentPackageHandler} from './param-ident-package-handler'
import {handler as paramDescriptorPackageHandler} from './param-descriptor-package-handler'
import {handler as paramDescriptorStringifiedPackageHandler} from './param-descriptor-stringified-package-handler'
import {handler as paramIdentStringifiedPackageHandler} from './param-ident-stringified-package-handler'
import {handler as templateIdentPackageHandler} from './template-ident-package-handler'
// import {handler as descriptorPackageHandler} from './descriptor-package-handler'

export const handlers = [
  // mntPluginIdentPackageHandler,
  // mntTemplateIdentPackageHandler,
  // descriptorPackageHandler,
  // identPackageHandler, // default
  paramDescriptorStringifiedPackageHandler,
  paramIdentStringifiedPackageHandler,
  paramDescriptorPackageHandler,
  templateIdentPackageHandler,
  paramIdentPackageHandler, // default
  githubRepoUrlHandler,
  githubUrlHandler,
  urlHandler, // default
  portablePathWindowsAbsoluteHandler, // windows before sibling posix
  portablePathPosixAbsoluteHandler,
  portablePathWindowsRelativeHandler, // windows before sibling posix
  portablePathPosixRelativeHandler,
  portablePathFilenameHandler, // default
]