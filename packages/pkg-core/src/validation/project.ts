import { z } from "zod";
import { languageSchema, languageVariantSchema, projectTypeSchema, sourceLocation } from "./common";
import { ProjectMetadataConfig } from "@moonrepo/types";
import { expectTypeOf } from "expect-type";

/**
 defines the non-common attributes of a Project that must be detected during Source import
 */
const baseProjectSchema = z.object({

  /** blah blah */
  language: languageSchema,
  languageVariant: z.optional(languageVariantSchema),
  type: projectTypeSchema,
  name: z.string(),
  dependsOn: z.optional(z.string()),
  // aliases: z.array(z.string()),
})

// type BaseProject = z.infer<typeof baseProjectSchema>

export const projectConfigSchema = baseProjectSchema.merge(z.object({
  active: z.optional(z.boolean()),
  location: sourceLocation,
})
)


// type BaseProjectSchema = z.infer<typeof baseProjectSchema>

// expectTypeOf<BaseProjectSchema>().toMatchTypeOf<ProjectMetadataConfig>()


// export type BaseProject = {
//   language: Language
//   type: ProjectType
//   name: string
//   aliases: Aliases
// }

