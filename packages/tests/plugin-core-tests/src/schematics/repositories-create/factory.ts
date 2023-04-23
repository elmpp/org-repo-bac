import { strings } from "@angular-devkit/core";
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from "@angular-devkit/schematics";
import { constants, schematicUtils } from "@business-as-code/core";
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

  return  (tree: Tree, schematicContext: SchematicContext) => {
    schematicUtils.move(workingPath, tmpDestinationPath, tree, schematicContext) // remove
    schematicUtils.move(tmpDestinationGitPath, destinationPath, tree, schematicContext) // remove
    schematicUtils.remove(workingPath, tree, schematicContext);
    schematicUtils.remove(tmpDestinationPath, tree, schematicContext);
    // move(workingPath, tmpDestinationPath),
    // move(tmpDestinationGitPath, destinationPath),
    return tree
  }

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

      console.log(`innerOptions :>> `, innerOptions)

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
        schematicUtils.mergeWithExternal(
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
          MergeStrategy.Overwrite
        ),
        mergeWith(packageTemplateSource1),
        schematicUtils.mergeWithExternal(
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
          ]),
          {
            context: options._bacContext,
            initialiseOptions: {
              workingPath,
            },
          },
          MergeStrategy.Overwrite
        ),
        convertToBareRepo(innerOptions),

        // convertToBareRepo(innerOptions),

        // debugRule({
        //   context: options._bacContext,
        //   initialiseOptions: {
        //     workingPath
        //   },
        // }),
      ]);
    };

    const r = chain([
      createForWorkingPath({ options, workingPath: "repo1", name: "repo1" }),
      // createForWorkingPath({ options, workingPath: "repo2", name: "repo2" }),
      // ...createForWorkingPath({ options, workingPath: "repo3", name: "repo3" }),
    ]);

    console.log(`r :>> `, r)
    return r;
  };
}
