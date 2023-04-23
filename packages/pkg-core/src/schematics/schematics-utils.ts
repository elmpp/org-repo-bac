import { Host } from "@angular-devkit/core/src/virtual-fs/host";
import {
  MergeStrategy,
  Rule,
  SchematicContext,
  Tree,
} from "@angular-devkit/schematics";
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { from } from "rxjs";
import {
  Context,
  ServiceInitialiseOptions,
  Services,
  ServicesStatic,
} from "../__types__";
import path from 'path'
import { join, normalize } from '@angular-devkit/core';
// import { Options as Options } from "./tasks/service-exec/options";

export interface ServiceOptions<SName extends keyof ServicesStatic> {
  cb: (options: {
    service: Services[SName];
    serviceName: SName;
  }) => Promise<any>;
  // }) => ReturnType<TaskExecutor<ServiceExecTaskOptions>>;
  serviceName: SName;
  initialiseOptions: ServiceInitialiseOptions;
  // initialiseOptions: ServiceInitialiseOptions;
  // workingPath: AddressPathRelative
  context: Context;
}
export type ServiceOptionsLite<SName extends keyof ServicesStatic> = Omit<
  ServiceOptions<SName>,
  "initialiseOptions"
> & {
  initialiseOptions: Omit<
    ServiceOptions<SName>["initialiseOptions"],
    "context" | "destinationPath"
  >;
};

/**
 naughty naughty
 @internal
 */
export function getSchematicsEngineHost(
  context: SchematicContext
): Host & { _root: string } {
  return (context.engine.workflow as any)._host;
}

const getCurrentSchematicHostRoot = (
  context: SchematicContext
): AddressPathAbsolute => {
  return addr.parsePath(
    (context.engine.workflow as any)?._host?._root!
  ) as AddressPathAbsolute;
};

function wrapServiceCbAsRule<SName extends keyof Services>({
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

export const wrapServiceAsRule = <SName extends keyof Services>({
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
      destinationPath: getCurrentSchematicHostRoot(schematicContext),
    },
  };
  return wrapServiceCbAsRule({ serviceOptions: options });
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
 Flushes to disk and merges the outcome of the wrapped rule
 */
export const mergeWithExternal = (
  rule: Rule,
  serviceOptions: {
    context: Context;
    initialiseOptions: ServiceOptionsLite<"schematics">["initialiseOptions"];
  },
  mergeStrategy: MergeStrategy
): Rule => {
  return (tree: Tree, schematicContext: SchematicContext) => {
    const res = from(
      serviceOptions.context
        .serviceFactory("schematics", {
          ...serviceOptions.initialiseOptions,
          context: serviceOptions.context,
          destinationPath: getCurrentSchematicHostRoot(schematicContext),
        })
        .then((schematicsService) =>
          schematicsService.flush({ tree, action: 'commit' }).then((t) => {
            // we should be ok now to source a new host tree to run the wrapped Rule with
            const nextInitialTree = schematicsService.createHostTree();
            // console.log(`nextInitialTree :>> `, nextInitialTree)

            return schematicsService
              .runSchematicRule({
                schematicContext,
                schematicRule: rule,
                tree: nextInitialTree,
              })
              .then((nextTree) => {
                // return schematicsService.flush({ tree: nextTree, action: 'report' })
                // .then(() => {
                //   tree.merge(nextTree, mergeStrategy);
                //   // console.log(`tree after :>> `, tree)
                //   return tree;
                // })
                // console.log(`tree :>> `, tree)
                // console.log(`nextTree :>> `, nextTree)

                // now we have both trees available for merging...
                tree.merge(nextTree, mergeStrategy);
                // console.log(`tree after :>> `, tree)
                return tree;

                // // tree.merge(nextTree, mergeStrategy);
                // nextTree.merge(tree, mergeStrategy);
                // // console.log(`tree after :>> `, nextTree)
                // return nextTree;
              });
          })
        )
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

  const originalRemovePath = originalPath ?? filePath

  /** this "double blind deletion" is seen to be effective, dunno why */
  const forceDelete = (path: string) => {
    try {
      tree.delete(path)
      tree.delete(path)
    }
    catch (err) {
      // console.log(`schematicUtils::remove: MEHMEH err :>> `, err);
    }
  }

  try {
    // as the tree only lists the files, this returns false for directories
    if (!tree.exists(filePath)) {
      // retrieve the directory corresponding to the path
      const dirEntry = tree.getDir(filePath);
      // if there are neither files nor dirs in the directory entry,
      // it means the directory does not exist
      if (!dirEntry.subdirs.length && !dirEntry.subfiles.length) {
        schematicContext.logger.info(`schematicUtils::remove: ${filePath} does not exist. OriginalRemovePath: '${originalRemovePath}'`);
        // console.log(`dirEntry.subdirs, dirEntry , tree :>> `, dirEntry.subdirs, dirEntry , tree)

        // we do a cheeky forceDelete as this seems to effect changes to FS following wrapExternals
        // forceDelete(filePath) // NOPE!

        // otherwise, it exists, seriously !
      } else {
        schematicContext.logger.info(
          `schematicUtils::remove: deleting files in directory ${filePath}. dirEntry found? ${!!dirEntry}. OriginalRemovePath: '${originalRemovePath}'`
        );
        dirEntry.subfiles.forEach((subFile) => {
          const subDirFilePath = path.join(filePath, subFile)
          // forceDelete(subDirFilePath)
          remove(subDirFilePath, tree, schematicContext, originalRemovePath)
        }
        );
        dirEntry.subdirs.forEach((subDir) => {
          const subDirDirPath = path.join(filePath, subDir)
          remove(subDirDirPath, tree, schematicContext, originalRemovePath)
        }
        );
        if (!originalPath) {
          remove(filePath, tree, schematicContext, originalRemovePath) // try to remove the now-empty folder (only on tail of first call)
        }
      }
      // if the file exists, delete it the easiest way
    } else {
      schematicContext.logger.debug(`schematicUtils::remove: deleting file ${filePath}. OriginalRemovePath: '${originalRemovePath}'`);
      // tree.delete(filePath);
      forceDelete(filePath); // double deletion seems to affect the filesystem (which is required with wrapExternal)
      schematicContext.logger.info(`schematicUtils::remove: file ${filePath} deleted successfully. OriginalRemovePath: '${originalRemovePath}'`);
    }
  } catch (err) {
    console.log(`schematicUtils::remove: err :>> `, err);
    throw new Error(`schematicUtils::remove: Could not delete file ${filePath}. OriginalRemovePath: '${originalRemovePath}'`);
  }
}

/** original Schematics GH - https://github.com/angular/angular-cli/blob/137651645ca5e7f08cbcdc0d2c080e3518d6c908/packages/angular_devkit/schematics/src/rules/move.ts#L13 */
export function move(
  from: string,
  to: string,
  tree: Tree,
  schematicContext: SchematicContext,
): void {

    if (to === undefined) {
      to = from;
      from = '/';
    }

    const fromPath = normalize('/' + from);
    const toPath = normalize('/' + to);

    if (fromPath === toPath) {
      return ;
    }


    if (tree.exists(fromPath)) {
      schematicContext.logger.info(`schematicUtils::move: folder ${fromPath} being renamed. fromPath: '${fromPath}' toPath: '${toPath}'`);

      // fromPath is a file
      tree.rename(fromPath, toPath);
    } else {
      schematicContext.logger.info(`schematicUtils::move: file ${fromPath} being individually renamed. fromPath: '${fromPath}' toPath: '${toPath}'`);

      // fromPath is a directory
      tree.getDir(fromPath).visit((path) => {
        tree.rename(path, join(toPath, path.slice(fromPath.length)));
      });

      schematicContext.logger.info(`schematicUtils::move: file ${fromPath} being individually renamed COMPLETE. fromPath: '${fromPath}' toPath: '${toPath}'`);
    }

    return
}
