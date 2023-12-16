import { z } from "zod";
import { providerReturnOptionsSchemaBuilderArray } from "../utils";

export const configConfiguredSchema = z.object({
  version: z.string(),
  /** define projects for the workspace */
  projects: providerReturnOptionsSchemaBuilderArray("configureWorkspace"),
});

export type ConfigConfiguredSchema = z.infer<typeof configConfiguredSchema>;

export type ConfigConfigured = z.infer<typeof configConfiguredSchema>;
