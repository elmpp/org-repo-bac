import {
  assertIsOk,
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
  expectIsOk,
} from "@business-as-code/core";
import { MessageName } from "@business-as-code/error";

/**
 Silly test of the run-workspace lifecycle. Just executes realpath in various workspaces
 */
export default class BacTestsRealpath extends BaseCommand<
  typeof BacTestsRealpath
> {
  static override description = "Runs arbitrary shell command (realpath)";

  // constructor(...args: any[]) {
  //   super(...args)
  // }
  //   static override examples = [
  //     `$ oex hello friend --from oclif
  // Produces the repos in the fixtures directory
  // `,
  //   ];

  // // define flags that can be inherited by any command that extends BaseCommand
  // static override baseFlags = {
  //   ...BaseCommand.baseFlags,
  //   schematicOptions: Oclif.Flags.custom<Record<string, unknown>>({
  //     summary: "Schematic Options",
  //     // options: ["debug", "error", "fatal", "info", "warn"] satisfies LogLevel[],
  //     helpGroup: "GLOBAL",
  //     parse: async (jsonString: string) => {
  //       try {
  //         const parsed = JSON.parse(jsonString);
  //         return parsed;
  //       } catch (err) {
  //         throw err;
  //       }
  //     },
  //     default: {},
  //   })(),
  // };

  static override flags = {
    // payload: Oclif.Flags.custom({
    //     parse: async (): Promise<any> => {},
    //     description: 'team to use',
    //     default: () => {},
    // }),
    workspacePath: Oclif.Flags.directory({
      exists: true, // do NOT infer from the RC file
      description: "Workspace name",
      required: true,
    }),

    query: Oclif.Flags.string({
      description: "Workspace query (moon format)",
      required: true,
    }),
    // schematicsAddress: Oclif.Flags.string({
    //   description: "Schematics Address",
    //   required: true,
    // }),
    // name: Oclif.Flags.string({
    //   description: "Schematics Address",
    //   // parse: async (input) => {
    //   //   console.log(`input :>> `, input)
    //   //   return 'pap'
    //   // }
    //   // required: true,
    // }),
    // schematicOptions: Oclif.Flags.custom<any>({
    //   description: "Schematics Options",
    //   parse: async (jsonString) => {
    //     // console.log(`input :>> `, input)
    //     // return 'pap'
    //     return JSON.parse(jsonString)
    //   }
    //   // required: true,
    // }),
  };

  static override args = {};

  // override async run(): Promise<void> {

  //   try {
  //     const parseOutput = (await this.parse<
  //       FlagsInfer<typeof RealpathCommand>,
  //       FlagsInfer<typeof RealpathCommand>,
  //       ArgsInfer<typeof RealpathCommand>
  //     >()) as ParserOutput<FlagsInfer<typeof RealpathCommand>, FlagsInfer<typeof RealpathCommand>, ArgsInfer<typeof RealpathCommand>> &
  //       BaseParseOutput;
  //   }
  //   catch (err) {

  //   }

  //   await this.initialise({ parseOutput, config: this.config });
  //   const context = await this.createContext(parseOutput);

  //   const res = await this.execute(context);

  //   if (!assertIsOk(res)) {
  //     const err = res.res.error;
  //     ;(err as any).exitCode = err?.extra?.exitCode ?? 1 // make it look like an OclifError
  //     throw err; // will end up in this.catch()
  //   }
  //   return;
  // }

  // protected override async catch(
  //   err: Error & { exitCode?: number }
  // ): Promise<any> {
  //   // console.log(`err :>> `, require('util').inspect(err, {showHidden: false, depth: undefined, colors: true}))
  //   console.log(`err.parse.output :>> `, err.parse.output)

  //   return
  // }

  async execute(context: ContextCommand<typeof BacTestsRealpath>) {
    // let repositoriesPath = addr.parsePath(context.cliOptions.flags.repositoriesPath! ?? path.resolve(__dirname, '../../../../pkg-tests-specs-fixtures/repositories'));
    // if (!assertIsAddressPath(repositoriesPath)) {
    //   throw new BacError(
    //     MessageName.FS_PATH_FORMAT_ERROR,
    //     `Path '${context.cliOptions.args.path.path}' cannot be parsed as a path`
    //   );
    // }
    // if (assertIsAddressPathRelative(repositoriesPath)) {
    //   repositoriesPath = addr.pathUtils.join(
    //     addr.parsePath(process.cwd()),
    //     repositoriesPath
    //   );
    // }
    // if (!assertIsAddressPathAbsolute(repositoriesPath)) {
    //   throw new BacError(
    //     MessageName.FS_PATH_FORMAT_ERROR,
    //     `Path '${repositoriesPath.original}' must be absolute/relative`
    //   );
    // }
    // if (!(await xfs.existsPromise(repositoriesPath.address))) {
    //   const repositoriesPathParent = addr.pathUtils.dirname(repositoriesPath);
    //   if (!(await xfs.existsPromise(repositoriesPathParent.address))) {
    //     throw new BacError(
    //       MessageName.FS_PATH_FORMAT_ERROR,
    //       `Parent path '${repositoriesPathParent.original}' must be present when creating workspace at '${repositoriesPath.original}'`
    //     );
    //   }
    //   await xfs.mkdirpPromise(repositoriesPath.address);
    // }
    // console.log(`repositoriesPath :>> `, repositoriesPath)
    // const repositoriesPath = addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('../../../../pkg-tests-specs-fixtures/repositories'))
    // console.log(`context.services :>> `, context.services);
    // const schematicsService = await context.serviceFactory("schematics", {
    //   context,
    //   // workspacePath: context.workspacePath,
    //   workingPath: ".",
    //   // force: true,
    //   // dryRun: true,
    // });

    // console.log(`:>> ergergergerghieu`);


    const moonService = await context.serviceFactory('moon', {
      context,
      workingPath: '.',
      // workspacePath: ''
    })
    const moonProjects = await moonService.findProjects({query: context.cliOptions.flags.query})



    // console.log(`projects, typeof:>> `, `|${projects}|`, typeof projects)

    const runLifecycleRes = await context.lifecycles.runWorkspace.executeRunWorkspace({
      projects: moonProjects.projects,
      common: {
        context,
        workspacePath: context.workspacePath,
        workingPath: '.',
      },
      options: [
        {
          provider: 'exec',
          options: {
            command: 'realpath',
            execOptions: {
              shell: true,
            },
          },
        },
      ]
    })

    // console.log(`runLifecycleRes :>> `, runLifecycleRes)
    expectIsOk(runLifecycleRes)

    return runLifecycleRes

    // if (!assertIsOk(res)) {
    //   switch (res.res.error.reportCode) {
    //     case MessageName.SCHEMATICS_ERROR:
    //       context.logger.error(res.res.error.message);
    //       break;
    //     case MessageName.SCHEMATICS_INVALID_ADDRESS:
    //       context.logger.error(res.res.error.message);
    //       break;
    //     case MessageName.SCHEMATICS_NOT_FOUND:
    //       context.logger.error(res.res.error.message);
    //       break;
    //   }
    // }

    // return res;

    //   override async run(): Promise<void> {
    //     }

    //     // this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
    //     this.log(`Creating a new workspace at '${workspacePath.original}'`)
    //   }
  }
}
