import {
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
  execUtils as _execUtils,
  execUtils,
} from "@business-as-code/core";

export class Test extends BaseCommand<typeof Test> {
  static override description = "Creates a local snapshot release, including build";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    workspacePath: Flags.string({
      description: "Workspace name",
      required: false,
    }),
    stage: Flags.custom<"stage0" | "stage1" | "stage2" | "stage3">({
      summary: "Test Stage",
      options: ["stage0", "stage1", "stage2", "stage3"],
      required: true,
    })(),
    testFileMatch: Flags.string({
      description: "Test file match",
      required: false,
    }),
    watch: Flags.boolean({
      description: "Watch",
      required: false,
    }),
    // testMatch: Flags.string({
    //   description: "Test it/describe name match",
    //   required: false,
    // }),
    cliSource: Flags.custom<"cliRegistry" | "cliLinked">({
      summary: "Method of cli sourcing",
      options: ["cliRegistry", "cliLinked"],
      required: true,
    })(),
  };

  static override args = {
    // path: Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  async execute(context: ContextCommand<typeof Test>) {

    const testService = await context.serviceFactory('test', {context, workingPath: '.'})

    let watch = context.cliOptions.flags.watch
    if (undefined === watch) {
      const execRuntime = execUtils.getExecRuntime()
      if (execRuntime === 'ts-node-dev') {
        watch = true
      }
    }

    return testService.test({
      stage: context.cliOptions.flags.stage as `stage${number}`,
      testFileMatch: context.cliOptions.flags.testFileMatch,
      // testMatch: context.cliOptions.flags.testMatch,
      cliSource: context.cliOptions.flags.cliSource!,
      watch,
    })
  }
}
