import {
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces
} from '@business-as-code/core'

export default class Test extends BaseCommand<typeof Test> {
  static override description =
    'Creates a local snapshot release, including build'

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
    })
  }

  static override args = {
    action: Oclif.Args.string({
      description: 'Absolute/Relative path',
      required: true,
      options: ['start', 'stop', 'restart']
    })
  }

  async execute(context: ContextCommand<typeof Test>) {
    const testService = await context.serviceFactory('test', {
      context,
      workingPath: '.'
    })

    switch (context.cliOptions.args.action) {
      case 'stop':
        return testService.stopDaemons()
      case 'start':
        return testService.startDaemons()
      case 'restart':
        await testService.stopDaemons()
        console.warn(`\n\n\nDaemons stopped------- Gonna start 'em up\n\n\n`)
        return testService.startDaemons()
      default:
        throw new Error()
    }
  }
}
