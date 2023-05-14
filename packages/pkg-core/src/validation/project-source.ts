import type {Tree} from '@angular-devkit/schematics'
import { z } from "zod";
import { sourceLocation } from './common';
import { projectSchema } from "./project";

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
        tree: z.custom<Tree>(), // no implementation function here - not user supplied
        sourceLocation: sourceLocation,
      }))
      .returns(z.optional(
        projectSchema,
        // .implement((x) => )
      )),
    ),
    projectSchema,
  ])
})
)


// export type BaseProject = {
//   language: Language
//   type: ProjectType
//   name: string
//   aliases: Aliases
// }

