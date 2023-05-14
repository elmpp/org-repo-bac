import { z } from "zod";
import { projectSchema } from "./project";

/**
 configs are executable and contingent upon the project sources being imported. This
 static data structure is the result of this process. It is like the lockfile of the app
 */
export const configSchema = z.object({
  version: z.number(),
  projects: z.array(projectSchema),
  // projects: z.array(projectConfigSchema.merge({})),
});

export type Config = z.infer<typeof configSchema>;
