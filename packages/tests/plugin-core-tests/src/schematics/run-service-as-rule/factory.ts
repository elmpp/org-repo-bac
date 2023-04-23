import { chain, empty, mergeWith, Rule, SchematicContext, Tree, url } from "@angular-devkit/schematics";
import { schematicUtils } from "@business-as-code/core";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree: Tree, schematicContext: SchematicContext) => {
    const originSource = options.originPath ? url(options.originPath) : empty();

    const serviceRule = schematicUtils.wrapServiceAsRule({
      serviceOptions: {
        cb: options.cb,
        serviceName: options.serviceName,
        context: options._bacContext,
        initialiseOptions: options.initialiseOptions,
      },
      schematicContext
    }
    );

    // console.log(`context :>> `, context)
    // console.log(`options._bacContext :>> `, options._bacContext)

    const r = chain([mergeWith(originSource), serviceRule]);
    return r;
  };
}
