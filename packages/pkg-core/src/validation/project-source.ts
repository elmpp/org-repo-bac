import type { FSTree } from '@business-as-code/fslib';
import { z } from "zod";
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
        fsTree: z.custom<FSTree>(), // no implementation function here - not user supplied
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

