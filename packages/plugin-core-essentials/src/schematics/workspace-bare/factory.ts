/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { strings } from "@angular-devkit/core";
import {
  apply,
  chain,
  mergeWith,
  Rule,
  schematic,
  SchematicContext,
  TaskConfigurationGenerator,
  TaskExecutor,
  TaskExecutorFactory,
  template,
  Tree,
  url,
} from "@angular-devkit/schematics";
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
  RunSchematicTask,
} from "@angular-devkit/schematics/tasks";
import { addr, AddressPathRelative } from "@business-as-code/address";
import {
  constants,
  Context,
  ServiceExecTask,
  Services,
  ServicesStatic,
  wrapTaskAsRule,
} from "@business-as-code/core";
import { Options } from "@business-as-code/core/schematics/tasks/service-exec/options";
import { Schema } from "./schema";

export const wrapServiceAsRule = <SName extends keyof Services>(
  options: Options<SName>
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
) => {
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
console.log(`args :>> `, options)
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

  const task = wrapTaskAsRule(serviceExecTask);
  console.log(`task :>> `, task);
  return task;
};

export default function (options: Schema): Rule {
  return (_tree, context) => {
    // console.log(`options.destinationPath :>> `, options.destinationPath);
    // console.log(`context :>> `, context.engine.workflow.engineHost)

    const baseTemplateSource = apply(url("./files"), [
      // partitionApplyMerge(
      // (p) => !/\/src\/.*?\/bare\//.test(p),
      template({
        ...options,
        // coreVersion,
        // schematicsVersion,
        // configPath,
        dot: ".",
        dasherize: strings.dasherize,
      }),
      // ),
      // move(destinationPath),
    ]);

    // context.addTask(new NodePackageInstallTask({workingDirectory: '.', quiet: false, hideOutput: false, packageManager: 'pnpm'}), []);
    // context.addTask(new NodePackageInstallTask({workingDirectory: options.destinationPath, quiet: false, hideOutput: false, packageManager: 'pnpm'}), []);

    return chain([
      mergeWith(baseTemplateSource),
      wrapTaskAsRule(
        new RepositoryInitializerTask(".", {
          email: constants.DEFAULT_COMMITTER_EMAIL,
          message: "initial commit of workspace",
          name: constants.DEFAULT_COMMITTER_NAME,
        })
      ),
      wrapServiceAsRule(
        {
          serviceName: "myService",
          serviceOptions: {context: options._bacContext, workingPath: addr.pathUtils.dot},
          cb: async ({ service }) => {
            console.log(`service, serviceName, workingDirectory :>> `, service);
            await service.doGitStuff({someRandomProps: 'bollocks'})
          },
          workingPath: addr.parsePath('.') as AddressPathRelative,
          context: options._bacContext,
        },
      ),
      wrapTaskAsRule(
        new RepositoryInitializerTask("repo", {
          email: constants.DEFAULT_COMMITTER_EMAIL,
          message: "initial commit of repo",
          name: constants.DEFAULT_COMMITTER_NAME,
        })
      ),
      wrapTaskAsRule(new NodePackageInstallTask({})),
      wrapTaskAsRule(
        new RunSchematicTask("workspace-configure", {
          ...options,
        })
      ),
      /** run schematic from same collection */
      schematic("workspace-configure", {
        ...options,
      }),
    ]);
  };
}
