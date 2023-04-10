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
import { addr } from "@business-as-code/address";
import { runExternalSchematic } from "@business-as-code/core";
import { debugRule } from "@business-as-code/tests-core";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree, context) => {
    const bareTemplateSource = apply(url("./repo"), [
      template({
        name: "root-package",
        dot: ".",
        dasherize: strings.dasherize,
      }),
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
      move("packages/my-package-1"),
    ]);

    const r = chain([
      mergeWith(bareTemplateSource),
      debugRule(options),
      runExternalSchematic({
        address: "@business-as-code/plugin-core-tests#namespace=commit",
        context: options._bacContext,
        options: { message: "INITIAL commit", _bacContext: options._bacContext },
        workingPath: addr.pathUtils.dot,
      }),
      debugRule(options),
      mergeWith(packageTemplateSource1),
      runExternalSchematic({
        address: "@business-as-code/plugin-core-tests#namespace=commit",
        context: options._bacContext,
        options: { message: "second commit", _bacContext: options._bacContext },
        workingPath: addr.pathUtils.dot,
      }),
      debugRule(options),

      // runExternalSchematic({address: addr.parsePackage('@business-as-code/plugin-core-tests#namespace=commit', options: {context: options._bacContext}}),
      // runExternalSchematic('@business-as-code/plugin-core-tests', 'commit', {context: options._bacContext}),
      // wrapServiceAsRule(
      //   {
      //     serviceName: "git",
      //     cb: async ({ service }) => {
      //       // const repo = await service.getRepository()
      //       // await repo.add("./*")
      //       //   /** commit example - https://tinyurl.com/29y5mnwm */
      //       //   .commit("first commit", {
      //       //     "--author": constants.DEFAULT_COMMITTER,
      //       //   }),
      //       await service.init({ "--initial-branch": "main" });
      //       const repo = service.getRepository();

      //       // console.log(
      //       //   `repo, service.getWorkingDestinationPath() :>> `,
      //       //   repo,
      //       //   service.getWorkingDestinationPath()
      //       // );

      //       await repo.add(".");
      //       /** commit example - https://tinyurl.com/29y5mnwm */
      //       await repo.commit("initial commit", {
      //         "--author": constants.DEFAULT_COMMITTER,
      //         "--allow-empty": null,
      //       });

      //       // return (
      //       //   (await service.init().then((service) => service.getRepository()))
      //       //     .add("./*")
      //       //     /** commit example - https://tinyurl.com/29y5mnwm */
      //       //     .commit("first commit", {
      //       //       "--author": constants.DEFAULT_COMMITTER,
      //       //     })
      //       // );
      //     },
      //     context: options._bacContext,
      //     serviceOptions: {},
      //   },
      //   context
      // ),
      // debugRule(options),
      // mergeWith(packageTemplateSource1),
      // runExternalSchematic({address: '@business-as-code/plugin-core-tests#namespace=commit', context: options._bacContext, options: {message: 'second commit'}, workingPath: addr.pathUtils.dot}),
      // debugRule(options),
      // debugRule(options),
      // wrapServiceAsRule(
      //   {
      //     serviceName: "git",
      //     cb: async ({ service }) => {
      //       const repo = await service.getRepository()
      //       await repo.add(".");
      //       /** commit example - https://tinyurl.com/29y5mnwm */
      //       await repo.commit("adds /packages/my-package-1", {
      //         "--author": constants.DEFAULT_COMMITTER,
      //         "--allow-empty": null,
      //       });
      //       // return (
      //       //   (await service.getRepository())
      //       //     .add(".")
      //       //     /** commit example - https://tinyurl.com/29y5mnwm */
      //       //     .commit("adds /packages/my-package-1", {
      //       //       "--author": constants.DEFAULT_COMMITTER,
      //       //       "--allow-empty": null,
      //       //     })
      //       // );
      //     },
      //     context: options._bacContext,
      //     serviceOptions: {},
      //   },
      //   context
      // ),
      // debugRule(options),
    ]);
    return r;
  };
}
