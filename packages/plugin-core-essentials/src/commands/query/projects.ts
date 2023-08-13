import {
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
} from "@business-as-code/core";

export class QueryProjects extends BaseCommand<typeof QueryProjects> {
  static override description = "Retrieve details of the workspace projects";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    query: Oclif.Flags.string({
      description: "Query to select projects",
      required: false,
      default: "projectType=library || projectType=application",
    }),
    workspacePath: Oclif.Flags.directory({
      exists: true,
      description: "Workspace name",
      required: true,
    }),
    // json: Oclif.Flags.boolean({
    //   description: "Workspace name",
    //   default: true,
    // }),
  };

  static override args = {};

  async execute(context: ContextCommand<typeof QueryProjects>) {
    const moonService = await context.serviceFactory("moon", {
      context: context,
      workingPath: ".",
    });

    // const name = await ux.prompt('What is your name?')
    // console.log(`name :>> `, name)

    if (context.cliOptions.flags.json) {
      const projects = await moonService.findProjectsJson({
        query: context.cliOptions.flags.query,
      });
      this.logJson(projects)
    }
    else {
      const projects = await moonService.findProjectsString({
        query: context.cliOptions.flags.query,
      });
      this.logToStdout(projects)
    }

    return {
      success: true as const,
      res: undefined,
    };
  }
}
