/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { chain, empty, mergeWith, move, Rule } from "@angular-devkit/schematics";
import { wrapServiceAsRule } from "@business-as-code/core";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree, schematicContext) => {
    return chain([
      mergeWith(empty()),
      wrapServiceAsRule({
        serviceOptions: {
          serviceName: "git",
          cb: async ({ service }) => {
            await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
          },
          initialiseOptions: {},
          context: options._bacContext,
        },
        schematicContext,
      }

      ),
      move(options.destinationPath),
    ]);
  };
}
