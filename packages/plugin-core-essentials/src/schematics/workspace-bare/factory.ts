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
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
  RunSchematicTask,
} from "@angular-devkit/schematics/tasks";
import { addr, AddressPathRelative } from "@business-as-code/address";
import {
  constants,
  wrapServiceAsRule,
  wrapTaskAsRule,
} from "@business-as-code/core";
import { Schema } from "./schema";

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
      wrapServiceAsRule(
        {
          serviceName: "git",
          cb: async ({ service }) => {
            // await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
            await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
          },
          context: options._bacContext,
        },
        context
      ),
      // wrapTaskAsRule(
      //   // new RepositoryInitializerTask(".", {
      //   //   email: constants.DEFAULT_COMMITTER_EMAIL,
      //   //   message: "initial commit of workspace",
      //   //   name: constants.DEFAULT_COMMITTER_NAME,
      //   // })

      //   USE GIT SERVICE - https://github.com/nodegit/nodegit/blob/master/examples/create-new-repo.js#L13
      // ),
      wrapServiceAsRule(
        {
          serviceName: "myService",
          cb: async ({ service }) => {
            await service.func1({ someRandomProps: "bollocks" });
          },
          // workingPath: addr.parsePath(".") as AddressPathRelative,
          context: options._bacContext,
        },
        context
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
