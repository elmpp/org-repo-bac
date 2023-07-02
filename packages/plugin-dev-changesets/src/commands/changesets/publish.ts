import {
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
  LifecycleImplementedMethods,
  LifecycleOptionsByMethod,
  RunWorkspaceLifecycleBase,
} from "@business-as-code/core";
import { InferHookParams } from "@business-as-code/core/interfaces/__types__";

/** probably should fold this into the snapshot command */
export class ChangesetsPublish extends BaseCommand<typeof ChangesetsPublish> {
  static override description = "Creates an empty workspace";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    // message: Flags.string({
    //   description: "Workspace name",
    //   required: true,
    // }),
    // /** Moon scopes - https://tinyurl.com/2ek7rph4 . @todo - validate this better here */
    // query: Flags.string({
    //   description: "query to select projects",
    //   required: false,
    // }),

    workspacePath: Flags.string({
      description: "Workspace name",
      required: false,
    }),
    // configPath: Flags.string({
    //   description: "Relative or absolute path to a workspace configuration",
    //   required: false,
    // }),
    // cliVersion: Flags.string({
    //   description: "Specify a Bac cli version",
    //   required: false,
    //   default: "*",
    // }),
    registry: Flags.string({
      description: "Specify a package manager registry to load the Bac cli",
      required: false,
      default: "http://localhost:4873",
    }),
  };

  static override args = {
    // path: Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  async execute(context: ContextCommand<typeof ChangesetsPublish>) {
    // type D = InferHookParams<typeof RunWorkspaceLifecycleBase.hooks.runWorkspace>
    // type DD = LifecycleOptionsByMethod<'runWorkspace'>
    // type DDD = LifecycleImplementedMethods

    const res = await context.lifecycles.runWorkspace.executeRunWorkspace({
      context,
      workingPath: ".",
      workspacePath: await this.getWorkspacePath(),
      options: {
        command: 'changeset publish --no-git-tag --tag bollards',
        platform: 'node',
        runFromWorkspaceRoot: true,
      }
    });
    return res;
  }
}
