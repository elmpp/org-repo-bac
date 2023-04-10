import { Host } from "@angular-devkit/core/src/virtual-fs/host";
import {
  branchAndMerge,
  ExecutionOptions,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  TaskConfigurationGenerator,
  TaskId,
  Tree,
} from "@angular-devkit/schematics";
import { branch } from "@angular-devkit/schematics/src/tree/static";
import {
  addr,
  AddressPackage,
  AddressPackageScaffoldIdentString,
  AddressPathAbsolute,
  AddressPathRelative,
} from "@business-as-code/address";
import { from, observable, Observable, of } from "rxjs";
import { map, last, take, skip, first, switchMap, tap } from "rxjs/operators";
import {
  assertIsOk,
  Context,
  IsEmptyObject,
  ServiceInitialiseOptions,
  Services,
  ServicesStatic,
} from "../__types__";
import { Options } from "./tasks/service-exec/options";

/** naughty naughty */
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

export function wrapTaskAsRule(
  task: TaskConfigurationGenerator<object>,
  dependencies?: TaskId[] | undefined
) {
  return (tree: Tree, schematicsContext: SchematicContext) => {
    schematicsContext.addTask(task, dependencies); // think this may just shunt it to the end of all Rules though?? ¯\_(ツ)_/¯
    return tree;
  };
}

export function wrapServiceCbAsRule<SName extends keyof Services>(
  options: Options<SName>
): Rule {
  return (tree: Tree, schematicsContext: SchematicContext) => {
    const { serviceName, serviceOptions, cb, context } = options;

    return from(
      context!
        .serviceFactory(serviceName, serviceOptions)
        .then((service) => cb({ service, serviceName }))
        .then(() => tree)
    );
  };
}

export const wrapServiceAsRule = <SName extends keyof Services>(
  optionsMinusServiceOptions: Omit<Options<SName>, "serviceOptions"> & {
    serviceOptions: IsEmptyObject<
      Omit<
        Parameters<ServicesStatic[SName]["initialise"]>[0],
        keyof ServiceInitialiseOptions
      >
    > extends true
      ? Record<never, any>
      : Omit<
          Parameters<ServicesStatic[SName]["initialise"]>[0],
          keyof ServiceInitialiseOptions
        >;
  },
  context: SchematicContext
): Rule => {
  const options: Options<SName> = {
    ...optionsMinusServiceOptions,
    /** due to ServiceInitialiseOptions we can do derive here based on the Schematic workflow engine host */
    serviceOptions: {
      context: optionsMinusServiceOptions.context,
      destinationPath: getCurrentSchematicHostRoot(context),
      ...optionsMinusServiceOptions.serviceOptions,
    },
  };
  return wrapServiceCbAsRule(options);
};

/** runs a separate schematic. Actually produces separate context which enables a task to be run - https://github.com/angular/angular-cli/blob/8095268fa4e06c70f2f11323cff648fc6d4aba7d/packages/angular_devkit/schematics/src/rules/schematic.ts#L21 */
export const runExternalSchematic = (options: {
  address: AddressPackageScaffoldIdentString;
  context: Context;
  // destinationPath: AddressPathAbsolute;
  options: Record<PropertyKey, unknown> & { _bacContext: Context }; // @todo - type this somehow
  dryRun?: boolean;
  force?: boolean;
  workingPath: AddressPathRelative;
  // options: ServiceInitialiseOptions,
  // executionOptions?: Partial<ExecutionOptions>
}): Rule => {
  return (tree: Tree, schematicsContext: SchematicContext) => {
    const res = from(
      options.context
        .serviceFactory("schematics", {
          context: options.context,
          destinationPath: getCurrentSchematicHostRoot(schematicsContext),
        })
        .then((service) =>
          service.runExternal({
            ...options,
            tree,
            schematicsContext,
          })
        )
    )
    // .pipe(
    //   last(),
    //   map((x) => {
    //     tree.merge(x, MergeStrategy.AllowOverwriteConflict);
    //     return tree;
    //   })
    // );
    return res;
  };

  // const asyncRule = (tree: Tree, context: SchematicContext) => {
  //   // console.log(`:>> HHHHHHHHHHHHHHHHHHHHHH`, context.schematic.collection);

  //   // const bacContext = options.context
  //   bacContext.logger(
  //     `Running external schematic '${address}'. DestinationPath: '${getCurrentSchematicHostRoot(context).original}'`,
  //     "info"
  //   );

  //   const runPromise = await bacContext.serviceFactory("schematics", {context: bacContext, destinationPath: getCurrentSchematicHostRoot(context)}).then(service => {
  //     return service.runExternal({
  //       address,
  //       bacContext,
  //       options,
  //       workingPath,
  //       tree,
  //       context,
  //       // parentContext: context.,
  //     })
  //   })

  //   // merges the second schematic run into current tree - https://github.com/angular/angular-cli/blob/8095268fa4e06c70f2f11323cff648fc6d4aba7d/packages/angular_devkit/schematics/src/rules/schematic.ts#L34
  //   return from(runPromise).pipe(
  //     last(),
  //     map((x) => {
  //       console.log(`x :>> `, x)
  //       tree.merge(x, MergeStrategy.AllowOverwriteConflict);

  //       return tree;
  //     }),
  //   );
  //   // return from(runPromise)
  //   // return mergeWith(from(r/unPromise))

  //   // const collection = context.engine.createCollection(
  //   //   collectionName,
  //   //   context.schematic.collection
  //   // );
  //   // console.log(`collection :>> `, collection)
  //   // const schematic = collection.createSchematic(schematicName);

  //   // return schematic
  //   //   .call(options, of(branch(input)), context, executionOptions)
  //   //   .pipe(
  //   //     last(),
  //   //     map((x) => {
  //   //       input.merge(x, MergeStrategy.AllowOverwriteConflict);

  //   //       return input;
  //   //     })
  //   //   );
  // };

  // return asyncRule

  // const collection = context.engine.createCollection(
  //   collectionName,
  //   context.schematic.collection,
  // );
  // const schematic = collection.createSchematic(schematicName);

  // return schematic.call(options, observableOf(branch(input)), context, executionOptions).pipe(
  //   last(),
  //   map((x) => {
  //     input.merge(x, MergeStrategy.AllowOverwriteConflict);

  //     return input;
  //   }),
  // );

  // const options: Options<SName> = {
  //   ...optionsMinusServiceOptions,
  //   /** due to ServiceInitialiseOptions we can do derive here based on the Schematic workflow engine host */
  //   serviceOptions: {
  //     context: optionsMinusServiceOptions.context,
  //     destinationPath: getCurrentSchematicHostRoot(context),
  //     ...optionsMinusServiceOptions.serviceOptions,
  //   },
  // };
  // return wrapServiceCbAsRule(options);
};
