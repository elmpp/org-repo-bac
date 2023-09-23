import { z } from "zod";
import { providerReturnOptionsSchemaBuilderArray } from "../utils";

/**
 configs are executable and contingent upon the project sources being imported. This
 static data structure is the result of this process. It is like the lockfile of the app
 */
export const configSynchronisedSchema = z.object({
  version: z.string(),
  /** define projects for the workspace */
  projects: providerReturnOptionsSchemaBuilderArray("configureWorkspace"),
});

export type ConfigSynchronisedSchema = z.infer<typeof configSynchronisedSchema>;

// export type Config =
//   LifecycleOptionsByMethodKeyedByProviderArray<"configureWorkspace">;
export type ConfigSynchronised = z.infer<typeof configSynchronisedSchema>;

// expectTypeOf<Config>().toMatchTypeOf<_Config>();
// expectTypeOf<_Config>().toMatchTypeOf<Config>();
