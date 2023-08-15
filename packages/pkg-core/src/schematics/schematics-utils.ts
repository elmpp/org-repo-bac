import { join, normalize, Path, virtualFs } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import { Host } from "@angular-devkit/core/src/virtual-fs/host";
import {
  HostCreateTree,
  HostDirEntry,
  MergeStrategy,
  Rule,
  SchematicContext,
  TaskConfigurationGenerator,
  Tree,
} from "@angular-devkit/schematics";
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { BacErrorWrapper, MessageName } from "@business-as-code/error";
import path from "path";
import { from } from "rxjs";
import { schematicUtils } from ".";
import {
  Context,
  ServiceInitialiseOptions,
  ServiceMap,
  ServiceStaticMap,
} from "../__types__";
import fs from 'fs'
import { SchematicsResettableHostTree } from "./schematics-resettable-host-tree";
import { ServiceExecTask } from "./tasks";

// import { Options as Options } from "./tasks/service-exec/options";

export interface ServiceOptions<SName extends keyof ServiceStaticMap> {
  cb: (options: {
    service: ServiceMap[SName][number];
    serviceName: SName;
  }) => Promise<any>;
  // }) => ReturnType<TaskExecutor<ServiceExecTaskOptions>>;
  serviceName: SName;
  initialiseOptions: ServiceInitialiseOptions<SName>;
  // initialiseOptions: ServiceInitialiseCommonOptions;
  // initialiseOptions: ServiceInitialiseOptions;
  // workingPath: AddressPathRelative
  context: Context;
}
export type ServiceOptionsLite<SName extends keyof ServiceStaticMap> = Omit<
  ServiceOptions<SName>,
  "initialiseOptions"
> & {
  initialiseOptions: Omit<
    ServiceOptions<SName>["initialiseOptions"],
    "context" | "workspacePath"
  >;
};

/**
 naughty naughty
 @internal
 */
export function getEngineHost(
  context: SchematicContext
): Host & { _root: string } {
  return (context.engine.workflow as any)._host;
}

export const getHostRoot = (
  context: SchematicContext
): AddressPathAbsolute => {
  return addr.parsePath(
    (context.engine.workflow as any)?._host?._root!
  ) as AddressPathAbsolute;
};

function wrapServiceCbAsRule<SName extends keyof ServiceMap>({
  serviceOptions,
}: {
  serviceOptions: ServiceOptions<SName>;
}): Rule {
  return (tree: Tree, schematicContext: SchematicContext) => {
    const { serviceName, initialiseOptions, cb, context } = serviceOptions;

    return from(
      context!
        .serviceFactory(serviceName, initialiseOptions)
        .then((service) => cb({ service, serviceName }))
        .then(() => tree)
    );
  };
}

export const wrapServiceAsRule = <SName extends keyof ServiceMap>({
  serviceOptions,
  schematicContext,
}: {
  serviceOptions: ServiceOptionsLite<SName>;
  // serviceInitialiseOptions: Omit<ServiceOptions<SName>, "options"> & {
  //   options:(IsEmptyObject<
  //     Omit<
  //       Parameters<ServicesStatic[SName]["initialise"]>[0],
  //       keyof ServiceInitialiseOptions
  //     >
  //   > extends true
  //     ? Record<never, any>
  //     : Omit<
  //         Parameters<ServicesStatic[SName]["initialise"]>[0],
  //         keyof ServiceInitialiseOptions
  //       >) & {workingPath?: string};
  // },
  schematicContext: SchematicContext;
}): Rule => {
  const options: ServiceOptions<SName> = {
    ...serviceOptions,
    /** due to ServiceInitialiseOptions we can do derive here based on the Schematic workflow engine host */
    initialiseOptions: {
      ...serviceOptions.initialiseOptions,
      context: serviceOptions.context,
      workspacePath: getHostRoot(schematicContext),
    },
  };
  return wrapServiceCbAsRule({ serviceOptions: options });
};

export const wrapServiceAsTask = <SName extends keyof ServiceMap>({
  serviceOptions,
  schematicContext,
}: {
  serviceOptions: ServiceOptionsLite<SName>;
  // serviceInitialiseOptions: Omit<ServiceOptions<SName>, "options"> & {
  //   options:(IsEmptyObject<
  //     Omit<
  //       Parameters<ServicesStatic[SName]["initialise"]>[0],
  //       keyof ServiceInitialiseOptions
  //     >
  //   > extends true
  //     ? Record<never, any>
  //     : Omit<
  //         Parameters<ServicesStatic[SName]["initialise"]>[0],
  //         keyof ServiceInitialiseOptions
  //       >) & {workingPath?: string};
  // },
  schematicContext: SchematicContext;
}): TaskConfigurationGenerator<ServiceOptionsLite<SName>> => {
  const options: ServiceOptions<SName> = {
    ...serviceOptions,
    /** due to ServiceInitialiseOptions we can do derive here based on the Schematic workflow engine host */
    initialiseOptions: {
      ...serviceOptions.initialiseOptions,
      context: serviceOptions.context,
      workspacePath: getHostRoot(schematicContext),
    },
  };

  return new ServiceExecTask(options);

  // return new class() {

  // }

  // return (tree: Tree, schematicContext: SchematicContext) => {
  //   const { serviceName, initialiseOptions, cb, context } = serviceOptions;

  //   return from(
  //     context!
  //       .serviceFactory(serviceName, initialiseOptions)
  //       .then((service) => cb({ service, serviceName }))
  //       .then(() => tree)
  //   );
  // };
};

// /**
//  Runs a service callback but ensures that previous Rules are flushed to disk
//  Returns a new Tree representing the output of the callback (cf Source)
//  */
// export const wrapExternalServiceAsSource = <SName extends keyof Services>({
//   serviceOptions: serviceOptionsLite,
//   schematicContext,
//   dryRun,
//   force,
// }: // workingPath,
// {
//   serviceOptions: ServiceOptionsLite<SName>;
//   schematicContext: SchematicContext;
//   dryRun?: boolean | undefined;
//   force?: boolean | undefined;
//   // workingPath: string;
// }): Source => {
//   const serviceOptions: ServiceOptions<SName> = {
//     ...serviceOptionsLite,
//     /** due to ServiceInitialiseOptions we can do derive here based on the Schematic workflow engine host */
//     initialiseOptions: {
//       ...serviceOptionsLite.initialiseOptions,
//       context: serviceOptionsLite.context,
//       destinationPath: getCurrentSchematicHostRoot(schematicContext),
//     },
//   };

//   return wrapExternalServiceCbAsSource({
//     serviceOptions,
//     dryRun,
//     force,
//     // workingPath,
//   });
// };

// /**
//  Runs a service callback but ensures that previous Rules are flushed to disk
//  */
// export const wrapExternalServiceAsRule = <SName extends keyof Services>({
//   serviceOptions: serviceOptionsLite,
//   schematicContext,
//   dryRun,
//   force,
// }: // workingPath,
// {
//   serviceOptions: ServiceOptionsLite<SName>;
//   schematicContext: SchematicContext;
//   dryRun?: boolean | undefined;
//   force?: boolean | undefined;
//   // workingPath: string;
// }): Rule => {
//   const serviceOptions: ServiceOptions<SName> = {
//     ...serviceOptionsLite,
//     /** due to ServiceInitialiseOptions we can do derive here based on the Schematic workflow engine host */
//     initialiseOptions: {
//       ...serviceOptionsLite.initialiseOptions,
//       context: serviceOptionsLite.context,
//       destinationPath: getCurrentSchematicHostRoot(schematicContext),
//     },
//   };
//   return wrapExternalServiceCbAsRule({
//     serviceOptions,
//     dryRun,
//     force,
//     // workingPath,
//   });
// };

/**
 Flushes to disk, branches the tree and merges the outcome of the wrapped rule
 */
export const flushBranchMerge = (
  rule: Rule,
  serviceOptions: {
    context: Context;
    initialiseOptions: ServiceOptionsLite<"schematics">["initialiseOptions"];
  }
  // mergeStrategy: MergeStrategy
): Rule => {
  return (tree: Tree, schematicContext: SchematicContext) => {
    // console.log(`serviceOptions :>> `, serviceOptions)

    // const debugFs = (schematicContext: SchematicContext) => {
    //   const liveFsTree = new HostCreateTree(
    //     // const liveFsTree = new HostCreateTree(
    //     new virtualFs.ScopedHost(
    //       new NodeJsSyncHost(),
    //       getCurrentSchematicHostRoot(schematicContext).original as any
    //     )
    //   );
    //   function getFsContents(tree: Tree, _context: SchematicContext) {
    //     const treeFiles: string[] = [];
    //     tree.visit((p) => treeFiles.push(p));
    //     return treeFiles;
    //   }
    //   return getFsContents(liveFsTree, schematicContext);
    // };

    const res = from(
      serviceOptions.context
        .serviceFactory("schematics", {
          ...serviceOptions.initialiseOptions,
          context: serviceOptions.context,
          workspacePath: serviceOptions.context.workspacePath, // ALWAYS pass along workspacePath in utils
          // workspacePath: getHostRoot(schematicContext),
        })
        .then((schematicsService) => {
          // console.log(
          //   `getFsContents(liveFsTree) 1 :>> `,
          //   debugFs(schematicContext),
          //   serviceOptions.initialiseOptions,
          // );

          // console.log(`applicableNextTree0, tree :>> `, tree)

          return schematicsService
            .flush({ tree, schematicContext })
            .then((t) => {
              // console.log(
              //   `getFsContents(liveFsTree) 2 :>> `,
              //   debugFs(schematicContext),
              //   serviceOptions.initialiseOptions,
              // );
              // we should be ok now to source a new host tree to run the wrapped Rule with
              // const nextInitialTree = schematicsService.createHostTree();

              // const nextInitialTree = new HostCreateTree(
              //   new virtualFs.ScopedHost(
              //     new NodeJsSyncHost(),
              //     // workflowHost,
              //     getCurrentSchematicHostRoot(schematicContext).original as any
              //     // tree._root,
              //   )
              // );
              // const nextInitialTree = new HostTree() NEED TO EXTEND THIS SO THAT IT CREATES A NON-READONLY _RECORD()
              // const nextInitialTree = new HostTree()

              // const applicableNextTree = new SchematicsResettableHostTree(getCurrentSchematicHostRoot(schematicContext).original);
              const applicableNextTree =
                SchematicsResettableHostTree.branchFromFs(
                  getHostRoot(schematicContext).original,
                  tree
                ) as Tree;
              // const applicableNextTree = tree
              // applicableNextTree.merge(tree, mergeStrategy)
              // console.log(`applicableNextTree1, tree :>> `, applicableNextTree, tree)

              // applicableNextTree.reset() // this is our custom reset() - @TODO could this be a .branch()?

              // const nextInitialTree = schematicsService.createHostTree();
              // const nextInitialTree = tree.branch();
              // nextInitialTree._record.reset()
              // console.log(`nextInitialTree :>> `, nextInitialTree.actions)
              // console.log(`nextInitialTree :>> `, nextInitialTree._record, nextInitialTree._record.records())
              // console.log(
              //   `getFsContents(liveFsTree) 3 :>> `,
              //   debugFs(schematicContext),
              //   serviceOptions.initialiseOptions,
              // );

              return schematicsService
                .runSchematicRule({
                  schematicContext,
                  schematicRule: rule,
                  tree: applicableNextTree,
                })
                .then((nextTree) => {
                  // nextTree._record.reset();

                  // console.log(
                  //   `getFsContents(liveFsTree) 4 :>> `,
                  //   debugFs(schematicContext),
                  //   serviceOptions.initialiseOptions,
                  // );

                  // const debugActions = (tree: Tree) => {
                  //   return tree.actions.map(
                  //     (a) =>
                  //       `tree$ index: '0'; kind: ${a.kind}; path: ${a.path}`
                  //   );
                  // };
                  // console.log(`nextTree preFlush actions :>> `, debugActions(nextTree));
                  return nextTree;

                  // return schematicsService.flush({
                  //   tree: nextTree,
                  //   action: "report",
                  // }).then(() => nextTree)
                })
                .then((nextTree) => {
                  return nextTree;
                  // return schematicsService
                  //   .flush({
                  //     tree: nextTree,
                  //     // action: "commit",
                  //     schematicContext,
                  //   })
                  //   .then(() => {
                  //     return nextTree

                  //     // const postRuleEmptyHostTree = new SchematicsResettableHostTree(getCurrentSchematicHostRoot(schematicContext).original, tree)
                  //     // // const postRuleEmptyHostTree = schematicsService.createHostTree()
                  //     // console.log(`postRuleEmptyHostTree :>> `, postRuleEmptyHostTree)
                  //     // return postRuleEmptyHostTree
                  //     // return nextTree
                  //   });
                })
                .then((nextTree) => {
                  // nextTree.merge(tree, mergeStrategy)

                  let applicableNextTree =
                    SchematicsResettableHostTree.branchFromFs(
                      getHostRoot(schematicContext).original,
                      nextTree
                    ) as Tree;
                  // let applicableNextTree = nextTree

                  // we absolutely need to merge this nextTree into the previous tree. This is because the tree can't be
                  // refreshed from disk and it must be complete for when we do operations like .move
                  // applicableNextTree.merge(nextTree)

                  // applicableNextTree.reset()

                  // however, although we want its cache, we do need to reset any ._record actions as they've just been flushed
                  // applicableNextTree._record.reset() // this is our custom reset() - @TODO could this be a .branch()?

                  // const debugActions = (tree: Tree) => {
                  //   return tree.actions.map(
                  //     (a) =>
                  //       `tree$ index: '0'; kind: ${a.kind}; path: ${a.path}`
                  //   );
                  // };
                  // console.log(`nextTree actions :>> `, debugActions(applicableNextTree));
                  return applicableNextTree;

                  // NEED A CUSTOM HOST+RECORD IMPLEMENTATION THAT WILL PREVENT THE ACTIONS BEING CARRIED ACROSS. MAYBE WITH A CUSTOM .clear()

                  // const nextInitialTree = new HostCreateTree(
                  //   new virtualFs.ScopedHost(
                  //     new NodeJsSyncHost(),
                  //     // workflowHost,
                  //     getCurrentSchematicHostRoot(schematicContext).original as any
                  //     // tree._root,
                  //   )
                  // );
                  // nextTree.merge(tree, mergeStrategy)
                  // return nextTree
                  // return t;
                  // tree.merge(nextTree, mergeStrategy)
                  // return tree;
                });
              // // return schematicsService.flush({ tree: nextTree, action: 'report' })
              // // .then(() => {
              // //   tree.merge(nextTree, mergeStrategy);
              // //   // console.log(`tree after :>> `, tree)
              // //   return tree;
              // // })
              // // console.log(`tree :>> `, tree)
              // // console.log(`nextTree :>> `, nextTree)

              // // now we have both trees available for merging...
              // // tree.merge(nextTree, mergeStrategy);
              // // console.log(`tree after :>> `, tree)
              // return tree;

              // // // tree.merge(nextTree, mergeStrategy);
              // // nextTree.merge(tree, mergeStrategy);
              // // // // console.log(`tree after :>> `, nextTree)
              // // return nextTree; // is branched from previous tree
              // });
            });
        })
    );
    return res;
  };
};

/**
 Branches the tree and merges the outcome of the wrapped rule
 */
export const branchMerge = (
  rule: Rule,
  serviceOptions: {
    context: Context;
    initialiseOptions: ServiceOptionsLite<"schematics">["initialiseOptions"];
  },
  mergeStrategy: MergeStrategy,
): Rule => {
  return (tree: Tree, schematicContext: SchematicContext) => {
    const res = from(
      serviceOptions.context
        .serviceFactory("schematics", {
          ...serviceOptions.initialiseOptions,
          context: serviceOptions.context,
          workspacePath: serviceOptions.context.workspacePath, // ALWAYS pass along workspacePath in utils
          // workspacePath: getHostRoot(schematicContext),
        })
        .then((schematicsService) => {
          return schematicsService
            .runSchematicRule({
              schematicContext,
              schematicRule: rule,
              tree,
            })
            .then((nextTree) => {
              let applicableNextTree =
                SchematicsResettableHostTree.branchFromTree(
                  // getCurrentSchematicHostRoot(schematicContext).original,
                  // tree,
                  nextTree,
                  mergeStrategy , // incoming changes will overwrite if existent
                ) as Tree;
              // console.log(`applicableNextTree.readText('./README.md') :>> `, applicableNextTree.readText('./README.md'))
              return applicableNextTree;
            });
        })
    );
    return res;
  };
};

// /** runs a separate schematic. Actually produces separate context which enables a task to be run - https://github.com/angular/angular-cli/blob/8095268fa4e06c70f2f11323cff648fc6d4aba7d/packages/angular_devkit/schematics/src/rules/schematic.ts#L21 */
// export function runExternalSchematic(options: {
//   address: AddressPackageScaffoldIdentString;
//   context: Context;
//   // destinationPath: AddressPathAbsolute;
//   schematicOptions: Record<PropertyKey, unknown> & { _bacContext: Context }; // @todo - type this somehow
//   dryRun?: boolean;
//   force?: boolean;
//   workingPath: string;
//   /** defines how the 2 trees are merged. Additional 'replace' variant will return the last. This means a full replacement! */
//   mergeStrategy?: MergeStrategy | "replace";
//   // workingPath: AddressPathRelative;
//   // options: ServiceInitialiseOptions,
//   // executionOptions?: Partial<ExecutionOptions>
// }): Rule {
//   return (tree: Tree, schematicContext: SchematicContext) => {
//     // const destinationPath = addr.pathUtils.join(getCurrentSchematicHostRoot(schematicContext), addr.parsePath(options.workingPath)) as AddressPathAbsolute

//     const res = from(
//       options.context
//         .serviceFactory("schematics", {
//           context: options.context,
//           destinationPath: getCurrentSchematicHostRoot(schematicContext),
//           workingPath: options.workingPath,
//         })
//         .then((schematicsService) =>
//           schematicsService.runExternalSchematic({
//             ...options,
//             tree,
//             schematicContext,
//           })
//         )
//     );
//     return res;
//   };
// }

// /**
//  Simply runs a Rule but, crucially, is flushed to disk with an optional merge strategy.
//  This allows for amending fs content
//  */
// export function runExternalRule(options: {
//   schematicRule: Rule;
//   context: Context;
//   // schematicOptions: Record<PropertyKey, unknown> & { _bacContext: Context }; // @todo - type this somehow
//   // dryRun?: boolean;
//   // force?: boolean;
//   workingPath: string;
//   // schematicContext: SchematicContext;
//   // tree: Tree;
//   /** defines how the 2 trees are merged. Additional 'replace' variant will return the last. This means a full replacement! */
//   mergeStrategy?: MergeStrategy | "replace";
// }): Rule {
//   return (tree: Tree, schematicContext: SchematicContext) => {
//     // const destinationPath = addr.pathUtils.join(getCurrentSchematicHostRoot(schematicContext), addr.parsePath(options.workingPath)) as AddressPathAbsolute

//     const res = from(
//       options.context
//         .serviceFactory("schematics", {
//           context: options.context,
//           destinationPath: getCurrentSchematicHostRoot(schematicContext),
//           workingPath: options.workingPath,
//         })
//         .then((schematicsService) =>
//           schematicsService.runExternalSchematicRule({
//             ...options,
//             tree,
//             schematicContext,
//           })
//         )
//     );
//     return res;
//   };
// }

/** SO - https://tinyurl.com/2b6rdw6j */
export function remove(
  filePath: string,
  tree: Tree,
  schematicContext: SchematicContext,
  originalPath?: string
): void {
  const originalRemovePath = originalPath ?? filePath;

  if (!originalPath) {
    schematicContext.logger.debug(
      `schematicUtils::remove: call made to remove '${filePath}'`
    );
  }

  if (!(tree instanceof SchematicsResettableHostTree)) {
    throw new Error(`Only custom tree type supported`);
  }

  /** this "double blind deletion" is seen to be effective, dunno why */
  const forceDelete = (path: string) => {
    try {
      tree.delete(path);
      tree.delete(path);
    } catch (err) {
      throw err;
      // console.log(`schematicUtils::remove: MEHMEH err :>> `, err);
    }
  };

  try {
    // as the tree only lists the files, this returns false for directories
    if (!tree.exists(filePath)) {
      // retrieve the directory corresponding to the path
      const dirEntry = tree.getDir(filePath);
      // if there are neither files nor dirs in the directory entry,
      // it means the directory does not exist
      if (!dirEntry.subdirs.length && !dirEntry.subfiles.length) {
        schematicContext.logger.debug(
          `schematicUtils::remove: ${filePath} does not exist. OriginalRemovePath: '${originalRemovePath}'`
        );
        // console.log(`dirEntry.subdirs, dirEntry , tree :>> `, dirEntry.subdirs, dirEntry , tree)

        // we do a cheeky forceDelete as this seems to effect changes to FS following wrapExternals
        // forceDelete(filePath) // NOPE!

        // otherwise, it exists, seriously !
      } else {
        schematicContext.logger.debug(
          `schematicUtils::remove: deleting files in directory ${filePath}. dirEntry found? ${!!dirEntry}. OriginalRemovePath: '${originalRemovePath}'`
        );
        dirEntry.subfiles.forEach((subFile) => {
          const subDirFilePath = path.join(filePath, subFile);
          // forceDelete(subDirFilePath)
          remove(subDirFilePath, tree, schematicContext, originalRemovePath);
        });
        dirEntry.subdirs.forEach((subDir) => {
          const subDirDirPath = path.join(filePath, subDir);
          remove(subDirDirPath, tree, schematicContext, originalRemovePath);
        });
        if (!originalPath) {
          schematicContext.logger.debug(
            `schematicUtils::remove: removing no-empty folder ${filePath}.`
          );
          // remove(filePath, tree, schematicContext, originalRemovePath) // try to remove the now-empty folder (only on tail of first call)
          // forceDelete(filePath) // try to remove the now-empty folder (only on tail of first call)

          // console.log(`tree._record._cache :>> `, tree._record._cache)

          tree.rmDir(dirEntry); // try to remove the now-empty folder (only on tail of first call)

          // tree._record.delete(filePath) // NEED A SUPERDUPER WAY OF DELETING TO THE FS HERE
        }
      }
      // if the file exists, delete it the easiest way
    } else {
      schematicContext.logger.debug(
        `schematicUtils::remove: deleting file ${filePath}. OriginalRemovePath: '${originalRemovePath}'`
      );
      // tree.delete(filePath);
      forceDelete(filePath); // double deletion seems to affect the filesystem (which is required with wrapExternal)
      schematicContext.logger.debug(
        `schematicUtils::remove: file ${filePath} deleted successfully. OriginalRemovePath: '${originalRemovePath}'`
      );
    }
  } catch (err) {
    // console.log(`schematicUtils::remove: err :>> `, err);
    throw new BacErrorWrapper(
      MessageName.UNNAMED,
      `schematicUtils::remove: Error occurred whilst deleting. OriginalRemovePath: '${originalRemovePath}'`,
      err as Error
    );
    // throw new Error(
    //   `schematicUtils::remove: Could not delete file, ${filePath}. OriginalRemovePath: '${originalRemovePath}'`
    // );
  }
}

/** original Schematics GH - https://github.com/angular/angular-cli/blob/137651645ca5e7f08cbcdc0d2c080e3518d6c908/packages/angular_devkit/schematics/src/rules/move.ts#L13 */
export function move(
  from: string,
  to: string,
  tree: Tree,
  schematicContext: SchematicContext
): void {
  if (to === undefined) {
    to = from;
    from = "/";
  }

  const fromPath = normalize("/" + from);
  const toPath = normalize("/" + to);

  if (fromPath === toPath) {
    return;
  }

  if (tree.exists(fromPath)) {
    schematicContext.logger.debug(
      `schematicUtils::move: folder ${fromPath} being renamed. fromPath: '${fromPath}' toPath: '${toPath}'`
    );

    // fromPath is a file
    tree.rename(fromPath, toPath);
  } else {
    schematicContext.logger.debug(
      `schematicUtils::move: dir ${fromPath} file's being individually renamed. fromPath: '${fromPath}' toPath: '${toPath}'`
    );

    const dirEntry = tree.getDir(fromPath);
    if (!(dirEntry instanceof HostDirEntry)) {
      throw new Error(`host dir does not exist '${fromPath}'`);
    }

    // console.log(`dirEntry :>> `, dirEntry)

    // fromPath is a directory
    dirEntry.visit((path) => {
      schematicContext.logger.debug(
        `schematicUtils::move: dir ${fromPath} -> ${path} being renamed. fromPath: '${path}' toPath: '${join(
          toPath,
          path.slice(fromPath.length)
        )}'`
      );
      tree.rename(path, join(toPath, path.slice(fromPath.length)));

      // const debugActions = (tree: Tree) => {
      //   return tree.actions.map(
      //     (a) =>
      //       `tree$ index: '0'; kind: ${a.kind}; path: ${a.path}`
      //   );
      // };
      // console.log(`tree.rename actions :>> `, debugActions(tree));
    });

    schematicContext.logger.debug(
      `schematicUtils::move: dir ${fromPath} being added to _renameDirs. fromPath: '${fromPath}' toPath: '${toPath}'`
    );

    (tree as SchematicsResettableHostTree).mvDir(fromPath, toPath);
  }

  return;
}

/** original Schematics GH - https://github.com/angular/angular-cli/blob/137651645ca5e7f08cbcdc0d2c080e3518d6c908/packages/angular_devkit/schematics/src/rules/move.ts#L13 */
export function copy(
  from: string,
  to: string,
  tree: Tree,
  schematicContext: SchematicContext
): void {
  if (to === undefined) {
    to = from;
    from = "/";
  }

  const fromPath = normalize("/" + from);
  const toPath = normalize("/" + to);

  if (fromPath === toPath) {
    return;
  }

  if (tree.exists(fromPath)) {

    schematicContext.logger.debug(
      `schematicUtils::copy: folder ${fromPath} being copied. fromPath: '${fromPath}' toPath: '${toPath}'`
    );

    // fromPath is a file
    tree.rename(fromPath, toPath);
  } else if (path.isAbsolute(from) && fs.existsSync(from)) {
    // console.log(`:>> 222`);
    schematicContext.logger.debug(
      `schematicUtils::copy: file ${fromPath} being copied from outside the tree. fromPath: '${fromPath}' toPath: '${toPath}'`
      );
      console.log(`schematicContext.strategy :>> `, schematicContext.strategy)
      if (tree.exists(toPath)) {
        tree.overwrite(to, fs.readFileSync(from, {encoding: 'utf8'}))
      }
      else {
        tree.create(to, fs.readFileSync(from, {encoding: 'utf8'}))
      }
      // if (schematicContext.strategy === MergeStrategy.Overwrite) {
      // }
      // else {
      //   tree.create(to, fs.readFileSync(from, {encoding: 'utf8'}))
      // }
    } else {
    // console.log(`:>> 333`);
    schematicContext.logger.debug(
      `schematicUtils::copy: directory ${fromPath} being individually copied. fromPath: '${fromPath}' toPath: '${toPath}'`
    );

    const dirEntry = tree.getDir(fromPath);
    if (!(dirEntry instanceof HostDirEntry)) {
      throw new Error(`host dir does not exist '${fromPath}'`);
    }

    // console.log(`dirEntry :>> `, dirEntry)

    // fromPath is a directory
    dirEntry.visit((path) => {
      tree.create(
        join(toPath, path.slice(fromPath.length)),
        tree.get(path)!.content
      );

      // const debugActions = (tree: Tree) => {
      //   return tree.actions.map(
      //     (a) =>
      //       `tree$ index: '0'; kind: ${a.kind}; path: ${a.path}`
      //   );
      // };
      // console.log(`tree.rename actions :>> `, debugActions(tree));
    });

    schematicContext.logger.debug(
      `schematicUtils::copy: directory ${fromPath} being individually copied COMPLETE. fromPath: '${fromPath}' toPath: '${toPath}'`
    );
  }

  return;
}

export function debugRule(
  options: Pick<
    schematicUtils.ServiceOptionsLite<"git">,
    "initialiseOptions" | "context"
  > & {withRealFs?: boolean}
): Rule {
  function getFsContents(tree: Tree) {
    const treeFiles: string[] = [];
    tree.visit((p) => treeFiles.push(p));
    return treeFiles;
  }
  function getTreeActions(tree: Tree): string[] {
    return tree.actions.map((a) =>
      a.kind === "r"
        ? `tree$ index: '0'; kind: ${a.kind}; fromPath: ${a.path} -> ${a.to}`
        : `tree$ index: '0'; kind: ${a.kind}; path: ${a.path}`
    );
  }

  return (tree: Tree, schematicContext: SchematicContext) => {
    const liveFsTree = new HostCreateTree(
      // const liveFsTree = new HostCreateTree(
      new virtualFs.ScopedHost(
        new NodeJsSyncHost(),
        schematicUtils.getHostRoot(schematicContext).original as Path,
      )
    );

    const debuggable: Record<string, any> = {
      cwd: getHostRoot(schematicContext).original,
      treeContents: getFsContents(tree),
      fsContents: getFsContents(liveFsTree),
      actions: getTreeActions(tree),
    };

    const withGitRule = wrapServiceAsRule({
      serviceOptions: {
        serviceName: "git",
        cb: async ({ service }) => {
          const repo = service.getRepository(false);
          if (repo) {
            // console.log(`service.get :>> `, service.getWorkingDestinationPath())
            // console.log(`repo.config :>> `, repo)

            debuggable.status = await repo.status();
            debuggable.branches = await repo.branch();
            debuggable.localBranches = await repo.branchLocal();
            debuggable.logs = await repo.log();
          }

          console.log(`debugRule: :>> `, debuggable);

          return tree;
        },
        ...options,
      },
      schematicContext,
    });

    return withGitRule;
  };
}
