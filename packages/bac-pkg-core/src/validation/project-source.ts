import { z } from "zod";
import { fsTreeSchema, languageSchema, projectTypeSchema } from "./common";
import { projectConfigSchema } from "./project";

const baseProjectSourceSchema = z.object({
  protocol: z.literal('git'),
})


// type BaseProject = z.infer<typeof baseProjectSchema>

export const projectSourceConfigSchema = baseProjectSourceSchema.merge(z.object({
  /** to be properly validated */
  location: z.string(),
  active: z.optional(z.boolean()),

  detectProject: z.union([
    z.array(
      z.function()
      .args(z.object({
        fsTree: fsTreeSchema,
      }))
      .returns(z.optional(
        projectConfigSchema,
        // .implement((x) => )
      )),
    ),
    projectConfigSchema,
  ])
})
)


// export type BaseProject = {
//   language: Language
//   type: ProjectType
//   name: string
//   aliases: Aliases
// }

