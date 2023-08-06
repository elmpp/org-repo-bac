import { z } from "zod"
import { LifecycleImplementedMethods, LifecycleOptionsByMethodKeyedByProviderWithoutCommon, LifecycleSingularReturnByMethod } from "../__types__"

export const providerOptionsSchemaBuilder = <LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods, PType = LifecycleOptionsByMethodKeyedByProviderWithoutCommon<LMethod>, S extends z.ZodObject<any, any, any> = z.ZodObject<any, any, any>>(_lifecycleMethod: LMethod, extendableSchema: S) => {
  return extendableSchema.extend(
      {
        provider: z.string(),
        options: z.object({
        }),
      }
    ) as unknown as z.ZodType<PType & z.infer<typeof extendableSchema>, z.ZodTypeDef>

  // return z.union([
  //   extendableSchema.extend(
  //     z.object({
  //       provider: z.string(),
  //       options: z.object({}),
  //     }) as any
  //   ) as any,
  //   extendableSchema.extend(
  //     z.object({
  //       provider: z.string(),
  //       options: z.object({}),
  //     }) as any
  //   ) as any,
  // ]) as unknown as z.ZodUnion<[z.ZodObject<InferRawShape<S>, "strip", z.ZodTypeAny, PType>]>
  // ]) as unknown as z.ZodType<PType & z.infer<typeof extendableSchema>, z.ZodTypeDef>
}

export const providerReturnSchemaBuilder = <LMethod extends LifecycleImplementedMethods = LifecycleImplementedMethods, PType = LifecycleSingularReturnByMethod<LMethod>, S extends z.ZodObject<any, any, any> = z.ZodObject<any, any, any>>(_lifecycleMethod: LMethod, extendableSchema: S) => {
  return z.union([
    extendableSchema.extend(
      {
        provider: z.string(),
        options: z.object({}),
      }
    ) as any,
    extendableSchema.extend(
      {
        provider: z.string(),
        options: z.object({}),
      }
    ) as any,
  // ]) as unknown as z.ZodUnion<[z.ZodObject<InferRawShape<S>, "strip", z.ZodTypeAny, PType>]>
  ]) as unknown as z.ZodType<PType & z.infer<typeof extendableSchema>, z.ZodTypeDef>
}
