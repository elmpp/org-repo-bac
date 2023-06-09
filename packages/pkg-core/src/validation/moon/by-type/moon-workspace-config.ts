import { z } from "zod";

export const constraintsConfigSchema = z.object({
	enforceProjectTypeRelationships: z.boolean(),
	tagRelationships: z.record(z.string(), z.array(z.string())),
})

export const generatorConfigSchema = z.object({
	templates: z.array(z.string()),
})

export const hasherConfigSchema = z.object({
		batchSize: z.number().nullable(),
		optimization: z.enum(['accuracy', 'performance']),
		walkStrategy: z.enum(['glob', 'vcs']),
		warnOnMissingInputs: z.boolean(),
	})

export const notifierConfigSchema = z.object({
	webhookUrl: z.string().nullable(),
})

export const runnerConfigSchema = z.object({
	archivableTargets: z.array(z.string()),
	cacheLifetime: z.string(),
	inheritColorsForPipedTasks: z.boolean(),
	logRunningCommand: z.boolean(),
})

export const vcsConfigSchema = z.object({
  defaultBranch: z.string(),
  manager: z.union([z.literal("git"), z.literal("svn")]),
  remoteCandidates: z.array(z.string())
})

export const workspaceConfigSchema = z.object({
	extends: z.string().nullable(),
	constraints: constraintsConfigSchema,
	generator: generatorConfigSchema,
	hasher: hasherConfigSchema,
	notifier: notifierConfigSchema,
	projects: z.union([
		z.record(z.string(), z.string()),
		z.array(z.string()),
		z.object({
			globs: z.array(z.string()),
			sources: z.record(z.string(), z.string()),
		})
	]),
	runner: runnerConfigSchema,
	telemetry: z.boolean(),
	vcs: vcsConfigSchema,
	versionConstraint: z.string().nullable(),
})
