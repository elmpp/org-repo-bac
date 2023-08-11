import {
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
  ux,
} from "@business-as-code/core";

export class QueryProjects extends BaseCommand<
  typeof QueryProjects
> {
  static override description = "Retrieve details of the workspace projects";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    query: Flags.string({
      description: "Query to select projects",
      required: false,
      default: "projectType=library || projectType=application",
    }),
    workspacePath: Flags.string({
      description: "Workspace name",
      required: true,
    }),
  };

  static override args = {
  };

  async execute(context: ContextCommand<typeof QueryProjects>) {

      const moonService = await context.serviceFactory("moon", {
        context: context,
        workingPath: ".",
      });

      // const name = await ux.prompt('What is your name?')
      // console.log(`name :>> `, name)

      const projects = await moonService.findProjects({
        query: context.cliOptions.flags.query,
      });

      return {
        success: true as const,
        res: projects,
      }
  }
}
