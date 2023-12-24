import { z } from 'zod'
import { originProviderTypeSchema } from '../common'
import { projectSchema as moonProjectSchema } from '../moon/by-state-files/project'
import { configTeamSchema } from './config-team'

/**
 defines the non-common attributes of a Project that must be detected during Source import
 */
// const baseProjectSchema = z.object({
//   /** blah blah */
//   language: languageSchema,
//   languageVariant: z.optional(languageVariantSchema),
//   type: projectTypeSchema,
//   name: z.string(),
//   dependsOn: z.optional(z.string()),
//   // aliases: z.array(z.string()),
// });

/** let's not keep moon task/config info */
const baseMoonProjectSchema = moonProjectSchema.pick({
  alias: true,
  // config: true,
  dependencies: true,
  // fileGroups: true,
  id: true,
  // inheritedConfig: true,
  language: true,
  root: true,
  source: true,
  // tasks: true,
  type: true
})

const configProjectOriginSchema = z
  .object({
    provider: originProviderTypeSchema

    // /** the provider can store a hash to prevent reimport */
    // lastHashTime: z.string().datetime(),
    // lastHash: z.string(),
  })
  .catchall(z.unknown())

export const configProjectSchema = z.object({
  stage: baseMoonProjectSchema, // we're calling the /repo area 'stage'
  origin: configProjectOriginSchema,
  teams: z.record(z.string(), configTeamSchema)
})

// type BaseProject = z.infer<typeof baseProjectSchema>

// export const projectConfigSchema = baseProjectSchema.merge(
//   z.object({
//     active: z.optional(z.boolean()),
//     location: sourceLocation,
//   })
// );

// type BaseProjectSchema = z.infer<typeof baseProjectSchema>

// expectTypeOf<BaseProjectSchema>().toMatchTypeOf<ProjectMetadataConfig>()

// export type BaseProject = {
//   language: Language
//   type: ProjectType
//   name: string
//   aliases: Aliases
// }
