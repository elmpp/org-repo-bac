import {
  empty,
  mergeWith,
  Rule,
  SchematicContext,
  TaskConfigurationGenerator,
  TaskId,
  Tree,
} from "@angular-devkit/schematics";
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { IsEmptyObject, ServiceInitialiseOptions, Services, ServicesStatic } from "../__types__";
import { ServiceExecTask } from "./tasks";
import { Options } from "./tasks/service-exec/options";


export function wrapTaskAsRule(
    task: TaskConfigurationGenerator<object>,
    dependencies?: TaskId[] | undefined
  ) {
    return (_tree: Tree, context: SchematicContext): Rule => {
      const emptySource = empty();
      context.addTask(task);
      return mergeWith(emptySource);
    };
  }

  export const wrapServiceAsRule = <SName extends keyof Services>(
    optionsMinusServiceOptions: Omit<Options<SName>, 'serviceOptions'> & {
      serviceOptions: IsEmptyObject<Omit<Parameters<ServicesStatic[SName]['initialise']>[0], keyof ServiceInitialiseOptions>> extends true ? Record<never, any> : Omit<Parameters<ServicesStatic[SName]['initialise']>[0], keyof ServiceInitialiseOptions>
    },
    context: SchematicContext,
    // ...args: ConstructorParameters<typeof ServiceExecTask>
    // {
    //   serviceName,
    //   context,
    //   serviceOptions,
    //   workingDirectory,
    //   cb,
    // }: {
    //   context: Context;
    //   serviceName: SName;
    //   workingDirectory: string;
    //   serviceOptions: Parameters<ServicesStatic[SName]["initialise"]>;
    //   cb: ({
    //     service,
    //   }: {
    //     service: Services[SName];
    //   }) => ReturnType<TaskExecutor<object>>
    // },
  ): Rule => {
    // // need to shimmy in here a Task
    // const taskShim: TaskConfigurationGenerator<object> = {
    //   toConfiguration() {
    //     return {
    //       name: serviceName,
    //       // dependencies: Array<TaskId>,
    //       options: {},
    //     }
    //   }
    // }

    console.log(`optionsMinusServiceOptions :>> `, optionsMinusServiceOptions)

    const getCurrentSchematicHostRoot = (context: SchematicContext): AddressPathAbsolute => addr.parsePath((context.engine.workflow as any)?._host?._root!) as AddressPathAbsolute

    const options: Options<SName> = {
      ...optionsMinusServiceOptions,
      /** due to ServiceInitialiseOptions we can do derive here based on the Schematic workflow engine host */
      serviceOptions: {
        context: optionsMinusServiceOptions.context,
        destinationPath: getCurrentSchematicHostRoot(context),
        ...optionsMinusServiceOptions.serviceOptions,
      },
    }

    const serviceExecTask = new ServiceExecTask<SName>(options);
    // const serviceExecTask = new ServiceExecTask(workingDirectory, {
    //   cb,
    //   serviceName,
    //   serviceOptions,
    // });

    // // need to register the cb here somehow ¯\_(ツ)_/¯
    // const taskExecutor: TaskExecutorFactory<Parameters<ServicesStatic[SName]['initialise']>> =
    // {
    //   name: serviceName,
    //   create: (options) => Promise.resolve().then(() => {
    //     const service = context.serviceFactory(serviceName, serviceOptions)
    //     return service as unknown as TaskExecutor
    //   }),
    // };
    // engineHost.registerTaskExecutor(taskExecutor, {
    //   rootDirectory: root && getSystemPath(root),
    // });
    // engineHost.registerTaskExecutor(BuiltinTaskExecutor.RepositoryInitializer, {
    //   rootDirectory: root && getSystemPath(root),
    // });

    return wrapTaskAsRule(serviceExecTask);
  };
