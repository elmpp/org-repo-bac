import {
  BaseCommand,
  ContextCommand,
  Flags,
  Args,
  Interfaces as _Interfaces,
} from "@business-as-code/core";

export class Test extends BaseCommand<typeof Test> {
  static override description =
    "Creates a local snapshot release, including build";

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
  };

  static override args = {
    action: Args.string({
      description: "Absolute/Relative path",
      required: true,
      options: ["start", "stop"],
    }),
  };

  async execute(context: ContextCommand<typeof Test>) {
    const testService = await context.serviceFactory("test", {
      context,
      workingPath: ".",
    });

    switch (context.cliOptions.args.action) {
      case "start":
        return testService.startDaemons();
      case "stop":
        return testService.stopDaemons();
      default:
        throw new Error();
    }
  }
}
