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
  move,
} from "@angular-devkit/schematics";
import {
  constants,
  wrapServiceAsRule,
  wrapTaskAsRule,
} from "@business-as-code/core";
import { Schema } from "./schema";
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
  RunSchematicTask,
} from "@angular-devkit/schematics/tasks";

// function commit(_options: { name: string }): Rule {
//   return (_tree: Tree, _context: SchematicContext) => {
//     _context.logger.info(`Executing: npm run lint -- --fix ${_options.name}`);
//     execSync("npm run lint -- --fix " + _options.name);
//   };
// }

export default function (options: Schema): Rule {
  return (_tree, context) => {
    // just make a big repo with a number of packages and a variety of commits

    const bareTemplateSource = apply(url("./repo"), [
      // partitionApplyMerge(
      // (p) => !/\/src\/.*?\/repo\//.test(p),
      template({
        // ...options,
        name: "root-package",
        // coreVersion,
        // schematicsVersion,
        // configPath,
        dot: ".",
        dasherize: strings.dasherize,
      }),
      // ),
      // move(destinationPath),
    ]);

    const packageTemplateSource1 = apply(url("./package"), [
      // partitionApplyMerge(
      // (p) => !/\/src\/.*?\/repo\//.test(p),
      template({
        ...options,
        path: "packages/my-package-1",
        name: "my-package-1",
        // coreVersion,
        // schematicsVersion,
        // configPath,
        dot: ".",
        dasherize: strings.dasherize,
      }),
      // ),
      move("packages/my-package-1"),
    ]);

    const r = chain([
      mergeWith(bareTemplateSource),
      wrapServiceAsRule(
        {
          serviceName: "git",
          cb: async ({ service }) => {
            // await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
            await service.init({ bare: false });
            const repo = await service.getRepository()
            const index = await repo.refreshIndex()
            await index.addAll()
            await index.write()

            const oid = await index.writeTree();

            const parent = await repo.getHeadCommit();
            const author = nodegit.Signature.now("Scott Chacon",
              "schacon@gmail.com");
            const committer = nodegit.Signature.now("Scott A Chacon",
              "scott@github.com");

            const commitId = await repo.createCommit("HEAD", author, committer, "message", oid, [parent]);

              // .then((index) => index.addAll())
              // .then((index) => index.write())
            // await (await service.getRepository().refreshIndex()).addAll()
            // await service.commit({bare: false});
          },
          context: options._bacContext,
        },
        context
      ),
      mergeWith(packageTemplateSource1),
      wrapTaskAsRule(
        new RepositoryInitializerTask(".", {
          email: constants.DEFAULT_COMMITTER_EMAIL,
          message: "adds my-package-1",
          name: constants.DEFAULT_COMMITTER_NAME,
        })
      ),
    ]);
    return r;

    //     const t = mergeWith(bareTemplateSource, packageTemplateSource1)
    // return t
    // const t = apply(bareTemplateSource)

    // return mergeWith(

    // );
  };
}
