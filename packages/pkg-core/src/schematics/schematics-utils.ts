import { Host } from "@angular-devkit/core/src/virtual-fs/host";
import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import {
  addr,
  AddressPackageScaffoldIdentString,
  AddressPathAbsolute,
} from "@business-as-code/address";
import { from } from "rxjs";
import {
  Context,
  ServiceInitialiseOptions,
  Services,
  ServicesStatic,
} from "../__types__";
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

// export function wrapTaskAsRule(
//   task: TaskConfigurationGenerator<object>,
//   dependencies?: TaskId[] | undefined
// ) {
//   return (tree: Tree, schematicContext: SchematicContext) => {
//     schematicContext.addTask(task, dependencies); // think this may just shunt it to the end of all Rules though?? ¯\_(ツ)_/¯
//     return tree;
//   };
// }

function wrapExternalServiceCbAsRule<SName extends keyof Services>(options: {
  serviceOptions: ServiceOptions<SName>;
  dryRun?: boolean;
  force?: boolean;
  // workingPath: string;
}): Rule {
  return (tree: Tree, schematicContext: SchematicContext) => {
    // const destinationPath = addr.pathUtils.join(getCurrentSchematicHostRoot(schematicContext), addr.parsePath(options.workingPath)) as AddressPathAbsolute
    const { serviceOptions } = options;

    const res = from(
      serviceOptions.context
        .serviceFactory("schematics", {
          context: serviceOptions.context,
          destinationPath: getCurrentSchematicHostRoot(schematicContext),
          workingPath: options.serviceOptions.initialiseOptions.workingPath,
        })
        .then((service) => {
          const serviceRule: Rule = (
            tree: Tree,
            schematicContext: SchematicContext
          ) => {
            return from(
              serviceOptions.context
                .serviceFactory(serviceOptions.serviceName, serviceOptions.initialiseOptions)
                .then((service) => serviceOptions.cb({ service, serviceName: serviceOptions.serviceName }))
                .then(() => tree)
            );
          };
          return service.runExternalSchematicRule({
            schematicRule: serviceRule,
            schematicContext,
            tree,
          });
        })
    );
    return res;
  };
}

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

/**
 Runs a service callback but ensures that previous Rules are flushed to disk
 */
export const wrapExternalServiceAsRule = <SName extends keyof Services>({
  serviceOptions: serviceOptionsLite,
  schematicContext,
  dryRun,
  force,
  // workingPath,
}: {
  serviceOptions: ServiceOptionsLite<SName>;
  schematicContext: SchematicContext;
  dryRun?: boolean | undefined;
  force?: boolean | undefined;
  // workingPath: string;
}): Rule => {
  const serviceOptions: ServiceOptions<SName> = {
    ...serviceOptionsLite,
    /** due to ServiceInitialiseOptions we can do derive here based on the Schematic workflow engine host */
    initialiseOptions: {
      ...serviceOptionsLite.initialiseOptions,
      context: serviceOptionsLite.context,
      destinationPath: getCurrentSchematicHostRoot(schematicContext),
    },
  };
  return wrapExternalServiceCbAsRule({
    serviceOptions,
    dryRun,
    force,
    // workingPath,
  });
};

/** runs a separate schematic. Actually produces separate context which enables a task to be run - https://github.com/angular/angular-cli/blob/8095268fa4e06c70f2f11323cff648fc6d4aba7d/packages/angular_devkit/schematics/src/rules/schematic.ts#L21 */
export const runExternalSchematic = (options: {
  address: AddressPackageScaffoldIdentString;
  context: Context;
  // destinationPath: AddressPathAbsolute;
  schematicOptions: Record<PropertyKey, unknown> & { _bacContext: Context }; // @todo - type this somehow
  dryRun?: boolean;
  force?: boolean;
  workingPath: string;
  // workingPath: AddressPathRelative;
  // options: ServiceInitialiseOptions,
  // executionOptions?: Partial<ExecutionOptions>
}): Rule => {
  return (tree: Tree, schematicContext: SchematicContext) => {
    // const destinationPath = addr.pathUtils.join(getCurrentSchematicHostRoot(schematicContext), addr.parsePath(options.workingPath)) as AddressPathAbsolute

    const res = from(
      options.context
        .serviceFactory("schematics", {
          context: options.context,
          destinationPath: getCurrentSchematicHostRoot(schematicContext),
          workingPath: options.workingPath,
        })
        .then((service) =>
          service.runExternalSchematic({
            ...options,
            tree,
            schematicContext,
          })
        )
    );
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
  //   ...optionsMinusOptions,
  //   /** due to ServiceInitialiseOptions we can do derive here based on the Schematic workflow engine host */
  //   options: {
  //     context: optionsMinusOptions.context,
  //     destinationPath: getCurrentSchematicHostRoot(context),
  //     ...optionsMinusOptions.options,
  //   },
  // };
  // return wrapServiceCbAsRule(options);
};
