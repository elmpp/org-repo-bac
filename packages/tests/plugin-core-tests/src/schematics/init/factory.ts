import {
  chain, Rule
} from "@angular-devkit/schematics";
import { constants, wrapServiceAsRule } from "@business-as-code/core";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree, schematicContext) => {

    const r = chain([
      // schematicTestUtils.debugRule(options),
      wrapServiceAsRule({
        serviceOptions: {
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
            await repo.commit('some message', {
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
          initialiseOptions: {},
        },
        schematicContext
  }),
      // schematicTestUtils.debugRule(options),
    ]);
    return r;
  };
}
