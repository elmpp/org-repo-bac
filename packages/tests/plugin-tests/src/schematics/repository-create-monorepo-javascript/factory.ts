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
  mergeWith,
  partitionApplyMerge,
  Rule,
  template,
  chain,
  branchAndMerge,
  url,
  SchematicContext,
  Tree,
} from "@angular-devkit/schematics";
import { Schema } from "./schema";


function commit(_options: { name: string }): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    _context.logger.info(`Executing: npm run lint -- --fix ${_options.name}`);
    execSync("npm run lint -- --fix " + _options.name);
  };
}

export default function (options: Schema): Rule {
  return (_tree, context) => {

    // just make a big repo with a number of packages and a variety of commits

    const bareTemplateSource = apply(url("./repo"), [
      // partitionApplyMerge(
        // (p) => !/\/src\/.*?\/repo\//.test(p),
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



    const packageTemplateSource1 = apply(url("./package"), [
      // partitionApplyMerge(
        // (p) => !/\/src\/.*?\/repo\//.test(p),
        template({
          ...options,
          path: 'packages/my-package-1',
          // coreVersion,
          // schematicsVersion,
          // configPath,
          dot: ".",
          dasherize: strings.dasherize,
        })
      // ),
      // move(destinationPath),
    ])

    const r = chain([
      mergeWith(bareTemplateSource),
      mergeWith(packageTemplateSource1),
    ])
    return r

//     const t = mergeWith(bareTemplateSource, packageTemplateSource1)
// return t
    // const t = apply(bareTemplateSource)

    // return mergeWith(

    // );
  };
}
