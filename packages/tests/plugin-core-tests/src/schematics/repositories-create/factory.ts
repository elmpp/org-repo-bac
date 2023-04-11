import { strings } from "@angular-devkit/core";
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  template,
  url,
} from "@angular-devkit/schematics";
import {
  constants,
  runExternalSchematic,
  wrapExternalServiceAsRule,
} from "@business-as-code/core";
import { debugRule } from "@business-as-code/tests-core";
import path from "path";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree, schematicContext) => {
    const createForWorkingPath = ({
      options,
      workingPath,
      name,
    }: {
      options: Schema;
      workingPath: string;
      name: string;
    }): Rule[] => {
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

      return [
        mergeWith(bareTemplateSource),
        debugRule({
          context: options._bacContext,
          initialiseOptions: {
            workingPath
          },
        }),
        wrapExternalServiceAsRule({
          serviceOptions: {
            serviceName: "git",
            cb: async ({ service }) => {
              // console.log(`service.getCur :>> `, service.getWorkingDestinationPath())
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
        // runExternalSchematic({
        //   address: "@business-as-code/plugin-core-tests#namespace=commit",
        //   context: options._bacContext,
        //   schematicOptions: {
        //     message: "INITIAL commit",
        //     _bacContext: options._bacContext,
        //   },
        //   workingPath,
        // }),
        // runExternalSchematic({
        //   address: "@business-as-code/plugin-core-tests#namespace=commit",
        //   context: options._bacContext,
        //   schematicOptions: {
        //     message: "INITIAL commit",
        //     _bacContext: options._bacContext,
        //   },
        //   workingPath,
        // }),
        debugRule({
          context: options._bacContext,
          initialiseOptions: {
            workingPath
          },
        }),
        mergeWith(packageTemplateSource1),
        wrapExternalServiceAsRule({
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
            },
          },
          schematicContext,
        }),
        // runExternalSchematic({
        //   address: "@business-as-code/plugin-core-tests#namespace=commit",
        //   context: options._bacContext,
        //   schematicOptions: {
        //     message: "second commit",
        //     _bacContext: options._bacContext,
        //   },
        //   workingPath,
        // }),
        debugRule({
          context: options._bacContext,
          initialiseOptions: {
            workingPath
          },
        }),
      ];
    };

    const r = chain([
      ...createForWorkingPath({ options, workingPath: "repo1", name: "repo1" }),
      ...createForWorkingPath({options, workingPath: 'repo2', name: 'repo2'}),
      ...createForWorkingPath({options, workingPath: 'repo3', name: 'repo3'}),
    ]);

    // const r = chain([
    //   mergeWith(bareTemplateSource),
    //   debugRule(options),
    //   runExternalSchematic({
    //     address: "@business-as-code/plugin-core-tests#namespace=commit",
    //     context: options._bacContext,
    //     options: { message: "INITIAL commit", _bacContext: options._bacContext },
    //     workingPath: addr.pathUtils.dot,
    //   }),
    //   debugRule(options),
    //   mergeWith(packageTemplateSource1),
    //   runExternalSchematic({
    //     address: "@business-as-code/plugin-core-tests#namespace=commit",
    //     context: options._bacContext,
    //     options: { message: "second commit", _bacContext: options._bacContext },
    //     workingPath: addr.pathUtils.dot,
    //   }),
    //   debugRule(options),

    //   // runExternalSchematic({address: addr.parsePackage('@business-as-code/plugin-core-tests#namespace=commit', options: {context: options._bacContext}}),
    //   // runExternalSchematic('@business-as-code/plugin-core-tests', 'commit', {context: options._bacContext}),
    //   // wrapServiceAsRule(
    //   //   {
    //   //     serviceName: "git",
    //   //     cb: async ({ service }) => {
    //   //       // const repo = await service.getRepository()
    //   //       // await repo.add("./*")
    //   //       //   /** commit example - https://tinyurl.com/29y5mnwm */
    //   //       //   .commit("first commit", {
    //   //       //     "--author": constants.DEFAULT_COMMITTER,
    //   //       //   }),
    //   //       await service.init({ "--initial-branch": "main" });
    //   //       const repo = service.getRepository();

    //   //       // console.log(
    //   //       //   `repo, service.getWorkingDestinationPath() :>> `,
    //   //       //   repo,
    //   //       //   service.getWorkingDestinationPath()
    //   //       // );

    //   //       await repo.add(".");
    //   //       /** commit example - https://tinyurl.com/29y5mnwm */
    //   //       await repo.commit("initial commit", {
    //   //         "--author": constants.DEFAULT_COMMITTER,
    //   //         "--allow-empty": null,
    //   //       });

    //   //       // return (
    //   //       //   (await service.init().then((service) => service.getRepository()))
    //   //       //     .add("./*")
    //   //       //     /** commit example - https://tinyurl.com/29y5mnwm */
    //   //       //     .commit("first commit", {
    //   //       //       "--author": constants.DEFAULT_COMMITTER,
    //   //       //     })
    //   //       // );
    //   //     },
    //   //     context: options._bacContext,
    //   //     serviceOptions: {},
    //   //   },
    //   //   context
    //   // ),
    //   // debugRule(options),
    //   // mergeWith(packageTemplateSource1),
    //   // runExternalSchematic({address: '@business-as-code/plugin-core-tests#namespace=commit', context: options._bacContext, options: {message: 'second commit'}, workingPath: addr.pathUtils.dot}),
    //   // debugRule(options),
    //   // debugRule(options),
    //   // wrapServiceAsRule(
    //   //   {
    //   //     serviceName: "git",
    //   //     cb: async ({ service }) => {
    //   //       const repo = await service.getRepository()
    //   //       await repo.add(".");
    //   //       /** commit example - https://tinyurl.com/29y5mnwm */
    //   //       await repo.commit("adds /packages/my-package-1", {
    //   //         "--author": constants.DEFAULT_COMMITTER,
    //   //         "--allow-empty": null,
    //   //       });
    //   //       // return (
    //   //       //   (await service.getRepository())
    //   //       //     .add(".")
    //   //       //     /** commit example - https://tinyurl.com/29y5mnwm */
    //   //       //     .commit("adds /packages/my-package-1", {
    //   //       //       "--author": constants.DEFAULT_COMMITTER,
    //   //       //       "--allow-empty": null,
    //   //       //     })
    //   //       // );
    //   //     },
    //   //     context: options._bacContext,
    //   //     serviceOptions: {},
    //   //   },
    //   //   context
    //   // ),
    //   // debugRule(options),
    // ]);
    return r;
  };
}
