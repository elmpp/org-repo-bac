import { chain, empty, mergeWith, Rule, url } from "@angular-devkit/schematics";
import { wrapServiceAsRule } from "@business-as-code/core";
import { Schema } from "./schema";

export default function (options: Schema): Rule {
  return (_tree, context) => {
    const originSource = options.originPath ? url(options.originPath) : empty();

console.log(`optionsFactory :>> `, options)

    const serviceRule = wrapServiceAsRule(
      {
        cb: options.cb,
        serviceName: options.serviceName,
        context: options._bacContext,
        serviceOptions: options.initialisationOptions,
      },
      context
    );

    // console.log(`context :>> `, context)
    // console.log(`options._bacContext :>> `, options._bacContext)

    const r = chain([mergeWith(originSource), serviceRule]);
    return r;
  };
}
