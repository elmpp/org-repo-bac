import { z } from 'zod'

export const templateVariableConfigSchema = z
  .object({
    default: z.boolean(),
    prompt: z.string().optional(),
    required: z.boolean().optional()
  })
  .strict()

export const templateBooleanVariableConfigSchema = z
  .object({
    default: z.boolean(),
    prompt: z.string().optional(),
    type: z.literal('boolean')
  })
  .strict()
export const templateStringVariableConfigSchema = z
  .object({
    default: z.string(),
    prompt: z.string().optional(),
    required: z.boolean().optional(),
    type: z.literal('string')
  })
  .strict()

export const templateEnumValueSchema = z
  .object({
    label: z.string(),
    value: z.string()
  })
  .strict()

export const templateEnumVariableConfigSchema = z
  .object({
    default: z.string(),
    multiple: z.boolean().optional(),
    prompt: z.string(),
    type: z.literal('enum'),
    values: z.array(z.union([templateEnumValueSchema, z.string()]))
  })
  .strict()

export const templateNumberVariableConfigSchema = z
  .object({
    default: z.number(),
    prompt: z.string().optional(),
    required: z.boolean().optional(),
    type: z.literal('number')
  })
  .strict()

export const templateVariable = z.union([
  templateBooleanVariableConfigSchema,
  templateEnumVariableConfigSchema,
  templateNumberVariableConfigSchema,
  templateStringVariableConfigSchema
])

export const templateConfigSchema = z
  .object({
    description: z.string(),
    title: z.string(),
    variables: z.record(z.string(), templateVariable)
  })
  .strict()

export const templateFrontmatterConfigSchema = z
  .object({
    force: z.boolean().optional(),
    to: z.string().optional(),
    skip: z.boolean().optional()
  })
  .strict()
