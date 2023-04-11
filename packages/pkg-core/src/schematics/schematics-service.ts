// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import { Path, virtualFs } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import {
  callRule,
  Collection,
  DryRunSink,
  ExecutionOptions,
  HostCreateTree,
  HostSink,
  MergeStrategy,
  Rule,
  SchematicContext,
  Sink,
  TaskExecutorFactory,
  Tree,
  UnsuccessfulWorkflowExecution,
} from "@angular-devkit/schematics";
import { branch } from "@angular-devkit/schematics/src/tree/static";
import {
  NodeModulesEngineHost,
  NodePackageDoesNotSupportSchematics,
  NodeWorkflow,
  NodeWorkflowOptions,
} from "@angular-devkit/schematics/tools";
import {
  addr,
  AddressPackage,
  AddressPackageScaffoldIdent,
  AddressPackageScaffoldIdentString,
  AddressPathAbsolute,
  AddressPathAbsoluteString,
} from "@business-as-code/address";
import {
  BacError,
  BacErrorWrapper,
  MessageName,
} from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";
import { Interfaces } from "@oclif/core";
import * as ansiColors from "ansi-colors";
import path from "path";
import { from, Observable, of as observableOf, of, throwError } from "rxjs";
import { concatMap, ignoreElements, last, map, takeLast } from "rxjs/operators";
import { Context, Result, ServiceInitialiseOptions } from "../__types__";

declare global {
  namespace Bac {
    interface Services {
      schematics: {
        insType: SchematicsService;
        clzType: typeof SchematicsService;
      };
    }
  }
  // export interface BacServices {
  //   schematicsService: SchematicsService;
  // }
}

type SchematicsCollectionsMap = Map<
  AddressPathAbsoluteString,
  // AddressPackageStringified,
  // AddressPackageScaffoldIdentString,
  {
    plugin: Interfaces.Plugin;
    // collection: Collection<any, any>;
    collectionPath: AddressPathAbsolute;
    // address: AddressPackageScaffoldIdent;
    address: AddressPackage;
  }
>;
type SchematicsMap = Map<
  AddressPackageScaffoldIdentString,
  {
    plugin: Interfaces.Plugin;
    collection: Collection<any, any>;
    collectionPath: AddressPathAbsolute;
    address: AddressPackageScaffoldIdent;
  }
>;

const colors = ansiColors.create();

let lastInstance: SchematicsService | undefined = undefined;

type Options = ServiceInitialiseOptions & {
  /** whether to commit the tree */
  dryRun?: boolean;
  /** overrides conflicts */
  force?: boolean;
};

// type Options = { context: Context; destinationPath: AddressPathAbsolute };

export class SchematicsService {
  static title = "schematics";
  options: Required<Options>;
  runCache = {
    nothingDone: true,
    loggingQueue: [],
    error: false,
  } as { nothingDone: boolean; loggingQueue: string[]; error: boolean };

  static async initialise(options: Options) {
    const ins = new SchematicsService(options);
    await ins.initialise(options, lastInstance);
    lastInstance = ins;
    return ins;
  }

  schematicsMap: SchematicsMap = new Map();
  // schematicsCollectionMap: SchematicsCollectionsMap = new Map();
  // // @ts-ignore - is assigned via initialise
  // schematicsLogger: logging.Logger;

  // @ts-expect-error:
  private workflow: NodeWorkflow;

  constructor({
    dryRun = false,
    force = true,
    workingPath = ".",
    ...otherOptions
  }: Options) {
    this.options = {
      workingPath,
      dryRun,
      force,
      ...otherOptions,
    };
  }

  protected async initialise(
    options: Options,
    prevInstance?: SchematicsService
  ) {
    // console.log(`options :>> `, options)

    /** we can skip the resolving of plugins after initial instance.
     * Also, it is necessary when calling to .runSchematic for workflow.engine to be consistent
     * */
    if (prevInstance) {
      this.workflow = prevInstance.workflow;
      this.schematicsMap = prevInstance.schematicsMap;
    } else {
      const { workflow, schematicsMap } = await this.setupSchematics(options);
      this.workflow = workflow;
      this.schematicsMap = schematicsMap;
      this.registerTasks({ workflow: this.workflow });
    }

    // DO NOT MOVE THE HOST_ROOT FOLDER. THIS STAYS AT DESTINATIONPATH ALWAYS

    // however, the workingPath must be heeded
    // console.log(`host :>> `, this.workflow._host._root);
    // this.workflow._host._root = path.join(
    //   this.options.destinationPath.original,
    //   this.options.workingPath
    // );
    // console.log(`host2 :>> `, this.workflow._host._root);

    // const schematicsMap = this.findAllSchematicsCollections()
    // this.workflow = this.createWorkflow({
    //   dryRun: false,
    //   force: true,
    //   destinationPath: this.options.context.workspacePath,
    // });
    // this.setupSchematics({ workflow: this.workflow });
    // this.registerServicesAsTasks({context, workflow: this.workflow});
  }

  /**
   Runs a schematic directly, no workflow involvement. This returns an observer so can be merged into
   an existing tree
   */
  runExternalSchematic({
    address,
    schematicContext,
    schematicOptions,
    tree,
    executionOptions,
  }:
  {
    address: AddressPackageScaffoldIdentString;
    schematicContext: SchematicContext;
    schematicOptions: Record<PropertyKey, unknown>;
    tree: Tree;
    executionOptions?: Partial<ExecutionOptions>;
  }): Promise<Tree> {
    const schematicsMapEntry = this.schematicsMap.get(address);
    if (!this.workflow) {
      throw new Error(`Cannot runExternal without an existing workflow`);
    }
    if (!schematicsMapEntry) {
      throw new Error(`Schematics '${address}' cannot be ran as runExternal`);
    }

    const collection = this.workflow.engine.createCollection(
      schematicsMapEntry.collectionPath.original,
      // @ts-ignore
      schematicContext.schematic.collection
    ) as Collection<{}, {}>;
    const schematic = collection.createSchematic(
      schematicsMapEntry.address.parts.params.get("namespace")!
    );

    // const tmpHosts =
    //   new virtualFs.ScopedHost(
    //     new NodeJsSyncHost(),
    //     this.options.destinationPath.original as any
    //   )
    // const tmpHostsTree = new HostCreateTree(
    //   new virtualFs.ScopedHost(
    //     new NodeJsSyncHost(),
    //     this.options.destinationPath.original as any
    //   )
    // );

    // schematicContext.


    // from(flushToFsSinks).pipe(
    //   concatMap((sink) => sink.commit(tree)),
    //   ignoreElements(),
    // )

    const prevSchematicWithSink = this.attachFlushSinksToSchematic(
      of(tree),
      "commit"
    );
    return prevSchematicWithSink
      .toPromise()
      .then(() => {
        const nextSchematic = schematic.call(
          schematicOptions,
          // observableOf(tmpTree),
          observableOf(branch(tree)),
          // observableOf(branch(tree)),
          schematicContext,
          executionOptions
        );

        // will produce an observable stream of a single tree event. We can then take the first and build
        // a new tree from the fs because the process may have written to it directly (i.e. git client etc)
        const nextSchematicWithFsTree = nextSchematic.pipe(
          last(),
          map((x) => {
            const externalSchematicTree = new HostCreateTree(
              new virtualFs.ScopedHost(
                new NodeJsSyncHost(),
                this.options.destinationPath.original as any
              )
            );
            // externalSchematicTree._cache = tree._cache // hacky way to roll back the staging area
            // get a diff of existing tree and this new one to know what the externalSchematic actually did
            return externalSchematicTree;
          })
        );

        // const nextSchematicWithSink = attachFlushSinksToSchematic(
        //   of(tmpHostsTree)
        // );
        const nextSchematicWithSink = this.attachFlushSinksToSchematic(
          nextSchematicWithFsTree,
          "report"
        ); // don't commit the changes as already there, duh. Workflow reporting only
        return nextSchematicWithSink
          .pipe(
            takeLast(1),
            // catchError(() => EMPTY),
            // map(x => EMPTY),
            // ignoreElements()
            map((x) => {
              tree.merge(x, MergeStrategy.AllowOverwriteConflict);
              return tree;
            })
          )
          .toPromise();
      })
      .then(() => tree);
  }

  /**
   Runs a rule with same semantics as .runExternalSchematic. This does not change the
   schematicContext, collection etc - it simply ensures that the tree is flushed to fs before execution

   inspiration - https://github.com/angular/angular-cli/blob/8095268fa4e06c70f2f11323cff648fc6d4aba7d/packages/angular_devkit/schematics/testing/schematic-test-runner.ts#L133
   */
  runExternalSchematicRule({
    schematicRule,
    schematicContext,
    tree,
  }: // parentContext,
  {
    schematicRule: Rule;
    schematicContext: SchematicContext;
    tree: Tree;
  }): Promise<Tree> {

    const prevSchematicWithSink = this.attachFlushSinksToSchematic(
      of(tree),
      "commit"
    );

    return prevSchematicWithSink
      .toPromise()
      .then(() => {
        const nextSchematic = callRule(
          schematicRule,
          tree,
          schematicContext,
        );

        // will produce an observable stream of a single tree event. We can then take the first and build
        // a new tree from the fs because the process may have written to it directly (i.e. git client etc)
        const nextSchematicWithFsTree = nextSchematic.pipe(
          last(),
          map((x) => {
            const externalSchematicTree = new HostCreateTree(
              new virtualFs.ScopedHost(
                new NodeJsSyncHost(),
                this.options.destinationPath.original as any
              )
            );
            // externalSchematicTree._cache = tree._cache // hacky way to roll back the staging area
            // get a diff of existing tree and this new one to know what the externalSchematic actually did
            return externalSchematicTree;
          })
        );

        // const nextSchematicWithSink = attachFlushSinksToSchematic(
        //   of(tmpHostsTree)
        // );
        const nextSchematicWithSink = this.attachFlushSinksToSchematic(
          nextSchematicWithFsTree,
          "report"
        ); // don't commit the changes as already there, duh. Workflow reporting only
        return nextSchematicWithSink
          .pipe(
            takeLast(1),
            // catchError(() => EMPTY),
            // map(x => EMPTY),
            // ignoreElements()
            map((x) => {
              tree.merge(x, MergeStrategy.AllowOverwriteConflict);
              return tree;
            })
          )
          .toPromise();
      })
      .then(() => tree);
  }

  async runSchematic({
    address,
    context,
    options,
  }:
  {
    address: AddressPackageScaffoldIdentString;
    context: Context;
    options: Record<PropertyKey, unknown>;
  }): Promise<
    Result<
      { destinationPath: AddressPathAbsolute },
      | BacError<MessageName.SCHEMATICS_INVALID_ADDRESS>
      | BacError<MessageName.SCHEMATICS_NOT_FOUND>
      | BacError<MessageName.SCHEMATICS_ERROR>
    >
  > {
    if (!xfs.existsPromise(this.options.context.workspacePath.address)) {
      return {
        success: false,
        res: new BacError(
          MessageName.SCHEMATICS_ERROR,
          `DestinationPath '${this.options.destinationPath.original}' must exist before scaffolding`
        ),
      };
    }

    const schematicPath = addr.parseAsType(address, "scaffoldIdentPackage", {
      strict: false,
    });
    if (!schematicPath) {
      return {
        res: new BacError(
          MessageName.SCHEMATICS_INVALID_ADDRESS,
          `Invalid schematic address '${address}'`
        ),
        success: false,
      };
    }

    const schematicMapEntry = this.schematicsMap.get(
      schematicPath.addressNormalized
    );

    if (!schematicMapEntry) {
      return {
        res: new BacError(
          MessageName.SCHEMATICS_NOT_FOUND,
          `Schematic not found at address '${
            schematicPath.original
          }'. Available: '${Array.from(this.schematicsMap.keys())
            .map((schematicPath) => schematicPath)
            .join(", ")}'`
        ),
        success: false,
      };
    }

    const debug = true; // @todo - make available from oclif
    const allowPrivate = true; // @todo - make available from oclif

    // Indicate to the user when nothing has been done. This is automatically set to off when there's
    // a new DryRunEvent.
    // let nothingDone = true;
    this.runCache = {
      nothingDone: true,
      loggingQueue: [],
      error: false,
    };

    const workflow = this.workflow;

    context.logger(
      `Running schematic '${schematicMapEntry.address.addressNormalized}'. Collection path: '${schematicMapEntry.collectionPath.original}', DestinationPath: '${this.options.destinationPath.original}'`,
      "info"
    );

    /**
     *  Execute the workflow, which will report the dry run events, run the tasks, and complete
     *  after all is done.
     *
     *  The Observable returned will properly cancel the workflow if unsubscribed, error out if ANY
     *  step of the workflow failed (sink or task), with details included, and will only complete
     *  when everything is done.
     */
    try {
      await workflow
        .execute({
          collection: schematicMapEntry.collectionPath.original,
          schematic: schematicMapEntry.address.parts.params.get("namespace")!,
          // options,
          options: {
            ...options,
            _bacContext: context,
          },

          // parentContext: (this.workflow as any)?._context,
          // collection: collectionName,
          // schematic: schematicName,
          // options: schematicOptions,

          allowPrivate: allowPrivate,
          debug: true,
          // logger: this.schematicsLogger, // IS THIS REQUIRED?!
        })
        .toPromise();

      if (this.runCache.nothingDone) {
        context.logger("Nothing to be done.", "info");
      } else if (this.options.dryRun) {
        context.logger(`Dry run enabled. No files written to disk.`, "info");
      }

      return {
        res: { destinationPath: this.options.context.workspacePath },
        success: true,
      };
    } catch (err) {
      let message: string;
      if (err instanceof UnsuccessfulWorkflowExecution) {
        // "See above" because we already printed the error.
        message = "The Schematic workflow failed. See above.";
        // context.logger("The Schematic workflow failed. See above.", "error");
      } else if (debug && err instanceof Error) {
        message = `An error occured:\n${err.stack}`;
      } else {
        message = `Error: ${err instanceof Error ? err.message : err}`;
      }

      return {
        res: new BacErrorWrapper(
          MessageName.SCHEMATICS_ERROR,
          `${message}. Supplied path: '${schematicPath.original}'`,
          err as Error
        ),
        success: false,
      };
    }
  }

  /**
   We maintain a single workflow per oclif request due to our nested externalSchematics support
   */
  protected createWorkflow({
    schematicsCollectionMap,
    // logger,
    // destinationPath,
    // context,
  }: {
    schematicsCollectionMap: SchematicsCollectionsMap;
    // logger: logging.Logger;
    // destinationPath?: AddressPathAbsolute;
    // context: Context;
  }): NodeWorkflow {
    const scaffoldBase = path.resolve(__dirname, "../..");
    const cliRoot = process.cwd(); // todo make available through context
    const workflowRoot = addr.pathUtils.join(this.options.destinationPath, addr.parsePath(this.options.workingPath)).original as Path
    // const workflowRoot = (destinationPath?.original ?? process.cwd()) as Path;
    // const pluginRoots = context.oclifConfig.plugins.filter(p => p.type === 'core').map(p => p.root)

    // Logging queue that receives all the messages to show the users. This only get shown when no
    // errors happened.
    // let loggingQueue: string[] = [];
    // let error = false;
    // let nothingDone = true

    const fsHost = new virtualFs.ScopedHost(new NodeJsSyncHost(), workflowRoot);
    // const fsHost = new NodeJsSyncHost
    // fsHost._root = workflowRoot;


    const workflow = new NodeWorkflow(fsHost, {
      root: workflowRoot,
      // const workflow = new NodeWorkflow(workflowRoot, {
      force: this.options.force,
      dryRun: this.options.dryRun,
      // resolvePaths: [process.cwd(), scaffoldBase],
      resolvePaths: [scaffoldBase, cliRoot], // not sure what this does just yet
      schemaValidation: false,
      // schemaValidation: true,
      packageManager: "pnpm", // https://github.com/angular/angular-cli/blob/d15d44d3a4fcc7727fb87a005fa383b58cefae91/packages/angular_devkit/schematics_cli/bin/schematics.ts#L163
      engineHostCreator: (options: NodeWorkflowOptions) => {
        /** an engine host resolves a schematic collection request (strings) to a place on the fs (i.e. where its collection.json resides) */
        let engineHost = new NodeModulesEngineHost(options.resolvePaths);

        // const schematicsMap = createSchematicsMap(schematicsCollectionMap, engineHost)

        engineHost = Object.assign(engineHost, {
          /** we already know the locations of our plugin schematic collections. Source - https://github.com/angular/angular-cli/blob/cb9ee245d11110fcbf5e207a93db9f27f27edb28/packages/angular_devkit/schematics/tools/node-module-engine-host.ts#L36 */
          resolve(
            this: NodeModulesEngineHost,
            name: string,
            requester?: string,
            references = new Set<string>()
          ): string {
            // const schematicsMap = createSchematicsMap(schematicsCollectionMap, this)
            // const schematicsMapEntry = schematicsMap.get(name)
            const schematicsCollectionMapEntry =
              schematicsCollectionMap.get(name);
            if (!schematicsCollectionMapEntry) {
              // console.log(`name, requester, references, schematicsMapEntry, schematicsCollectionMap :>> `, name, requester, references, schematicsCollectionMapEntry, schematicsCollectionMap)
              throw new NodePackageDoesNotSupportSchematics(name);
            }

            // return engineHost.resolve(name, requester, references)
            // console.log(`schematicsCollectionMapEntry.collectionsPath.original :>> `, schematicsCollectionMapEntry.collectionPath.original)
            return schematicsCollectionMapEntry.collectionPath.original;
          },
        });

        // engineHost.resolve = (name: string, requester?: string, references = new Set<string>()): string => {
        //     console.log(`name, requester, references :>> `, name, requester, references)
        //     const schematicsMapEntry = schematicsMap.get(name)
        //     console.log(`schematicsMapEntry :>> `, schematicsMapEntry)
        //     // throw new NodePackageDoesNotSupportSchematics(name);
        //     return engineHost.resolve(name, requester, references)
        //   }
        return engineHost;
        // return {} as any
      },
    });

    /**
     * Logs out dry run events.
     *
     * All events will always be executed here, in order of discovery. That means that an error would
     * be shown along other events when it happens. Since errors in workflows will stop the Observable
     * from completing successfully, we record any events other than errors, then on completion we
     * show them.
     *
     * This is a simple way to only show errors when an error occur.
     */
    const dedupeStack = new Set<string>([]);

    workflow.reporter.subscribe((event) => {
      this.runCache.nothingDone = false;
      // Strip leading slash to prevent confusion.
      const eventPath = event.path.startsWith("/")
        ? event.path.slice(1)
        : event.path;

      let pushable: string;

      if (event.kind === "error") {
        this.runCache.error = true;

        const desc =
          event.description == "alreadyExist"
            ? "already exists"
            : "does not exist";
        this.options.context.logger(`ERROR! ${eventPath} ${desc}.`, "error");
        return;
      }

      switch (event.kind) {
        case "update":
          pushable = `${colors.cyan("UPDATE")} ${eventPath} (${
            event.content.length
          } bytes)`;
          break;
        case "create":
          pushable = `${colors.green("CREATE")} ${eventPath} (${
            event.content.length
          } bytes)`;
          break;
        case "delete":
          pushable = `${colors.yellow("DELETE")} ${eventPath}`;
          break;
        case "rename":
          const eventToPath = event.to.startsWith("/")
            ? event.to.slice(1)
            : event.to;
          pushable = `${colors.blue("RENAME")} ${eventPath} => ${eventToPath}`;
          break;
        default:
          throw new Error("WUT");
      }

      if (dedupeStack.has(pushable)) {
        return;
      }
      dedupeStack.add(pushable);
      this.runCache.loggingQueue.push(pushable);
    });

    /**
     * Listen to lifecycle events of the workflow to flush the logs between each phases.
     */
    workflow.lifeCycle.subscribe((event) => {
      if (event.kind == "workflow-end" || event.kind == "post-tasks-start") {
        if (!this.runCache.error) {
          // Flush the log queue and clean the error state.
          this.runCache.loggingQueue.forEach((log) =>
            this.options.context.logger(log, "info")
          );
        }
        this.runCache.loggingQueue = [];
        this.runCache.error = false;
      }
      this.options.context.logger(`schematicsService: lifecycle '${event.kind}'`, "debug");
    });

    // Show usage of deprecated options
    workflow.registry.useXDeprecatedProvider((msg) =>
      this.options.context.logger(msg, "warn")
    );

    return workflow;
  }

  protected attachFlushSinksToSchematic(
    tree$: Observable<Tree>,
    action: "commit" | "report"
  ): Observable<Tree> {
    const createFlushToFsSinks = (): Sink[] => {
      let error = false;

      // flush the existing tree...
      // const progressSink = new HostSink(tmpHosts, true)
      const dryRunSink = new DryRunSink(this._host, this.options.force);
      const dryRunSubscriber = dryRunSink.reporter.subscribe((event) => {
        if (action === "report") {
          this.workflow._reporter.next(event);
        }
        error = error || event.kind == "error";
      });
      return [
        dryRunSink,
        {
          commit() {
            dryRunSubscriber.unsubscribe();
            if (error) {
              return throwError(new UnsuccessfulWorkflowExecution());
            }

            return of();
          },
        },
        ...(action === "commit"
          ? [new HostSink(this.workflow._host, this.options.force)]
          : []),
      ];
    };

    const flushToFsSinks = createFlushToFsSinks();

    return from(flushToFsSinks).pipe(
      concatMap((sink) => {
        return tree$.pipe(
          concatMap((tree) => {
            // console.log(`tree :>> `, tree)
            // if (tree.actions) {
            return sink.commit(tree);
            // }
          })
        );
        // return of()
      }),
      ignoreElements()
    );
  };

  protected async registerTasks({ workflow }: { workflow: NodeWorkflow }) {
    this.options.context.logger(`registerServicesAsTasks: registering tasks`);

    const taskExecutorFactory: TaskExecutorFactory<{ rootDirectory: string }> =
      // very vanilla factory-level params; we'll be creating the services per usage
      // Parameters<ServicesStatic[typeof serviceName]["initialise"]>
      {
        name: "service-exec",
        create: (options) =>
          import("../").then((mod) => mod.serviceExecExecutor(options!)),
        // create: (options) => import('../schematics/tasks/service-exec/executor').then((mod) => mod.default(options!)),
      };

    workflow.engineHost.registerTaskExecutor(taskExecutorFactory, {
      // context,
      rootDirectory: this.options.destinationPath.original,
      // rootDirectory: root && getSystemPath(root),
    });
    // console.log(`workflow.engineHost :>> `, workflow.engineHost);
  }

  // context.logger(`registerServicesAsTasks: registering '${context.}' services`)
  // need to register the cb here somehow ¯\_(ツ)_/¯
  // }

  // /**
  //  In order to integrate services with schematics, we can register the services as tasks
  //  */
  // protected async registerServicesAsTasks({context, workflow, destinationPath}: {context: Context, workflow: NodeWorkflow, destinationPath: AddressPathAbsolute}) {

  //   const registerServiceAsTask = ({
  //     serviceName,
  //   }: {
  //     serviceName: keyof ServicesStatic;
  //   }) => {
  //     context.logger(
  //       `registerServicesAsTasks: registering service '${serviceName}' as schematic task`
  //     );

  //     const taskExecutor: TaskExecutorFactory<
  //       Parameters<ServicesStatic[typeof serviceName]["initialise"]>
  //     > = {
  //       name: serviceName,
  //       create: (serviceOptions: Parameters<ServicesStatic[typeof serviceName]["initialise"]>) =>
  //         Promise.resolve().then(() => {
  //           return context.serviceFactory(serviceName, serviceOptions)
  //         }).then((service) => {
  //           console.log(`:>> HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH`, serviceOptions);

  //           const executor: TaskExecutor = async (options) => {
  //             console.log(`WITHIN EXECUTOR '${serviceName}' options, serviceOptions, service :>> `, options, serviceOptions, service)
  //           }
  //           return executor
  //         })
  //           // const service = context.serviceFactory(serviceName, serviceOptions);
  //           // return service as unknown as TaskExecutor;
  //         // Promise.resolve().then(() => {
  //         //   console.log(`:>> HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH`, serviceOptions);

  //         //   const service = context.serviceFactory(serviceName, serviceOptions);
  //         //   const executor: TaskExecutor = async (options) => {
  //         //     console.log(`WITHIN EXECUTOR '${serviceName}' options, service :>> `, options, service)
  //         //   }
  //         //   return executor
  //         //   // return service as unknown as TaskExecutor;
  //         // }),
  //     };
  //     workflow.engineHost.registerTaskExecutor(taskExecutor, [{ context, destinationPath
  //       // rootDirectory: root && getSystemPath(root),
  //     }]);
  //   };

  //   for (const serviceName of context.serviceFactory.availableServices) {
  //     registerServiceAsTask({serviceName})
  //   }

  //   console.log(`workflow.engineHost :>> `, workflow.engineHost)

  //   // context.logger(`registerServicesAsTasks: registering '${context.}' services`)
  //   // need to register the cb here somehow ¯\_(ツ)_/¯
  // }

  /** resolves collection.json locations of any plugins */
  protected findAllSchematics({
    context,
    // logger,
    schematicsCollectionsMap,
    workflow,
  }: {
    context: Context;
    // logger: logging.Logger;
    schematicsCollectionsMap: SchematicsCollectionsMap;
    workflow: NodeWorkflow;
  }): SchematicsMap {
    return Array.from(schematicsCollectionsMap.values()).reduce(
      (acc, { plugin, collectionPath, address: collectionAddress }) => {
        // const collectionPath = addr.pathUtils.join(
        //   addr.parsePath(plugin.root),
        //   addr.parsePath("collection.json")
        // ) as AddressPathAbsolute;
        try {
          const collection = workflow.engine.createCollection(
            collectionPath.original
          );

          // const collection = engineHost.(
          //   collectionPath.original
          // );
          if (collection) {
            for (const publicSchematicName of collection.listSchematicNames(
              false
            )) {
              const addressTemplate = addr.parseAsType(
                `${plugin.name}#namespace=${publicSchematicName}`,
                "scaffoldIdentPackage"
              );
              acc.set(addressTemplate.addressNormalized, {
                plugin,
                collection,
                collectionPath,
                address: addressTemplate,
              });
            }
          }
        } catch (err) {
          console.log(
            ` err, collectionPath :>> `,
            err,
            collectionPath.original
          );
          context.logger(
            `schematic collection path '${collectionPath.original}' unresolvable`,
            "debug"
          );
          // logger.debug(
          //   `schematic collection path '${collectionPath.original}' unresolvable`
          // );
          // unresolvable collection
        }
        return acc;
      },
      new Map() as SchematicsMap
    );
  }

  /** resolves collection.json locations of any plugins */
  protected findAllSchematicsCollections({
    context,
  }: // logger,
  {
    context: Context;
    // logger: logging.Logger;
  }): SchematicsCollectionsMap {
    try {
      // const cliCollection = workflow.engine.createCollection(path.join(cliRoot, 'collection.json'));

      return context.oclifConfig.plugins.reduce((acc, plugin) => {
        const collectionPath = addr.pathUtils.join(
          addr.parsePath(plugin.root),
          addr.parsePath("collection.json")
        ) as AddressPathAbsolute;
        // console.log(`collectionPath.address :>> `, collectionPath.address)
        if (!xfs.existsSync(collectionPath.address)) {
          // console.log(`schematic collection path '${collectionPath.original}' unresolvable`)
          // logger.debug(
          //   `schematic collection path '${collectionPath.original}' unresolvable`
          //   );
          context.logger(
            `schematic collection path '${collectionPath.original}' unresolvable`,
            "debug"
          );
        } else {
          // const addressTemplate = addr.parseAsType(
          //   // collectionPath.original,
          //   `${plugin.name}#namespace=${publicSchematicName}`,
          //   "scaffoldIdentPackage"
          // );
          const addressTemplate = addr.parsePackage(
            // collectionPath.original,
            plugin.name
            // `${plugin.name}#namespace=${publicSchematicName}`,
          );
          acc.set(collectionPath.original, {
            plugin,
            // collection,
            collectionPath,
            address: addressTemplate,
          });
        }
        return acc;
      }, new Map() as SchematicsCollectionsMap);

      // // can use the cli collection as the base 'requester' within schematics..
      // console.log(`cliCollection :>> `, cliCollection, cliCollection._engine._host)
      // const collection = workflow.engine.createCollection('scaffold-collection', cliCollection); // nodeHostEngine will traverse the resolveRoots looking for json files

      // console.log(`collection :>> `, collection)
      // logger.info(collection.listSchematicNames().join('\n'));
    } catch (error) {
      // logger.fatal(error instanceof Error ? error.message : `${error}`);
      context.logger(
        error instanceof Error ? error.message : `${error}`,
        "fatal"
      );
      throw error;
    }
  }
  // protected findAllSchematics({
  //   workflow,
  //   context,
  //   logger,
  // }: {
  //   workflow: NodeWorkflow;
  //   context: Context;
  //   logger: logging.Logger;
  // }): SchematicsMap {
  //   try {
  //     // const cliCollection = workflow.engine.createCollection(path.join(cliRoot, 'collection.json'));

  //     return context.oclifConfig.plugins.reduce((acc, plugin) => {
  //       const collectionPath = addr.pathUtils.join(
  //         addr.parsePath(plugin.root),
  //         addr.parsePath("collection.json")
  //       ) as AddressPathAbsolute;
  //       try {
  //         const collection = workflow.engine.createCollection(
  //           collectionPath.original
  //         );
  //         if (collection) {
  //           for (const publicSchematicName of collection.listSchematicNames(
  //             false
  //           )) {
  //             const addressTemplate = addr.parseAsType(
  //               `${plugin.name}#namespace=${publicSchematicName}`,
  //               "scaffoldIdentPackage"
  //             );
  //             acc.set(addressTemplate.addressNormalized, {
  //               plugin,
  //               collection,
  //               collectionPath,
  //               address: addressTemplate,
  //             });
  //           }
  //         }
  //       } catch (err) {
  //         context.logger(
  //           `schematic collection path '${collectionPath.original}' unresolvable`,
  //           "debug"
  //         );
  //         // unresolvable collection
  //       }
  //       return acc;
  //     }, new Map() as SchematicsMap);

  //     // // can use the cli collection as the base 'requester' within schematics..
  //     // console.log(`cliCollection :>> `, cliCollection, cliCollection._engine._host)
  //     // const collection = workflow.engine.createCollection('scaffold-collection', cliCollection); // nodeHostEngine will traverse the resolveRoots looking for json files

  //     // console.log(`collection :>> `, collection)
  //     // logger.info(collection.listSchematicNames().join('\n'));
  //   } catch (error) {
  //     logger.fatal(error instanceof Error ? error.message : `${error}`);
  //     throw error;
  //   }
  // }

  // https://github.com/angular/angular-cli/blob/d15d44d3a4fcc7727fb87a005fa383b58cefae91/packages/angular_devkit/schematics_cli/bin/schematics.ts#L220
  protected async setupSchematics(
    options: ServiceInitialiseOptions
  ): Promise<{ workflow: NodeWorkflow; schematicsMap: SchematicsMap }> {
    // const verbose = true; // @todo - make available from oclif

    // /** @todo - integrate with oclif somehow */
    // const setupLogger = (): logging.Logger => {
    //   /** Create the DevKit Logger used through the CLI. */
    //   const logger = createConsoleLogger(
    //     verbose ?? true,
    //     process.stdout,
    //     process.stderr,
    //     {
    //       info: (s) => s,
    //       debug: (s) => s,
    //       warn: (s) => colors.bold.yellow(s),
    //       error: (s) => colors.bold.red(s),
    //       fatal: (s) => colors.bold.red(s),
    //     }
    //   );
    //   return logger;
    // };
    // const logger = setupLogger();

    const schematicsCollectionsMap = this.findAllSchematicsCollections({
      ...options,
      // logger,
    });
    const workflow = this.createWorkflow({
      schematicsCollectionMap: schematicsCollectionsMap,
      // logger,
      ...options,
    });
    const schematicsMap = this.findAllSchematics({
      ...options,
      // logger,
      schematicsCollectionsMap,
      workflow,
    });
    // this.schematicsLogger = logger;

    // logger.debug(`schematicsService::setupSchematics: found '${schematicsMap.size}' schematics '${Array.from(schematicsMap.values()).map(s => s.address.original).join(', ')}'`)
    options.context.logger(
      `schematicsService::setupSchematics: found '${
        schematicsMap.size
      }' schematics '${Array.from(schematicsMap.values())
        .map((s) => s.address.original)
        .join(", ")}'`,
      "debug"
    );

    return {
      workflow,
      schematicsMap,
    };
  }

  static something() {}
  async somethingelse() {}
}
