// oclif custom base command docs - https://tinyurl.com/2n3wch65
import {Command, Flags, Interfaces} from '@oclif/core'
// import {Interfaces, Command} from '@oclif/core'

enum LogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCommand['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class BaseCommand<T extends typeof Command> extends Command {
  // add the --json flag
  static override enableJsonFlag = true

  // define flags that can be inherited by any command that extends BaseCommand
  static override baseFlags = {
    'log-level': Flags.custom<LogLevel>({
      summary: 'Specify level for logging.',
      options: Object.values(LogLevel),
      helpGroup: 'GLOBAL',
    })(),
  }

  protected flags!: Flags<T>
  protected args!: Args<T>

  public override async init(): Promise<void> {
    await super.init()
    const {args, flags} = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.flags = flags as Flags<T>
    this.args = args as Args<T>
  }

  protected override async catch(err: Error & {exitCode?: number}): Promise<any> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err)
  }

  protected override async finally(_: Error | undefined): Promise<any> {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(_)
  }
}