import { BaseCommand, ContextCommand, Oclif } from "@business-as-code/core";
import {
  ArgsInfer,
  BaseParseOutput,
  FlagsInfer,
} from "@business-as-code/core/commands/base-command";
import * as oclif from "@oclif/core";
import { ParserOutput } from "@oclif/core/lib/interfaces/parser";

/** here purely to allow test-env to create a context */
export class ContextTestCommand extends BaseCommand<typeof ContextTestCommand> {
  static override description = "Creates a context";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    workspacePath: Oclif.Flags.directory({
      exists: true,
      description: "Workspace name",
      required: false,
    }),
  };

  static override args = {
    // path: Oclif.Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  // @ts-ignore
  async execute(context: ContextCommand<typeof ContextTestCommand>) {
    throw new Error(`Should not be ran!!`);
  }

  static async createContext<T extends typeof oclif.Command>(
    this: new (...args: any[]) => T,
    // this: new (config: Config, parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>) => T,
    // argv?: string[] | undefined,
    opts: oclif.Interfaces.LoadOptions,
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>
  ): Promise<ContextCommand<typeof ContextTestCommand>> {
    const config = await oclif.Config.load(
      opts || require.main?.filename || __dirname
    );
    const cmd = new this([] as any[], config);
    if (!cmd.id) {
      const id = cmd.constructor.name.toLowerCase();
      cmd.id = id;
      // @ts-ignore
      cmd.ctor.id = id;
    }
    // @ts-ignore
    cmd.ctor.oclifConfig = config;

    // await (cmd as T & { initialise: () => Promise<void> }).initialise();

    // console.log(`parseOutput :>> `, require('util').inspect(parseOutput, {showHidden: false, depth: undefined, colors: true}))

    // @ts-ignore
    const context = await cmd.getContext(parseOutput);
    return context;
  }

  /**
   @internal
   */
  async getContext(
    parseOutput: ParserOutput<
      FlagsInfer<typeof ContextTestCommand>,
      FlagsInfer<typeof ContextTestCommand>,
      ArgsInfer<typeof ContextTestCommand>
    > &
      BaseParseOutput
  ): Promise<ContextCommand<typeof ContextTestCommand>> {
    await this.initialise({ parseOutput, config: this.config });
    const context = await this.setupContext({ parseOutput });
    await this.initialisePlugins({ context });
    return context;
  }
}
