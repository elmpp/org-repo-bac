import { chain, empty, mergeWith, move, Rule } from "@angular-devkit/schematics";
import { schematicUtils } from "@business-as-code/core";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree, schematicContext) => {
    return chain([
      mergeWith(empty()),
      schematicUtils.wrapServiceAsRule({
        serviceOptions: {
          serviceName: "git",
          cb: async ({ service }) => {
            await service.clone(`https://github.com/elmpp/bac-tester.git`, {});
          },
          initialiseOptions: {
            workingPath: '.',
          },
          context: options._bacContext,
        },
        schematicContext,
      }

      ),
      move(options.destinationPath),
    ]);
  };
}
