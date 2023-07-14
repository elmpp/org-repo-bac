import { z } from "zod";
import { Simplify } from '../../__types__';
import { providerOptionsSchemaBuilder } from "../utils";

// const baseProjectSourceSchema = z.object({
//   protocol: z.literal('git'),
// })

// const providerBaseUnion = <T extends string>(val: T) => z.object({
//   provider: z.literal(val)
// })
// const providerUnion = <T>(schemas: z.ZodTypeAny[]): z.ZodTypeAny => z.discriminatedUnion('provider', schemas)


// type BaseProject = z.infer<typeof baseProjectSchema>

// const schemaForType = <T>() => <S extends z.ZodType<T, any, any>>(arg: S) => {
//   return arg;
// };
// const zodCif = <Z extends z.ZodTypeAny, T extends z.infer<Z>>(schema: Z) => (args: T) => {return schema}

// type D = LifecycleOptionsByProvider<'initialiseWorkspace'>
// type DDN3 = DDN<'initialiseWorkspace'>
// type D2 = LifecycleOptionsByProvider<'beforeConfigureWorkspace'>
// type DDDDDD = LifecycleOptionsByProvider<LifecycleMethods>['provider']
// type De = LifecycleOptionsByProvider<LifecycleImplementedMethods>
// type DDN<LMethod extends LifecycleImplementedMethods, ProviderType extends LifecycleOptionsByProvider<LMethod> = LifecycleOptionsByProvider<LMethod>> = {
//   // [K in keyof LifecycleOptionsByProvider<'initialiseWorkspace'>]: z.ZodTypeAny
//   provider: ProviderType['provider']
//   options: ProviderType['options']
// }
// const dog = schemaForType<LifecycleOptionsByProvider<'initialiseWorkspace'>>()(
//   z.object({
//     provider: z.string(),
//     options: z.object({}),
//   })
// );

// type DDDD = LifecycleOptionsByProvider<'initialiseWorkspace'>
// type DDDDds = ProviderMapped<'initialiseWorkspace'>
// type ProviderMapped<LMethod extends LifecycleImplementedMethods, PType extends LifecycleOptionsByProvider<LMethod> = LifecycleOptionsByProvider<LMethod>> = PType extends {provider: string, options: unknown} ? {
//   provider: z.ZodLiteral<PType['provider']>
//   options: z.ZodType<PType['options'], z.ZodTypeDef, PType['options']>
//   // options: z.ZodObject<{z: PType['options']}, "strip", z.ZodTypeAny>
//   // provider: PType['provider']
//   // options: PType['options']
// } : never

// z.custom<LifecycleOptionsByProvider<'initialiseWorkspace'>>()
// const providerSchema = z.object({
//   provider: z.string(),
//   options: z.object({}),
// }) as unknown as z.ZodObject<ProviderMapped<'initialiseWorkspace'>, "strip", z.ZodTypeAny>
// type DDDDDDD = (typeof providerSchema)['_type']
// type InferedProvie = Simplify<z.infer<typeof providerSchema>>
// const someProvider22 = zodCif(providerSchema)({
//   provider: 'core',
//   options: {
//     l: 'lww',
//   }
// })
// const poo = z.custom<{a: 'a'}>()
// const lll = z.object({
//   provider: z.string(),
//   options: z.object({}),
// }) as unknown as z.ZodType<LifecycleOptionsByProvider<'initialiseWorkspace'>>
// type LLLL = (typeof lll)['_output']

// type InferRawShape<T extends z.SomeZodObject> = T extends z.ZodObject<infer R> ? R : never

// const bb = z.object({blah: z.number()})
// type DDS = InferRawShape<typeof bb>

// const providerOptionsSchemaBuilder = <LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods, PType = LifecycleOptionsByProvider<LMethod>, S extends z.ZodObject<any, any, any> = z.ZodObject<any, any, any>>(lifecycleMethod: LMethod, schema: S) => {
//   return z.union([
//     schema.extend(
//       z.object({
//         provider: z.string(),
//         options: z.object({}),
//       }) as any
//     ) as any,
//     schema.extend(
//       z.object({
//         provider: z.string(),
//         options: z.object({}),
//       }) as any
//     ) as any,
//   // ]) as unknown as z.ZodUnion<[z.ZodObject<InferRawShape<S>, "strip", z.ZodTypeAny, PType>]>
//   ]) as unknown as z.ZodType<PType & z.infer<typeof schema>, z.ZodTypeDef>
// }
// ) as z.ZodObject<InferRawShape<S>, "strip", z.ZodTypeAny, PType>
// const h = z.custom<LifecycleOptionsByProvider<'initialiseWorkspace'> & {blah: number}>()

// type PType = LifecycleOptionsByProvider<'initialiseWorkspace'>
// const extendableSchema = z.object({blah: z.number()})
// type BFE = z.infer<typeof extendableSchema>
// const aProviderSchema = providerSchemaBuilder('initialiseWorkspace', extendableSchema)
// // const aProviderSchema = providerSchemaBuilder<PType>(extendableSchema)
// type DBVcf = (typeof aProviderSchema)['_output']
// type DBVc = typeof aProviderSchema
// type DBV2 = z.infer<typeof aProviderSchema>
// type Gittt = Extract<DBV2, {provider: 'git'}>
// type Corrett = Extract<DBV2, {provider: 'core'}>
// type DBV3 = z.infer<typeof aProviderSchema>['options']
// // const aProviderSchema2 = z.object({blah: z.number()})

// const someProvider = zodCif(aProviderSchema)({
//   // blah: 3,
//   provider: 'git',
//   // else: 'gb',
//   options: {
//     b: 'b',
//   },
//   blah: 3,
// })
// type SomeProvider = z.infer<typeof someProvider>
// const someProvider2 = zodCif(aProviderSchema2)({

// })
// const aProviderRes = aProviderSchema.parse({

// })

// zodCif(h)({
//   provider: 'core',
//   options: {l: 'l'},
//   blah: 6,
// })





const commonProjectSourceSchema = z.object({
  // blah: z.number()
  active: z.boolean().optional(),
})

// type DDD = z.infer<typeof commonProjectSourceSchema>
// type BBBB = LifecycleOptionsByMethodKeyedByProvider<'configureWorkspace'>
// type BFE = z.infer<typeof commonProjectSourceSchema>
export const configProjectSourceConfigSchema = providerOptionsSchemaBuilder('configureWorkspace', commonProjectSourceSchema)
// export const configProjectSourceConfigSchema = commonProjectSourceSchema
export type ConfigProjectSourceConfig = Simplify<z.infer<typeof configProjectSourceConfigSchema>>

// type BFE = Simplify<z.infer<typeof configProjectSourceConfigSchema>>

// const someProvider = zodCif(aProviderSchema)({
//   // blah: 3,
//   provider: 'git',
//   // else: 'gb',
//   options: {
//     b: 'b',
//   },
//   active: true,
// })


// export const configProjectSourceConfigSchema = z.object({
//   protocol: z.literal('git'),
//   /** to be properly validated */
//   location: z.string(),
//   active: z.optional(z.boolean()),

//   getProject: z.array(
//       // z.discriminatedUnion('provider', [
//       //   z.custom<LifecycleMethodAsProvider<'configureWorkspace'>>()
//       //   // z.object({
//       //   //   provider: z.custom<LifecycleProviders<'configureWorkspace'>>(),
//       //   //   options: z.custom<LifecycleMethodOptions<'configureWorkspace'>>()
//       //   // })
//       // ])
//       // z.discriminatedUnion('provider', z.custom<{}>())
//       z.custom<LifecycleOptionsByProvider<'initialiseWorkspace'>>()
//   )
//   // getProject: z.union([
//   //   z.array(
//   //     z.function()
//   //     .args(z.object({
//   //       tree: z.custom<Tree>(), // no implementation function here - not user supplied
//   //       sourceLocation: sourceLocation,
//   //     }))
//   //     .returns(z.optional(
//   //       projectSchema,
//   //       // .implement((x) => )
//   //     )),
//   //   ),
//   //   projectSchema,
//   // ])
// })



// const myConfig: ConfigProjectSourceConfig = {
//   protocol: 'git',
//   location: 'erge',
//   active: true,
//   getProject: [
//     {
//       provider: 'core',
//       options: {l: 'l'},
//     }
//   ],
// }
// const poo = configProjectSourceConfigSchema.parse(myConfig)



// export type BaseProject = {
//   language: Language
//   type: ProjectType
//   name: string
//   aliases: Aliases
// }

