import { addr, assertIsAddressPath, assertIsAddressPathAbsolute, assertIsAddressPathRelative } from '@business-as-code/address'
import { Args, BaseCommand, Flags, _Interfaces } from '@business-as-code/core'
import { xfs } from '@business-as-code/fslib'
import { BacError, MessageName } from '../../../../pkg-error/src'

export class WorkspaceInit extends BaseCommand<typeof WorkspaceInit> {

  static override description = 'Creates an empty workspace'

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ]

  static override flags = {
    config: Flags.string({char: 'c', description: 'Absolute path to a workspace configuration', required: false}),
  }

  static override args = {
    path: Args.string({char: 'd', description: 'Absolute/Relative path', required: false}),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(WorkspaceInit)

    let workspacePath = addr.parsePath(args.path!)
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
