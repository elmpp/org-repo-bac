import { strings } from "@angular-devkit/core";
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  template,
  url,
  externalSchematic,
} from "@angular-devkit/schematics";
import { debugRule } from "@business-as-code/tests-core";
import { constants, wrapServiceAsRule } from "@business-as-code/core";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree, context) => {

    const r = chain([
      // debugRule(options),
      wrapServiceAsRule(
        {
          serviceName: "git",
          cb: async ({ service }) => {
            // const repo = await service.getRepository()
            // await repo.add("./*")
            //   /** commit example - https://tinyurl.com/29y5mnwm */
            //   .commit("first commit", {
            //     "--author": constants.DEFAULT_COMMITTER,
            //   }),
            await service.init({ "--initial-branch": "main" });
            const repo = service.getRepository();

            // console.log(
            //   `repo, service.getWorkingDestinationPath() :>> `,
            //   repo,
            //   service.getWorkingDestinationPath()
            // );

            await repo.add(".");
            /** commit example - https://tinyurl.com/29y5mnwm */
            await repo.commit(options.message, {
              "--author": constants.DEFAULT_COMMITTER,
              "--allow-empty": null,
            });



            // return (
            //   (await service.init().then((service) => service.getRepository()))
            //     .add("./*")
            //     /** commit example - https://tinyurl.com/29y5mnwm */
            //     .commit("first commit", {
            //       "--author": constants.DEFAULT_COMMITTER,
            //     })
            // );
          },
          context: options._bacContext,
          serviceOptions: {},
        },
        context
      ),
      // debugRule(options),
    ]);
    return r;
  };
}
