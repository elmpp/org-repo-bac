import {
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
  execUtils as _execUtils,
} from "@business-as-code/core";

/** probably should fold this into the snapshot command */
export default class ChangesetsPublish extends BaseCommand<typeof ChangesetsPublish> {
  static override description = "Creates an empty workspace";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    // message: Oclif.Flags.string({
    //   description: "Workspace name",
    //   required: true,
    // }),
    // /** Moon scopes - https://tinyurl.com/2ek7rph4 . @todo - validate this better here */
    // query: Oclif.Flags.string({
    //   description: "query to select projects",
    //   required: false,
    // }),

    workspacePath: Oclif.Flags.directory({
  exists: true,
      description: "Workspace name",
      required: false,
    }),
    // configPath: Oclif.Flags.string({
    //   description: "Relative or absolute path to a workspace configuration",
    //   required: false,
    // }),
    // cliVersion: Oclif.Flags.string({
    //   description: "Specify a Bac cli version",
    //   required: false,
    //   default: "*",
    // }),
    registry: Oclif.Flags.string({
      description: "Specify a package manager registry to load the Bac cli",
      required: false,
      default: "http://localhost:4873",
    }),
    tag: Oclif.Flags.string({
      description: "Add a tag to the published package",
      required: false,
      // default: "http://localhost:4873",
    }),
  };

  static override args = {
    // path: Oclif.Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  async execute(context: ContextCommand<typeof ChangesetsPublish>) {

    const changesetService = await context.serviceFactory('changeset', {context, workingPath: '.'})

    return changesetService.publish({
      registry: context.cliOptions.flags.registry,
      tag: context.cliOptions.flags.tag,
    })


    // type D = InferHookParams<typeof RunWorkspaceLifecycleBase.hooks.runWorkspace>
    // type DD = LifecycleOptionsByMethod<'runWorkspace'>
    // type DDD = LifecycleImplementedMethods

    // const resLogin = await context.lifecycles.runWorkspace.executeRunWorkspace([
    //   {
    //     provider: "packageManager",
    //     options: {
    //       context,
    //       // workingPath: ".",
    //       workspacePath: await this.getWorkspacePath(
    //         context.cliOptions.flags.workspacePath
    //       ),
    //       options: {
    //         command: "changeset publish --no-git-tag --tag bollards",
    //         execOptions: {
    //           env: {
    //             ...(context.cliOptions.flags['registry'] ? {npm_config_registry: context.cliOptions.flags['registry']} : {}),
    //           },
    //         }
    //         // filter: 'blah',
    //         // execOptions: {},
    //       },
    //     },
    //   },
    // ]);

    // const packageManagerService = await context.serviceFactory('packageManager', {context, workingPath: '.'})
    // // const execService = await context.serviceFactory('exec', {context, workingPath: '.'})

    // const resLogin = await packageManagerService.login()

    // // const resLogin = await packageManagerService.login({
    // //   command: "npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"",
    // //   // options: {
    // //   //   shell: true,
    // //   // }
    // //   // options: {
    // //   //   env: {
    // //   //     ...(context.cliOptions.flags['registry'] ? {npm_config_registry: context.cliOptions.flags['registry']} : {}),
    // //   //   },
    // //   // }
    // // })
    // expectIsOk(resLogin);

    // const command = `changeset publish --no-git-tag` + (context.cliOptions.flags['tag'] ? ` --tag ${context.cliOptions.flags['tag']}` : '')

    // const resPublish = await packageManagerService.run({
    //   command,
    //   options: {
    //     env: {
    //       ...(context.cliOptions.flags['registry'] ? {npm_config_registry: context.cliOptions.flags['registry']} : {}),
    //     },
    //   }
    // })
    // return resPublish

    // const resLogin = await context.lifecycles.runWorkspace.executeRunWorkspace([
    //   {
    //     provider: "packageManager",
    //     options: {
    //       context,
    //       // workingPath: ".",
    //       workspacePath: await this.getWorkspacePath(
    //         context.cliOptions.flags.workspacePath
    //       ),
    //       options: {
    //         command: "changeset publish --no-git-tag --tag bollards",
    //         execOptions: {
    //           env: {
    //             ...(context.cliOptions.flags['registry'] ? {npm_config_registry: context.cliOptions.flags['registry']} : {}),
    //           },
    //         }
    //         // filter: 'blah',
    //         // execOptions: {},
    //       },
    //     },
    //   },
    // ]);
    // expectIsOk(resLogin.res);

    // const resPublish =
    //   await context.lifecycles.runWorkspace.executeRunWorkspace([{
    //     provider: "moon",
    //     options: {
    //       context,
    //       // execaOptions: {},
    //       // workingPath: ".",
    //       workspacePath: await this.getWorkspacePath(
    //         context.cliOptions.flags.workspacePath
    //       ),
    //       options: {
    //         command: "changeset publish --no-git-tag --tag bollards ",
    //         platform: "node",
    //         // execOptions: {} as any,
    //         runFromWorkspaceRoot: true,
    //       },
    //     },
    //   }]);
    // return resPublish.res;
  }
}
