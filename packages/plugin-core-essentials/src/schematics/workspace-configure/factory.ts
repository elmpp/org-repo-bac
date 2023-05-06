/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { strings } from "@angular-devkit/core";
import {
  apply, chain, mergeWith, Rule, template,
  url
} from "@angular-devkit/schematics";
import {
  addr,
  AddressPathAbsolute,
  AddressPathRelative,
  assertIsAddressPathRelative
} from "@business-as-code/address";
import { BacError, MessageName } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";
import path from "path";
import { Schema } from "./schema";


export default function (options: Schema): Rule {
  // const schematicsVersion = require('@angular-devkit/schematics/package.json').version;
  // const coreVersion = require('@angular-devkit/core/package.json').version;

  return (_tree, schematicContext) => {

    const getConfigPath = (
      runtimeConfigRelOrAbsoluteNative?: string
    ): AddressPathAbsolute => {
      let configPath: AddressPathAbsolute | AddressPathRelative =
        addr.parsePath(
          runtimeConfigRelOrAbsoluteNative ??
            path.resolve(__dirname, "./config-default.js")
        );
      if (assertIsAddressPathRelative(configPath)) {
        configPath = addr.pathUtils.resolve(
          addr.parsePath(process.cwd()),
          configPath
        ) as AddressPathAbsolute;
      }

      if (!xfs.existsSync(configPath.address)) {
        throw new BacError(
          MessageName.OCLIF_ERROR,
          `Config path at '${configPath.original}' does not exist, supplied as '${runtimeConfigRelOrAbsoluteNative}'`
        );
      }
      return configPath;
    };

    const templateSource = apply(url("./files"), [
      // partitionApplyMerge(
        // (p) => !/\/src\/.*?\/bare\//.test(p),
        template({
          ...options,
          configPath: getConfigPath(),
          // coreVersion,
          // schematicsVersion,
          dot: ".",
          dasherize: strings.dasherize,
        })
      // ),
      // move(destinationPath),
    ])

    return chain([
      mergeWith(templateSource),
    ])
  };
}
