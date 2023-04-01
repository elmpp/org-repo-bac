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
  mergeWith, partitionApplyMerge, Rule, template,
  url
} from "@angular-devkit/schematics";
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
  RunSchematicTask
} from "@angular-devkit/schematics/tasks";
import {
  addr,
  AddressPathAbsolute,
  AddressPathRelative,
  assertIsAddressPathRelative
} from "@business-as-code/address";
import { constants } from "@business-as-code/core";
import { BacError, MessageName } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";
import path from "path";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  // const schematicsVersion = require('@angular-devkit/schematics/package.json').version;
  // const coreVersion = require('@angular-devkit/core/package.json').version;

  return (_tree, context) => {

    // const getConfigPath = (
    //   runtimeConfigRelOrAbsoluteNative?: string
    // ): AddressPathAbsolute => {
    //   let configPath: AddressPathAbsolute | AddressPathRelative =
    //     addr.parsePath(
    //       runtimeConfigRelOrAbsoluteNative ??
    //         path.resolve(__dirname, "./config-default.json")
    //     );
    //   if (assertIsAddressPathRelative(configPath)) {
    //     configPath = addr.pathUtils.resolve(
    //       addr.parsePath(process.cwd()),
    //       configPath
    //     ) as AddressPathAbsolute;
    //   }

    //   if (!xfs.existsSync(configPath.address)) {
    //     throw new BacError(
    //       MessageName.OCLIF_ERROR,
    //       `Config path at '${configPath.original}' does not exist, supplied as '${runtimeConfigRelOrAbsoluteNative}'`
    //     );
    //   }
    //   return configPath;
    // };

    // console.log(`_tree :>> `, _tree)
    // console.log(`_tree :>> `, _tree.root.subfiles)

    // const { destinationPath } = options;
    // const repoPathName = "repo"
    // const repoPathAbs = path.join(destinationPath, repoPathName);

    console.log(`options.destinationPath :>> `, options.destinationPath)

    // const configPath = getConfigPath();

    // console.log(`options._bacContext :>> `, options._bacContext)
    // console.log(`configPath, repoPath :>> `, configPath, repoPath)

    const repoGitInit = context.addTask(
      new RepositoryInitializerTask('repo', {
        email: constants.DEFAULT_COMMITTER_EMAIL,
        message: "initial commit",
        name: constants.DEFAULT_COMMITTER_NAME,
      })
    );
    const gitInit = context.addTask(
      new RepositoryInitializerTask('.', {
        email: constants.DEFAULT_COMMITTER_EMAIL,
        message: "initial commit",
        name: constants.DEFAULT_COMMITTER_NAME,
      })
      );
      console.log(`options.destinationPath :>> `, options.destinationPath)
      const pmTask = context.addTask(new NodePackageInstallTask({}), [repoGitInit, gitInit]);

      if (
        options.configPath
      ) {
        // running external schematics - https://tinyurl.com/2f3nwuk7
        context.addTask(new RunSchematicTask('workspace-configure', {
          ...options,
        }), [pmTask]);
      }


      // context.addTask(new NodePackageInstallTask({workingDirectory: '.', quiet: false, hideOutput: false, packageManager: 'pnpm'}), []);
      // context.addTask(new NodePackageInstallTask({workingDirectory: options.destinationPath, quiet: false, hideOutput: false, packageManager: 'pnpm'}), []);

    return mergeWith(
      apply(url("./files"), [
        // partitionApplyMerge(
          // (p) => !/\/src\/.*?\/bare\//.test(p),
          template({
            ...options,
            // coreVersion,
            // schematicsVersion,
            // configPath,
            dot: ".",
            dasherize: strings.dasherize,
          })
        // ),
        // move(destinationPath),
      ])
    );
  };
}
