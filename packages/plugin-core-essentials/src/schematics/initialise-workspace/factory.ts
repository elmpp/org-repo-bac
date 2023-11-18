import { strings } from "@angular-devkit/core";
import {
  apply, chain, forEach, MergeStrategy, mergeWith,
  Rule,
  schematic,
  TaskId,
  template, url
} from "@angular-devkit/schematics";
import { constants, expectIsOk, formatUtils, schematicUtils } from "@business-as-code/core";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree, schematicContext) => {
    // console.log(`options.destinationPath :>> `, options.destinationPath);
    // console.log(`context :>> `, context.engine.workflow.engineHost)
// console.log(`options :>> `, options)

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
      forEach(fileEntry => {
        if (!fileEntry.path.match(/.*\.json$/)) {
          return fileEntry
        }
        return {
          path: fileEntry.path,
          content: Buffer.from(formatUtils.JSONNormalize(fileEntry.content.toString(), true))
        }
      })
      // (tree: Tree) => {
      //   // tree.create(options.path + '/hi', 'Hello world!');
      //   tree.for
      //   return tree;
      // };
      // ),
      // move(destinationPath),
    ]);

    let nextTaskHandles: TaskId[] = []

    if (options.cliPath) {
      // cliPath is handled within the package.json.ejs but we want to swap its bin location, so that the checkoutCli bac-test binary is called



      // nextTaskHandles.push(schematicContext.addTask(schematicUtils.wrapServiceAsTask({
      //   serviceOptions: {
      //     serviceName: "packageManager",
      //     cb: async ({ service }) => {
      //       // console.log(`optionseeeee :>> `, require('util').inspect(options, {showHidden: false, depth: undefined, colors: true}))
      //       await service.link({path: options.cliPath!})
      //     },
      //     initialiseOptions: {
      //       workingPath: '.',
      //     },
      //     context: options._bacContext,
      //   },
      //   schematicContext,
      // }), nextTaskHandles));
    }

    // nextTaskHandles.push(schematicContext.addTask(new NodePackageInstallTask({workingDirectory: '.',  quiet: false, hideOutput: false, packageManager: 'pnpm'}), nextTaskHandles));

    nextTaskHandles.push(schematicContext.addTask(schematicUtils.wrapServiceAsTask({
        serviceOptions: {
          serviceName: "packageManager",
          cb: async ({ service }) => {
            // console.log(`optionseeeee :>> `, require('util').inspect(options, {showHidden: false, depth: undefined, colors: true}))

            // link the cli
            if (options.cliPath) {
              expectIsOk(await service.link({path: options.cliPath, pkg: '@business-as-code/cli', save: true}))
            }
            else {
              expectIsOk(await service.add({pkg: '@business-as-code/cli@workspace:*'}))
            }

            const res = await service.install({logLevel: 'debug'})
            expectIsOk(res)
          },
          initialiseOptions: {
            workingPath: '.',
            packageManager: options.packageManager,
          },
          context: options._bacContext,
        },
        schematicContext,
      }), nextTaskHandles));





    schematicContext.addTask(schematicUtils.wrapServiceAsTask({
      serviceOptions: {
        serviceName: "bac",
        cb: async ({ service }) => {
          expectIsOk(await service.run({command: 'help'}))
        },
        initialiseOptions: {
          workingPath: '.',
        },
        context: options._bacContext,
      },
      schematicContext,
    }), nextTaskHandles);

    return chain([
      mergeWith(baseTemplateSource, MergeStrategy.Overwrite),

      // schematicUtils.branchMerge(
      //   schematicUtils.wrapServiceAsRule({
      //     serviceOptions: {
      //       serviceName: "git",
      //       cb: async ({ service }) => {
      //         // await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
      //         await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
      //       },
      //       initialiseOptions: {
      //         workingPath: '.',
      //       },
      //       context: options._bacContext,
      //     },
      //     schematicContext,
      //   }),
      //   {
      //     context: options._bacContext,
      //     initialiseOptions: {
      //       workingPath: '.',
      //     },
      //   },
      //   MergeStrategy.Overwrite,
      // ),

      // schematicUtils.wrapServiceAsRule({
      //   serviceOptions: {
      //     serviceName: "git",
      //     cb: async ({ service }) => {
      //       // await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
      //       await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
      //     },
      //     initialiseOptions: {
      //       workingPath: '.',
      //     },
      //     context: options._bacContext,
      //   },
      //   schematicContext,
      // }),

      (
        tree, schematicContext
      ) => {
        // console.log(`options.configPath, constants.RC_FILENAME :>> `, options.configPath, constants.RC_FILENAME)
        schematicUtils.copy(
          options.configPath,
          constants.RC_FILENAME,
          tree,
          schematicContext,
        )
        return tree
      },
      // mergeWith(apply(url(options.configPath), [
      //   move(constants.RC_FILENAME),
      // ])),

      // schematicUtils.debugRule({context: options._bacContext,
      //   initialiseOptions: {
      //     workingPath: '.',
      //   },}),

      // wrapTaskAsRule(
      //   // new RepositoryInitializerTask(".", {
      //   //   email: constants.DEFAULT_COMMITTER_EMAIL,
      //   //   message: "initial commit of workspace",
      //   //   name: constants.DEFAULT_COMMITTER_NAME,
      //   // })

      //   USE GIT SERVICE - https://github.com/nodegit/nodegit/blob/master/examples/create-new-repo.js#L13
      // ),
      // schematicUtils.wrapServiceAsRule({
      //   serviceOptions: {
      //     serviceName: "myService",
      //     cb: async ({ service }) => {
      //       await service.func1({ someRandomProps: "bollocks" });
      //     },
      //     // workingPath: addr.parsePath(".") as AddressPathRelative,
      //     initialiseOptions: {
      //       workingPath: '.',
      //     },
      //     context: options._bacContext,
      //   },
      //   schematicContext,
      // }),
      // wrapTaskAsRule(
      //   new RepositoryInitializerTask("repo", {
      //     email: constants.DEFAULT_COMMITTER_EMAIL,
      //     message: "initial commit of repo",
      //     name: constants.DEFAULT_COMMITTER_NAME,
      //   })
      // ),
      // wrapTaskAsRule(new NodePackageInstallTask({})),
      // wrapTaskAsRule(
      //   new RunSchematicTask("synchronise-workspace", {
      //     ...options,
      //   })
      // ),
      /** run schematic from same collection */
      schematic("synchronise-workspace", {
        ...options,
      }),
    ]);
  };
}
