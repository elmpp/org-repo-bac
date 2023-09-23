import { z } from "zod";
import { configProjectSourceConfigSchema } from "./config-project-source";

/**
 entire workspace is driven by this configuration format. Highly optional
 */
// export const configSchema = providerOptionsSchemaBuilder(
//   "configureWorkspace",
//   z.object({})
// );
export const configSchema = z.object({
  /** define projects for the workspace */
  projectSource: z.array(configProjectSourceConfigSchema),
});

// export type _Config =
//   LifecycleOptionsByMethodKeyedByProviderArray<"configureWorkspace">;
export type Config = z.infer<typeof configSchema>;

// expectTypeOf<Config>().toMatchTypeOf<_Config>();
// expectTypeOf<_Config>().toMatchTypeOf<Config>();
