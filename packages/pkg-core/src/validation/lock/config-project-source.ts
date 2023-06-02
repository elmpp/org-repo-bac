import { z } from "zod";
// import { LifecycleProviders } from '../../__types__';

// const baseProjectSourceSchema = z.object({
//   protocol: z.literal('git'),
// })

// const providerBaseUnion = <T extends string>(val: T) => z.object({
//   provider: z.literal(val)
// })
// const providerUnion = <T>(schemas: z.ZodTypeAny[]): z.ZodTypeAny => z.discriminatedUnion('provider', schemas)


// type BaseProject = z.infer<typeof baseProjectSchema>

export const configProjectSourceConfigSchema = z.object({
  protocol: z.literal('git'),
  /** to be properly validated */
  location: z.string(),
  active: z.optional(z.boolean()),

  // getProject: z.array(
  //     z.discriminatedUnion('provider', [
  //       z.object({
  //         provider: z.custom<LifecycleProviders<''>>
  //       })
  //     ])
  // )
  // getProject: z.union([
  //   z.array(
  //     z.function()
  //     .args(z.object({
  //       tree: z.custom<Tree>(), // no implementation function here - not user supplied
  //       sourceLocation: sourceLocation,
  //     }))
  //     .returns(z.optional(
  //       projectSchema,
  //       // .implement((x) => )
  //     )),
  //   ),
  //   projectSchema,
  // ])
})


// export type BaseProject = {
//   language: Language
//   type: ProjectType
//   name: string
//   aliases: Aliases
// }

