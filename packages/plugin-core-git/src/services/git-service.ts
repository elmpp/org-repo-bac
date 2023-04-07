import { ServiceInitialiseOptions } from '@business-as-code/core';
import { BacError, MessageName } from '@business-as-code/error';
import nodeGit, { Repository } from 'nodegit'
import simpleGitFactory, {CheckRepoActions, SimpleGit, TaskOptions} from 'simple-git'
import path from 'path'

// nodeGit.Clone('eriguh').then()

declare global {
  namespace Bac {
    interface Services {
      git: {
        insType: GitService;
        clzType: typeof GitService;
      };
    }
  }
  // export interface BacServices {
  //   schematicsService: SchematicsService;
  // }
}

// type SchematicsMap = Map<
//   AddressPackageScaffoldIdentString,
//   {
//     plugin: Plugin;
//     collection: Collection<any, any>;
//     collectionPath: AddressPathAbsolute;
//     address: AddressPackageScaffoldIdent;
//   }
// >;

// const colors = ansiColors.create();

// type Options = { context: Context; destinationPath: AddressPathAbsolute };

// /**
//  NodeGit GH - https://github.com/nodegit/nodegit
//  NodeGit API Docs - https://www.nodegit.org/api/
//  NodeGit Examples Folder - https://github.com/nodegit/nodegit/tree/master/examples
//  */
/**
 SimpleGit GH - https://github.com/nodegit/nodegit
 SimpleGit API Docs - https://www.simpleGit.org/api/
 SimpleGit Examples Folder - https://github.com/nodegit/nodegit/tree/master/examples
 */
export class GitService {
  static title = "git";
  // options: Options;

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */
  protected repository: SimpleGit | undefined

  static async initialise(options: ServiceInitialiseOptions & {workingPath?: string}) {
    const ins = new GitService(options);

    const baseDir = GitService.getWorkingDestinationPath(options)
    console.log(`baseDir :>> `, baseDir)
    const simpleGit = simpleGitFactory({baseDir});

    ins.repository = simpleGit
    // if (await simpleGit.checkIsRepo(CheckRepoActions.IS_REPO_ROOT)) {
    //   ins.repository = simpleGit
    // }
    // else {
    //   options.context.logger(`GitService: no existing repo found at location '${options.destinationPath.original}'`)
    // }

    return ins

    // // }
    // try {
    //   ins.repository = await nodeGit.Repository.open(options.destinationPath.original)
    // }
    // catch (err) {
    // }

    // return ins;
  }

  constructor(protected options: ServiceInitialiseOptions & {workingPath?: string}) {
    // this.options = options;
  }

  protected static getWorkingDestinationPath(options: ServiceInitialiseOptions & {workingPath?: string}): string {
    return path.join(options.destinationPath.original, options.workingPath ?? '.')
  }

  public async getRepository() {
    if (!this.repository) {
      throw new BacError(MessageName.GIT_SERVICE_REPOSITORY_UNINITIALISED, `Attempting an operation without a current initialised repository`)
    }
    return Promise.resolve(this.repository)
  }

  // /**
  //  @internal for use only by git-service-helpers
  //  */
  // public async getNodeGit() {
  //   if (!this.repository) {
  //     throw new BacError(MessageName.GIT_SERVICE_REPOSITORY_UNINITIALISED, `Attempting an operation without a current initialised repository`)
  //   }
  //   return nodeGit
  // }

  /**
   simpleGit example - https://tinyurl.com/25o9sjbz
   nodeGit example - https://tinyurl.com/23cn82ao
   */
  async clone(url: string, options?: TaskOptions): Promise<this> {
    const simpleGit = simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options)});
    await simpleGit.clone(
      url,
      this.options.destinationPath.original,
      options,
    )
    // @todo - error handling
    this.repository = simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options)});
    return this
  }

  async init(options?: TaskOptions): Promise<this> {
    // const repository = await nodeGit.Repository.init(
    //   this.options.destinationPath.original,
    //   Number(options?.bare ?? false),
    // )
    // // @todo - error handling
    // this.repository = repository

    const simpleGit = simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options)});
    await simpleGit.init(options ?? {})
    // @todo - error handling
    this.repository = simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options)});
    return this
  }

  getWorkingDestinationPath(): string {
    return GitService.getWorkingDestinationPath(this.options)
  }

  // async addAll(): Promise<this> {
  //   const index = await this.getRepository().refreshIndex()
  //   // @todo - error handling

  //   await index.addAll()
  //   return this

  // }




  // protected async initialise(_options: ServiceInitialiseOptions) {
  //   this.setupSchematics({ workflow: this.workflow });
  //   this.registerTasks({ workflow: this.workflow });
  // }




  // async run({
  //   address,
  //   context,
  //   options,
  //   dryRun = true,
  //   force = false,
  //   workingPath,
  // }: // destinationPath,
  // {
  //   address: AddressPackageScaffoldIdentString;
  //   context: Context;
  //   // destinationPath: AddressPathAbsolute;
  //   options: Record<PropertyKey, unknown>;
  //   dryRun?: boolean;
  //   force?: boolean;
  //   workingPath: AddressPathRelative;
  // }): Promise<
  //   Result<
  //     AddressPathAbsolute,
  //     | BacError<MessageName.SCHEMATICS_INVALID_ADDRESS>
  //     | BacError<MessageName.SCHEMATICS_NOT_FOUND>
  //     | BacError<MessageName.SCHEMATICS_ERROR>
  //   >
  // > {
  //   // console.log(` :>> Available: '${Array.from(this.schematicsMap.keys()).map(schematicPath => schematicPath).join(', ')}'`)

  //   if (!xfs.existsPromise(this.options.context.workspacePath.address)) {
  //     return {
  //       success: false,
  //       res: new BacError(
  //         MessageName.SCHEMATICS_ERROR,
  //         `DestinationPath '${this.options.destinationPath.original}' must exist before scaffolding`
  //       ),
  //     };
  //   }

  //   const schematicPath = addr.parseAsType(address, "scaffoldIdentPackage", {
  //     strict: false,
  //   });
  //   if (!schematicPath) {
  //     return {
  //       res: new BacError(
  //         MessageName.SCHEMATICS_INVALID_ADDRESS,
  //         `Invalid schematic address '${address}'`
  //       ),
  //       success: false,
  //     };
  //   }

  //   const schematicMapEntry = this.schematicsMap.get(
  //     schematicPath.addressNormalized
  //   );

  //   if (!schematicMapEntry) {
  //     return {
  //       res: new BacError(
  //         MessageName.SCHEMATICS_NOT_FOUND,
  //         `Schematic not found at address '${
  //           schematicPath.original
  //         }'. Available: '${Array.from(this.schematicsMap.keys())
  //           .map((schematicPath) => schematicPath)
  //           .join(", ")}'`
  //       ),
  //       success: false,
  //     };
  //   }

  //   const debug = true; // @todo - make available from oclif
  //   // const dryRunPresent = true;  // @todo - make available from oclif
  //   // const dryRun = dryRunPresent ? true : debug; // @todo - make available from oclif

  //   // const force = true; // @todo - make available from oclif
  //   const allowPrivate = true; // @todo - make available from oclif

  //   // all set for executing this bitch

  //   // Indicate to the user when nothing has been done. This is automatically set to off when there's
  //   // a new DryRunEvent.
  //   let nothingDone = true;

  //   // Logging queue that receives all the messages to show the users. This only get shown when no
  //   // errors happened.
  //   let loggingQueue: string[] = [];
  //   let error = false;

  //   const workflow = this.workflow;
  //   // const workflow = this.createWorkflow({
  //   //   context,
  //   //   dryRun,
  //   //   force,
  //   //   destinationPath,
  //   // });

  //   /**
  //    * Logs out dry run events.
  //    *
  //    * All events will always be executed here, in order of discovery. That means that an error would
  //    * be shown along other events when it happens. Since errors in workflows will stop the Observable
  //    * from completing successfully, we record any events other than errors, then on completion we
  //    * show them.
  //    *
  //    * This is a simple way to only show errors when an error occur.
  //    */
  //   workflow.reporter.subscribe((event) => {
  //     nothingDone = false;
  //     // Strip leading slash to prevent confusion.
  //     const eventPath = event.path.startsWith("/")
  //       ? event.path.slice(1)
  //       : event.path;

  //     switch (event.kind) {
  //       case "error":
  //         error = true;

  //         const desc =
  //           event.description == "alreadyExist"
  //             ? "already exists"
  //             : "does not exist";
  //         context.logger(`ERROR! ${eventPath} ${desc}.`, "error");
  //         break;
  //       case "update":
  //         loggingQueue.push(
  //           `${colors.cyan("UPDATE")} ${eventPath} (${
  //             event.content.length
  //           } bytes)`
  //         );
  //         break;
  //       case "create":
  //         loggingQueue.push(
  //           `${colors.green("CREATE")} ${eventPath} (${
  //             event.content.length
  //           } bytes)`
  //         );
  //         break;
  //       case "delete":
  //         loggingQueue.push(`${colors.yellow("DELETE")} ${eventPath}`);
  //         break;
  //       case "rename":
  //         const eventToPath = event.to.startsWith("/")
  //           ? event.to.slice(1)
  //           : event.to;
  //         loggingQueue.push(
  //           `${colors.blue("RENAME")} ${eventPath} => ${eventToPath}`
  //         );
  //         break;
  //     }
  //   });

  //   /**
  //    * Listen to lifecycle events of the workflow to flush the logs between each phases.
  //    */
  //   workflow.lifeCycle.subscribe((event) => {
  //     if (event.kind == "workflow-end" || event.kind == "post-tasks-start") {
  //       if (!error) {
  //         // Flush the log queue and clean the error state.
  //         loggingQueue.forEach((log) => context.logger(log, "info"));
  //       }
  //       loggingQueue = [];
  //       error = false;
  //     }
  //   });

  //   // Show usage of deprecated options
  //   workflow.registry.useXDeprecatedProvider((msg) =>
  //     context.logger(msg, "warn")
  //   );

  //   // const _ = context.cliOptions.argv // @todo - make available from oclif onwards - https://github.com/angular/angular-cli/blob/d15d44d3a4fcc7727fb87a005fa383b58cefae91/packages/angular_devkit/schematics_cli/bin/schematics.ts#L424
  //   // // Pass the rest of the arguments as the smart default "argv". Then delete it.
  //   // workflow.registry.addSmartDefaultProvider("argv", (schema) =>
  //   //   "index" in schema ? _[Number(schema["index"])] : _
  //   // );

  //   // // Add prompts.
  //   // if (cliOptions.interactive && isTTY()) {
  //   //   workflow.registry.usePromptProvider(_createPromptProvider());
  //   // }

  //   context.logger(
  //     `Running schematic '${schematicMapEntry.address.addressNormalized}'. Collection path: '${schematicMapEntry.collectionPath.original}', DestinationPath: '${this.options.destinationPath.original}'`,
  //     "info"
  //   );
  //   // console.log(`schematicMapEntry.address.parts.params.namespace :>> `, schematicMapEntry.address.parts.params.get('namespace'))
  //   // console.log(`schematicMapEntry.address :>> `, schematicMapEntry.address)

  //   // console.log(`context :>> `, context)

  //   // const {...contextPrivate} = context

  //   /**
  //    *  Execute the workflow, which will report the dry run events, run the tasks, and complete
  //    *  after all is done.
  //    *
  //    *  The Observable returned will properly cancel the workflow if unsubscribed, error out if ANY
  //    *  step of the workflow failed (sink or task), with details included, and will only complete
  //    *  when everything is done.
  //    */
  //   try {
  //     await workflow
  //       .execute({
  //         collection: schematicMapEntry.collectionPath.original,
  //         schematic: schematicMapEntry.address.parts.params.get("namespace")!,
  //         // options,
  //         options: {
  //           ...options,
  //           _bacContext: context,
  //         },
  //         // collection: collectionName,
  //         // schematic: schematicName,
  //         // options: schematicOptions,

  //         allowPrivate: allowPrivate,
  //         debug: true,
  //         logger: this.schematicsLogger,
  //       })
  //       .toPromise();

  //     if (nothingDone) {
  //       context.logger("Nothing to be done.", "info");
  //     } else if (dryRun) {
  //       context.logger(`Dry run enabled. No files written to disk.`, "info");
  //     }

  //     return { res: this.options.context.workspacePath, success: true };
  //   } catch (err) {
  //     let message: string
  //     if (err instanceof UnsuccessfulWorkflowExecution) {
  //       // "See above" because we already printed the error.
  //       message = "The Schematic workflow failed. See above."
  //       // context.logger("The Schematic workflow failed. See above.", "error");
  //     } else if (debug && err instanceof Error) {
  //       message = `An error occured:\n${err.stack}`
  //     } else {
  //       message = `Error: ${err instanceof Error ? err.message : err}`
  //     }

  //     return {
  //       res: new BacErrorWrapper(
  //         MessageName.SCHEMATICS_ERROR,
  //         `${message}. Supplied path: '${schematicPath.original}'`,
  //         err as Error
  //       ),
  //       success: false,
  //     };
  //   }
  // }

  // protected createWorkflow({
  //   dryRun = true,
  //   force = false,
  //   destinationPath,
  // }: {
  //   dryRun?: boolean;
  //   force?: boolean;
  //   destinationPath?: AddressPathAbsolute;
  // }): NodeWorkflow {
  //   const scaffoldBase = path.resolve(__dirname, "../..");
  //   const cliRoot = process.cwd(); // todo make available through context
  //   const workflowRoot = destinationPath?.original ?? process.cwd();
  //   // const pluginRoots = context.oclifConfig.plugins.filter(p => p.type === 'core').map(p => p.root)

  //   const workflow = new NodeWorkflow(workflowRoot, {
  //     force,
  //     dryRun,
  //     // resolvePaths: [process.cwd(), scaffoldBase],
  //     resolvePaths: [scaffoldBase, cliRoot], // not sure what this does just yet
  //     schemaValidation: true,
  //     packageManager: "pnpm", // https://github.com/angular/angular-cli/blob/d15d44d3a4fcc7727fb87a005fa383b58cefae91/packages/angular_devkit/schematics_cli/bin/schematics.ts#L163
  //   });
  //   return workflow;
  // }

  // protected async registerTasks({ workflow }: { workflow: NodeWorkflow }) {
  //   this.options.context.logger(`registerServicesAsTasks: registering tasks`);

  //   const taskExecutorFactory: TaskExecutorFactory<{ rootDirectory: string }> = // very vanilla factory-level params; we'll be creating the services per usage
  //   // Parameters<ServicesStatic[typeof serviceName]["initialise"]>
  //     {
  //       name: "service-exec",
  //       create: (options) =>
  //         import("@business-as-code/core").then((mod) =>
  //           mod.serviceExecExecutor(options!)
  //         ),
  //       // create: (options) => import('../schematics/tasks/service-exec/executor').then((mod) => mod.default(options!)),
  //     };

  //   workflow.engineHost.registerTaskExecutor(taskExecutorFactory, {
  //     // context,
  //     rootDirectory: this.options.destinationPath.original,
  //     // rootDirectory: root && getSystemPath(root),
  //   });
  //   // console.log(`workflow.engineHost :>> `, workflow.engineHost);
  // }

  // // context.logger(`registerServicesAsTasks: registering '${context.}' services`)
  // // need to register the cb here somehow ¯\_(ツ)_/¯
  // // }

  // // /**
  // //  In order to integrate services with schematics, we can register the services as tasks
  // //  */
  // // protected async registerServicesAsTasks({context, workflow, destinationPath}: {context: Context, workflow: NodeWorkflow, destinationPath: AddressPathAbsolute}) {

  // //   const registerServiceAsTask = ({
  // //     serviceName,
  // //   }: {
  // //     serviceName: keyof ServicesStatic;
  // //   }) => {
  // //     context.logger(
  // //       `registerServicesAsTasks: registering service '${serviceName}' as schematic task`
  // //     );

  // //     const taskExecutor: TaskExecutorFactory<
  // //       Parameters<ServicesStatic[typeof serviceName]["initialise"]>
  // //     > = {
  // //       name: serviceName,
  // //       create: (serviceOptions: Parameters<ServicesStatic[typeof serviceName]["initialise"]>) =>
  // //         Promise.resolve().then(() => {
  // //           return context.serviceFactory(serviceName, serviceOptions)
  // //         }).then((service) => {
  // //           console.log(`:>> HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH`, serviceOptions);

  // //           const executor: TaskExecutor = async (options) => {
  // //             console.log(`WITHIN EXECUTOR '${serviceName}' options, serviceOptions, service :>> `, options, serviceOptions, service)
  // //           }
  // //           return executor
  // //         })
  // //           // const service = context.serviceFactory(serviceName, serviceOptions);
  // //           // return service as unknown as TaskExecutor;
  // //         // Promise.resolve().then(() => {
  // //         //   console.log(`:>> HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH`, serviceOptions);

  // //         //   const service = context.serviceFactory(serviceName, serviceOptions);
  // //         //   const executor: TaskExecutor = async (options) => {
  // //         //     console.log(`WITHIN EXECUTOR '${serviceName}' options, service :>> `, options, service)
  // //         //   }
  // //         //   return executor
  // //         //   // return service as unknown as TaskExecutor;
  // //         // }),
  // //     };
  // //     workflow.engineHost.registerTaskExecutor(taskExecutor, [{ context, destinationPath
  // //       // rootDirectory: root && getSystemPath(root),
  // //     }]);
  // //   };

  // //   for (const serviceName of context.serviceFactory.availableServices) {
  // //     registerServiceAsTask({serviceName})
  // //   }

  // //   console.log(`workflow.engineHost :>> `, workflow.engineHost)

  // //   // context.logger(`registerServicesAsTasks: registering '${context.}' services`)
  // //   // need to register the cb here somehow ¯\_(ツ)_/¯
  // // }

  // // https://github.com/angular/angular-cli/blob/d15d44d3a4fcc7727fb87a005fa383b58cefae91/packages/angular_devkit/schematics_cli/bin/schematics.ts#L220
  // protected async setupSchematics({ workflow }: { workflow: NodeWorkflow }) {
  //   const verbose = true; // @todo - make available from oclif
  //   // const debug = true // @todo - make available from oclif
  //   // const dryRunPresent = true;  // @todo - make available from oclif
  //   // const dryRun = dryRunPresent ? true : debug; // @todo - make available from oclif
  //   // const force = true; // @todo - make available from oclif
  //   // const allowPrivate = true; // @todo - make available from oclif

  //   // const colors = ansiColors.create();

  //   /** @todo - integrate with oclif somehow */
  //   const setupLogger = (): logging.Logger => {
  //     /** Create the DevKit Logger used through the CLI. */
  //     const logger = createConsoleLogger(
  //       verbose ?? true,
  //       process.stdout,
  //       process.stderr,
  //       {
  //         info: (s) => s,
  //         debug: (s) => s,
  //         warn: (s) => colors.bold.yellow(s),
  //         error: (s) => colors.bold.red(s),
  //         fatal: (s) => colors.bold.red(s),
  //       }
  //     );
  //     // const logger = createConsoleLogger(verbose ?? true, process.stdout, process.stderr, {
  //     //   info: (s) => s,
  //     //   debug: (s) => s,
  //     //   warn: (s) => colors.bold.yellow(s),
  //     //   error: (s) => colors.bold.red(s),
  //     //   fatal: (s) => colors.bold.red(s),
  //     // });
  //     return logger;
  //   };
  //   const logger = setupLogger();

  //   /** Create the workflow scoped to the working directory that will be executed with this run. */
  //   // const scaffoldBase = path.resolve(__dirname, '../..')
  //   // const cliRoot = process.cwd() // todo make available through context
  //   // const resolveRoot = path.resolve(process.cwd(), '../..') // todo make available through context
  //   // const pluginRoots = context.oclifConfig.plugins.filter(p => p.type === 'core').map(p => p.root)

  //   // console.log(`scaffoldBase :>> `, scaffoldBase)
  //   // console.log(`resolveRoot :>> `, cliRoot)
  //   // console.log(`pluginRoots :>> `, pluginRoots)
  //   // console.log(`context.cliOptions :>> `, context.cliOptions)

  //   // const workflow = this.createWorkflow({ context });
  //   // console.log(`workflow :>> `, workflow)

  //   function findAllSchematics({
  //     workflow,
  //     context,
  //     logger,
  //   }: {
  //     workflow: NodeWorkflow;
  //     context: Context;
  //     logger: logging.Logger;
  //   }): SchematicsMap {
  //     try {
  //       // const cliCollection = workflow.engine.createCollection(path.join(cliRoot, 'collection.json'));

  //       return context.oclifConfig.plugins.reduce((acc, plugin) => {
  //         const collectionPath = addr.pathUtils.join(
  //           addr.parsePath(plugin.root),
  //           addr.parsePath("collection.json")
  //         ) as AddressPathAbsolute;
  //         try {
  //           const collection = workflow.engine.createCollection(
  //             collectionPath.original
  //           );
  //           if (collection) {
  //             for (const publicSchematicName of collection.listSchematicNames(
  //               false
  //             )) {
  //               const addressTemplate = addr.parseAsType(
  //                 `${plugin.name}#namespace=${publicSchematicName}`,
  //                 "scaffoldIdentPackage"
  //               );
  //               acc.set(addressTemplate.addressNormalized, {
  //                 plugin,
  //                 collection,
  //                 collectionPath,
  //                 address: addressTemplate,
  //               });
  //             }
  //           }
  //         } catch (err) {
  //           context.logger(
  //             `schematic collection path '${collectionPath.original}' unresolvable`,
  //             "debug"
  //           );
  //           // unresolvable collection
  //         }
  //         return acc;
  //       }, new Map() as SchematicsMap);

  //       // // can use the cli collection as the base 'requester' within schematics..
  //       // console.log(`cliCollection :>> `, cliCollection, cliCollection._engine._host)
  //       // const collection = workflow.engine.createCollection('scaffold-collection', cliCollection); // nodeHostEngine will traverse the resolveRoots looking for json files

  //       // console.log(`collection :>> `, collection)
  //       // logger.info(collection.listSchematicNames().join('\n'));
  //     } catch (error) {
  //       logger.fatal(error instanceof Error ? error.message : `${error}`);
  //       throw error;
  //     }
  //   }

  //   this.schematicsMap = findAllSchematics({
  //     workflow,
  //     context: this.options.context,
  //     logger,
  //   });
  //   this.schematicsLogger = logger;
  //   // workflow = workflow

  //   // /** If the user wants to list schematics, we simply show all the schematic names. */
  //   // if (true) {
  //   //   // if (cliOptions['list-schematics']) {
  //   //   return listSchematics(workflow, 'collection.json', logger);
  //   // }

  //   // /** If the user wants to list schematics, we simply show all the schematic names. */
  //   // if (cliOptions["list-schematics"]) {
  //   //   return _listSchematics(workflow, collectionName, logger);
  //   // }

  //   // if (!schematicName) {
  //   //   logger.info(getUsage());

  //   //   return 1;
  //   // }

  //   // if (debug) {
  //   //   logger.info(
  //   //     `Debug mode enabled${
  //   //       isLocalCollection ? " by default for local collections" : ""
  //   //     }.`
  //   //   );
  //   // }
  // }

  static something() {}
  async somethingelse() {}
}
