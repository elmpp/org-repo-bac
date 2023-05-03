import { strings } from "@angular-devkit/core";
import {
  apply,
  chain, mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from "@angular-devkit/schematics";
import { constants, schematicUtils } from "@business-as-code/core";
import { schematicTestUtils } from "@business-as-code/tests-core";
import path from "path";
import { Schema } from "./schema";

/** normal repo to bare repo - https://tinyurl.com/28qht2am */
const convertToBareRepo = ({
  workingPath,
  options,
  name,
}: {
  options: Schema;
  workingPath: string;
  name: string;
}): Rule => {
  // (tree: Tree, schematicContext: SchematicContext) => {
  const sourceBasedir = path.dirname(workingPath);
  // const sourceBasedir = workingPath;
  const sourceFoldername = `${path.basename(workingPath)}`;
  const tmpDestinationPath = path.join(
    sourceBasedir,
    `__TMP_${sourceFoldername}`
  );
  const tmpDestinationGitPath = path.join(tmpDestinationPath, ".git");
  const destinationPath = path.join(sourceBasedir, sourceFoldername) + ".git";

  return  chain([(tree: Tree, schematicContext: SchematicContext) => {
    // move(workingPath, tmpDestinationPath) // remove
    // move(tmpDestinationGitPath, destinationPath) // remove

    // schematicUtils.copy(workingPath, tmpDestinationPath, tree, schematicContext) // remove
    // schematicUtils.copy(tmpDestinationGitPath, destinationPath, tree, schematicContext) // remove
    schematicUtils.move(workingPath, tmpDestinationPath, tree, schematicContext) // remove
    schematicUtils.move(tmpDestinationGitPath, destinationPath, tree, schematicContext) // remove

    // const debugActions = (tree: Tree) => {
    //   return tree.actions.map(
    //     (a) => a.kind === 'r' ? `tree$ index: '0'; kind: ${a.kind}; fromPath: ${a.path} -> ${a.to}` : `tree$ index: '0'; kind: ${a.kind}; path: ${a.path}`
    //   );
    // };
    // console.log(`convertToBareRepo actions :>> 1 `, debugActions(tree), tree);

    schematicUtils.remove(workingPath, tree, schematicContext);

    // console.log(`convertToBareRepo actions :>> 2 `, debugActions(tree), tree);
    schematicUtils.remove(tmpDestinationPath, tree, schematicContext);

    // tree.create('bollards2/.gitkeep', '')
    // move(workingPath, tmpDestinationPath),
    // move(tmpDestinationGitPath, destinationPath),


    // const debugActions = (tree: Tree) => {
    //   return tree.actions.map(
    //     (a) =>
    //       `tree$ index: '0'; kind: ${a.kind}; path: ${a.path}`
    //   );
    // };
    // console.log(`convertToBareRepo actions :>> `, debugActions(tree), tree);
    // return tree;

    return tree
  }])

  // // console.log(
  // //   `tmpDestinationPath, tmpDestinationGitPath, destinationPath :>> `,
  // //   tmpDestinationPath,
  // //   tmpDestinationGitPath,
  // //   destinationPath
  // // );

  // console.log(`workingPath :>> `, workingPath)
  // return chain([
  //   // (tree: Tree, schematicContext: SchematicContext) => {
  //   //   // tree.create(sourceBasedir)
  //   //   // tree.(tmpDestinationPath)
  //   //   return tree;
  //   // },
  //   // (tree: Tree, schematicContext: SchematicContext) => {
  //   //   schematicUtils.remove(workingPath, tree, schematicContext);
  //   //   schematicUtils.remove(tmpDestinationPath, tree, schematicContext);
  //   //   return tree;
  //   // },
  //   (tree: Tree, schematicContext: SchematicContext) => {
  //     schematicUtils.move(workingPath, tmpDestinationPath) // remove
  //     schematicUtils.move(tmpDestinationGitPath, destinationPath) // remove
  //     // schematicUtils.remove(workingPath, tree, schematicContext);
  //     // schematicUtils.remove(tmpDestinationPath, tree, schematicContext);
  //     // move(workingPath, tmpDestinationPath),
  //     // move(tmpDestinationGitPath, destinationPath),
  //     return tree
  //   },
  //   // (tree: Tree, schematicContext: SchematicContext) => {
  //   //   console.log(
  //   //     `tmpDestinationPath, tmpDestinationGitPath, destinationPath :>> `,
  //   //     tmpDestinationPath,
  //   //     tmpDestinationGitPath,
  //   //     destinationPath
  //   //   );
  //   //   schematicUtils.remove(workingPath, tree, schematicContext);
  //   //   schematicUtils.remove(tmpDestinationPath, tree, schematicContext);
  //   //   return tree;
  //   // },
  //   // (tree: Tree, schematicContext: SchematicContext) => {
  //   //   tree.create('./poo/.gitkeep', '')
  //   //   return tree;
  //   // },

  // ]);
  // // };
};

export default function (options: Schema): Rule {

  return (_tree, schematicContext) => {

    const createForWorkingPath = (innerOptions: {
      options: Schema;
      workingPath: string;
      name: string;
    }): Rule => {
      const { options, workingPath, name } = innerOptions;

      if (workingPath === ".") {
        throw new Error("root path not supported");
      }

      // console.log(`innerOptions :>> `, innerOptions)

      const bareTemplateSource = apply(url("./repo"), [
        template({
          name: "root-package",
          dot: ".",
          dasherize: strings.dasherize,
        }),
        move(workingPath),
      ]);

      const packageTemplateSource1 = apply(url("./package"), [
        template({
          ...options,
          path: "packages/my-package-1",
          name: "my-package-1",
          dot: ".",
          dasherize: strings.dasherize,
        }),
        // ),
        move(path.join(workingPath, `packages/my-package-1`)),
      ]);



      return chain([
        mergeWith(bareTemplateSource),
        schematicUtils.flushBranchMerge(
          schematicUtils.wrapServiceAsRule({
            serviceOptions: {
              serviceName: "git",
              cb: async ({ service }) => {
                await service.init({ "--initial-branch": "main" });
                const repo = service.getRepository();
                await repo.add(".");
                /** commit example - https://tinyurl.com/29y5mnwm */
                await repo.commit("initial commit", {
                  "--author": constants.DEFAULT_COMMITTER,
                  // "--allow-empty": null,
                });
              },
              context: options._bacContext,
              initialiseOptions: {
                workingPath,
              },
            },
            schematicContext,
          }),
          {
            context: options._bacContext,
            initialiseOptions: {
              workingPath,
            },
          },
        ),
        mergeWith(packageTemplateSource1),
        schematicUtils.flushBranchMerge(
          chain([
            schematicUtils.wrapServiceAsRule({
              serviceOptions: {
                serviceName: "git",
                cb: async ({ service }) => {
                  // console.log(`service.getCur :>> `, service.getWorkingDestinationPath())
                  await service.init({ "--initial-branch": "main" });
                  const repo = service.getRepository();
                  await repo.add(".");
                  /** commit example - https://tinyurl.com/29y5mnwm */
                  await repo.commit("second commit", {
                    "--author": constants.DEFAULT_COMMITTER,
                    // "--allow-empty": null,
                  });
                },
                context: options._bacContext,
                initialiseOptions: {
                  workingPath,
                  // context: options._bacContext,
                  // destinationPath: '',
                },
              },
              schematicContext,
            }),
            // convertToBareRepo(innerOptions),
            (tree: Tree, schematicContext: SchematicContext) => {
              // tree.create('bollards/.gitkeep', '')
              return tree
            }
          ]),
          {
            context: options._bacContext,
            initialiseOptions: {
              workingPath,
            },
          },
        ),
        schematicTestUtils.debugRule({
          context: options._bacContext,
          initialiseOptions: {
            workingPath
          },
        }),
        convertToBareRepo(innerOptions),
        schematicUtils.flushBranchMerge(
          chain([
            (tree: Tree, schematicContext: SchematicContext) => {
              return tree
            }
          ]),
          {
            context: options._bacContext,
            initialiseOptions: {
              workingPath,
            },
          },
        ),

        // convertToBareRepo(innerOptions),

        // schematicTestUtils.debugRule({
        //   context: options._bacContext,
        //   initialiseOptions: {
        //     workingPath
        //   },
        // }),
      ]);
    };

    const r = chain([
      createForWorkingPath({ options, workingPath: "repo1", name: "repo1" }),
      // schematicTestUtils.debugRule({
      //   context: options._bacContext,
      //   initialiseOptions: {
      //     workingPath: 'repo1',
      //   },
      // }),
      createForWorkingPath({ options, workingPath: "repo2", name: "repo2" }),
      createForWorkingPath({ options, workingPath: "repo3", name: "repo3" }),
    ]);

    return r;
  };
}
