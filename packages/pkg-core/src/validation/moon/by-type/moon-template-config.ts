import { z } from "zod";

export const templateVariableConfigSchema = z.object({
	default: z.boolean(),
	prompt: z.string().nullable(),
	required: z.boolean().nullable(),
})

export const templateBooleanVariableConfigSchema = z.object({
	default: z.boolean(),
	prompt: z.string().nullable(),
	type: z.literal('boolean'),
})
export const templateStringVariableConfigSchema = z.object({
	default: z.string(),
	prompt: z.string().nullable(),
	required: z.boolean().nullable(),
	type: z.literal('string'),
})

export const templateEnumValueSchema = z.object({
  label: z.string(),
  value: z.string()
})

export const templateEnumVariableConfigSchema = z.object({
	default: z.string(),
	multiple: z.boolean().nullable(),
	prompt: z.string(),
	type: z.literal('enum'),
	values: z.array(z.union([templateEnumValueSchema, z.string()])),
})


export const templateNumberVariableConfigSchema = z.object({
	default: z.number(),
	prompt: z.string().nullable(),
	required: z.boolean().nullable(),
	type: z.literal('number'),
})

export const templateVariable = z.union([templateBooleanVariableConfigSchema, templateEnumVariableConfigSchema, templateNumberVariableConfigSchema, templateStringVariableConfigSchema])

export const templateConfigSchema = z.object({
	description: z.string(),
	title: z.string(),
	variables: z.record(z.string(), templateVariable),
})

export const templateFrontmatterConfigSchema = z.object({
  force: z.boolean().nullable(),
  to: z.string().nullable(),
  skip: z.boolean().nullable()
})
