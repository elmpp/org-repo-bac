import {
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
  execUtils as _execUtils
} from '@business-as-code/core'

/**

 */
export default class ReleaseSnapshot extends BaseCommand<
  typeof ReleaseSnapshot
> {
  static override description = 'Creates a local snapshot release'

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`
  ]

  static override flags = {
    workspacePath: Oclif.Flags.directory({
      exists: true,
      description: 'Workspace name',
      required: false
    }),
    // query: Oclif.Flags.string({
    //   description: "Query to select snapshotted projects",
    //   required: false,
    //   default: "projectType=library || projectType=application",
    // }),
    message: Oclif.Flags.string({
      description: 'Message for the changeset',
      required: true
    }),
    registry: Oclif.Flags.string({
      description: 'Specify a package manager registry to load the Bac cli',
      required: false,
      default: 'http://localhost:4873'
    }),
    tag: Oclif.Flags.string({
      description: 'Add a tag to the published package',
      required: false
      // default: "http://localhost:4873",
    })
  }

  static override args = {
    // path: Oclif.Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  }

  async execute(context: ContextCommand<typeof ReleaseSnapshot>) {
    // const moonService = await context.serviceFactory('moon', {context, workingPath: '.'})
    const releaseService = await context.serviceFactory('release', {
      context,
      workingPath: '.'
    })

    const moonQuery = `projectType=library || projectType=application`

    // const projects = await moonService.findProjectsJson({query: moonQuery})
    // let projects: any
    // try {
    //   projects = await moonService.findProjectsJson({query: moonQuery})
    // }
    // catch (err) {
    //   console.error(`err :>> `, err)
    // }

    // // find the versions of the releasable projects

    // console.log(`projects :>> `, projects)
    // return

    return releaseService.snapshot({
      query: moonQuery,
      message: context.cliOptions.flags.message,
      registry: context.cliOptions.flags.registry,
      tag: context.cliOptions.flags.tag
    })
  }
}
