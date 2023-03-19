import { addr, assertIsAddress, assertIsAddressPath, assertIsAddressPathAbsolute, assertIsAddressPathRelative } from '@business-as-code/address'
import {Args, Flags, BaseCommand} from '@business-as-code/core'
import {xfs} from '@business-as-code/fslib'
import { BacError, MessageName } from '../../../../pkg-error/src'

export class WorkspaceInit extends BaseCommand<typeof WorkspaceInit> {

  static description = 'Creates an empty workspace'

  static examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ]

  static flags = {
    config: Flags.string({char: 'c', description: 'Absolute path to a workspace configuration', required: false}),
  }

  static args = {
    path: Args.string({description: 'Absolute/Relative path', required: true}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(WorkspaceInit)

    let workspacePath = addr.parsePath(args.path)
    if (!assertIsAddressPath(workspacePath)) {
      throw new BacError(MessageName.FS_PATH_FORMAT_ERROR, `Path '${args.path}' cannot be parsed as a path`)
    }
    if (assertIsAddressPathRelative(workspacePath)) {
       workspacePath = addr.pathUtils.join(addr.parsePath(process.cwd()), workspacePath)
    }
    if (!assertIsAddressPathAbsolute(workspacePath)) {
      throw new BacError(MessageName.FS_PATH_FORMAT_ERROR, `Path '${workspacePath.original}' must be absolute/relative`)
    }
    if (!(await xfs.existsPromise(workspacePath.address))) {
      const workspacePathParent = addr.pathUtils.dirname(workspacePath)
      if (!(await xfs.existsPromise(workspacePathParent.address))) {
        throw new BacError(MessageName.FS_PATH_FORMAT_ERROR, `Parent path '${workspacePathParent.original}' must be present when creating workspace at '${workspacePath.original}'`)
      }
      await xfs.mkdirpPromise(workspacePath.address)
    }

    // this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
    this.log(`Creating a new workspace at '${workspacePath.original}'`)
  }
}
