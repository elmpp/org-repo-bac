import { z } from "zod";
import { languageSchema, projectTypeSchema } from "./common";

/**
 defines the non-common attributes of a Project that must be detected during Source import
 */
const baseProjectSchema = z.object({
  language: languageSchema,
  type: projectTypeSchema,
  name: z.string(),
  aliases: z.array(z.string()),
})

// type BaseProject = z.infer<typeof baseProjectSchema>

export const projectConfigSchema = baseProjectSchema.merge(z.object({
  active: z.optional(z.boolean()),
})
)


// export type BaseProject = {
//   language: Language
//   type: ProjectType
//   name: string
//   aliases: Aliases
// }

