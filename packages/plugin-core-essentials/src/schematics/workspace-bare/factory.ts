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
  template,
  url,
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { schematicUtils } from "@business-as-code/core";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree, schematicContext) => {
    // console.log(`options.destinationPath :>> `, options.destinationPath);
    // console.log(`context :>> `, context.engine.workflow.engineHost)
console.log(`options :>> `, options)
    const baseTemplateSource = apply(url("./files"), [
      // partitionApplyMerge(
      // (p) => !/\/src\/.*?\/bare\//.test(p),
      template({
        pmRegistry: 'https://registry.npmjs.org',
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

    const pnpmTaskHandle = schematicContext.addTask(new NodePackageInstallTask({workingDirectory: '.', quiet: false, hideOutput: false, packageManager: 'pnpm'}), []);
    schematicContext.addTask(schematicUtils.wrapServiceAsTask({
      serviceOptions: {
        serviceName: "git",
        cb: async ({ service }) => {
          const logs = await service.getRepository().log();
          console.log(`logs shown as part of task :>> `, logs)
        },
        initialiseOptions: {
          workingPath: '.',
        },
        context: options._bacContext,
      },
      schematicContext,
    }), [pnpmTaskHandle]);

    return chain([
      mergeWith(baseTemplateSource),
      schematicUtils.wrapServiceAsRule({
        serviceOptions: {
          serviceName: "git",
          cb: async ({ service }) => {
            // await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
            await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
          },
          initialiseOptions: {
            workingPath: '.',
          },
          context: options._bacContext,
        },
        schematicContext,
      }),
      // wrapTaskAsRule(
      //   // new RepositoryInitializerTask(".", {
      //   //   email: constants.DEFAULT_COMMITTER_EMAIL,
      //   //   message: "initial commit of workspace",
      //   //   name: constants.DEFAULT_COMMITTER_NAME,
      //   // })

      //   USE GIT SERVICE - https://github.com/nodegit/nodegit/blob/master/examples/create-new-repo.js#L13
      // ),
      schematicUtils.wrapServiceAsRule({
        serviceOptions: {
          serviceName: "myService",
          cb: async ({ service }) => {
            await service.func1({ someRandomProps: "bollocks" });
          },
          // workingPath: addr.parsePath(".") as AddressPathRelative,
          initialiseOptions: {
            workingPath: '.',
          },
          context: options._bacContext,
        },
        schematicContext,
      }),
      // wrapTaskAsRule(
      //   new RepositoryInitializerTask("repo", {
      //     email: constants.DEFAULT_COMMITTER_EMAIL,
      //     message: "initial commit of repo",
      //     name: constants.DEFAULT_COMMITTER_NAME,
      //   })
      // ),
      // wrapTaskAsRule(new NodePackageInstallTask({})),
      // wrapTaskAsRule(
      //   new RunSchematicTask("workspace-configure", {
      //     ...options,
      //   })
      // ),
      /** run schematic from same collection */
      schematic("workspace-configure", {
        ...options,
      }),
    ]);
  };
}
