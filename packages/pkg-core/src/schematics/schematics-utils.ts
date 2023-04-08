import { Host } from "@angular-devkit/core/src/virtual-fs/host";
import {
  Rule,
  SchematicContext,
  TaskConfigurationGenerator,
  TaskId,
  Tree,
} from "@angular-devkit/schematics";
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { from } from "rxjs";
import {
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

export function wrapTaskAsRule(
  task: TaskConfigurationGenerator<object>,
  dependencies?: TaskId[] | undefined
) {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(task, dependencies); // think this may just shunt it to the end of all Rules though?? ¯\_(ツ)_/¯
    return tree;
  };
}

export function wrapServiceCbAsRule<SName extends keyof Services>(
  options: Options<SName>
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const { serviceName, serviceOptions, cb, context: bacContext } = options;

    return from(
      bacContext!
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
  const getCurrentSchematicHostRoot = (
    context: SchematicContext
  ): AddressPathAbsolute =>
    addr.parsePath(
      (context.engine.workflow as any)?._host?._root!
    ) as AddressPathAbsolute;

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
