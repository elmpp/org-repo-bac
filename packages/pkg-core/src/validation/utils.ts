import { z } from 'zod'
import {
  LifecycleImplementedMethods,
  LifecycleOptionsByMethodKeyedByProviderWithoutCommonSingular,
  LifecycleReturnByMethodArray,
  LifecycleReturnByMethodSingular
} from '../__types__/lifecycles'

export const providerOptionsSchemaBuilder = <
  LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods,
  PType = LifecycleOptionsByMethodKeyedByProviderWithoutCommonSingular<LMethod>
>(
  _lifecycleMethod: LMethod
) => {
  return z.object({
    provider: z.string(),
    options: z.object({})
  }) as unknown as z.ZodType<PType, z.ZodTypeDef>
}
// export const providerOptionsSchemaBuilder = <LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods, PType = LifecycleOptionsByMethodKeyedByProviderWithoutCommon<LMethod>, S extends z.ZodObject<any, any, any> = z.ZodObject<any, any, any>>(_lifecycleMethod: LMethod, extendableSchema: S) => {
//   return extendableSchema.extend(
//       {
//         provider: z.string(),
//         options: z.object({
//         }),
//       }
//     ) as unknown as z.ZodType<PType & z.infer<typeof extendableSchema>, z.ZodTypeDef>
// }

export const providerReturnOptionsSchemaBuilderArray = <
  LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods
>(
  _lifecycleMethod: LMethod
) => {
  return z.array(
    z.object({
      provider: z.string(),
      options: z.object({})
      // }))
      // })) as unknown as z.ZodType<PType, z.ZodTypeDef>
    })
  ) as unknown as z.ZodType<LifecycleReturnByMethodArray<LMethod>, z.ZodTypeDef>
}
export const providerReturnOptionsSchemaBuilderSingular = <
  LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods
>(
  _lifecycleMethod: LMethod
) => {
  return z.object({
    provider: z.string(),
    options: z.object({})
    // })
    // }) as unknown as z.ZodType<PType, z.ZodTypeDef>
  }) as unknown as z.ZodType<
    LifecycleReturnByMethodSingular<LMethod>,
    z.ZodTypeDef
  >
}
// export const providerReturnSchemaBuilder = <LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods, PType = LifecycleSingularReturnByMethod<LMethod>, S extends z.ZodObject<any, any, any> = z.ZodObject<any, any, any>>(_lifecycleMethod: LMethod, extendableSchema: S) => {
//   return z.union([
//     extendableSchema.extend(
//       {
//         provider: z.string(),
//         options: z.object({}),
//       }
//     ) as any,
//     extendableSchema.extend(
//       {
//         provider: z.string(),
//         options: z.object({}),
//       }
//     ) as any,
//   // ]) as unknown as z.ZodUnion<[z.ZodObject<InferRawShape<S>, "strip", z.ZodTypeAny, PType>]>
//   ]) as unknown as z.ZodType<PType & z.infer<typeof extendableSchema>, z.ZodTypeDef>
// }
