import {
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
  execUtils as _execUtils,
  execUtils,
} from "@business-as-code/core";

export default class Test extends BaseCommand<typeof Test> {
  static override description = "Creates a local snapshot release, including build";

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
    stage: Oclif.Flags.custom<"stage0" | "stage1" | "stage2" | "stage3">({
      summary: "Test Stage",
      options: ["stage0", "stage1", "stage2", "stage3"],
      required: true,
    })(),
    testFileMatch: Oclif.Flags.string({
      description: "Test file match",
      required: false,
    }),
    testNameMatch: Oclif.Flags.string({
      description: "Test name match",
      required: false,
    }),
    watch: Oclif.Flags.boolean({
      description: "Watch",
      required: false,
    }),
    skipEarlier: Oclif.Flags.boolean({
      description: "Skip Earlier Stages",
      required: false,
    }),
    skipPublish: Oclif.Flags.boolean({
      description: "Skip Build And Snapshot",
      required: false,
    }),
    skipDaemons: Oclif.Flags.boolean({
      description: "Skip Build And Snapshot",
      required: false,
    }),
    cliSource: Oclif.Flags.custom<"cliRegistry" | "cliLinked">({
      summary: "Method of cli sourcing",
      options: ["cliRegistry", "cliLinked"],
      required: true,
    })(),
  };

  static override args = {
    // path: Oclif.Args.string({
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

    return await testService.test({
      stage: context.cliOptions.flags.stage as `stage${number}`,
      testFileMatch: context.cliOptions.flags.testFileMatch,
      testNameMatch: context.cliOptions.flags.testNameMatch,
      cliSource: context.cliOptions.flags.cliSource!,
      watch,
      skipDaemons: context.cliOptions.flags.skipDaemons,
      skipEarlier: context.cliOptions.flags.skipEarlier,
      skipPublish: context.cliOptions.flags.skipPublish,
    })
  }
}
