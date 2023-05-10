// import type { Nullable, Platform } from './common';
// import type { NodeConfig, TypeScriptConfig } from './toolchain-config';

import { z } from "zod";
import { platformSchema } from "./common";

export const dependencyScopeSchema = z.union([
  z.literal("development"),
  z.literal("peer"),
  z.literal("production")
])

export const dependencyConfigSchema = z.object({
  id: z.string(),
  scope: dependencyScopeSchema,
  via: z.string().optional()
}).strict()

export const taskMergeStrategySchema = z.union([
  z.literal("append"),
  z.literal("prepend"),
  z.literal("replace")
])

export const taskOutputStyleSchema = z.union([
  z.literal("buffer-only-failure"),
  z.literal("buffer"),
  z.literal("hash"),
  z.literal("none"),
  z.literal("stream")
])

export const taskOptionsConfigSchema = z.object({
  affectedFiles: z
    .union([z.boolean(), z.literal("args"), z.literal("env")])
    .nullable()
    .optional(),
  cache: z.boolean().optional(),
  envFile: z.union([z.boolean(), z.string()]).nullable().optional(),
	mergeArgs: taskMergeStrategySchema.optional(),
	mergeDeps: taskMergeStrategySchema.optional(),
	mergeEnv: taskMergeStrategySchema.optional(),
	mergeInputs: taskMergeStrategySchema.optional(),
	mergeOutputs: taskMergeStrategySchema.optional(),
	outputStyle: taskOutputStyleSchema.nullable().optional(),
  retryCount: z.number().optional(),
  runDepsInParallel: z.boolean().optional(),
  runInCI: z.boolean().optional(),
  runFromWorkspaceRoot: z.boolean().optional(),
  shell: z.boolean().optional()
}).strict()

export const taskConfigSchema = z.object({
  command: z.union([z.array(z.string()), z.string()]).optional(),
  args: z.union([z.array(z.string()), z.string()]).optional(),
  deps: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  inputs: z.array(z.string()).optional(),
  local: z.boolean().optional(),
  outputs: z.array(z.string()).optional(),
	options: taskOptionsConfigSchema.optional(),
	platform: platformSchema,
}).strict()

export const projectLanguageSchema = z.union([
  z.literal("bash"),
  z.literal("batch"),
  z.literal("go"),
  z.literal("javascript"),
  z.literal("php"),
  z.literal("python"),
  z.literal("ruby"),
  z.literal("rust"),
  z.literal("typescript"),
  z.literal("unknown")
])

export const projectTypeSchema = z.union([
  z.literal("application"),
  z.literal("library"),
  z.literal("tool"),
  z.literal("unknown")
])

export const projectMetadataConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  owner: z.string(),
  maintainers: z.array(z.string()),
  channel: z.string()
}).strict()

export const projectToolchainNodeConfigSchema = z.object({
	version: z.string().optional(),
}).strict()

export const projectToolchainTypeScriptConfigSchema = z.object({
		routeOutDirToCache: z.boolean().optional(),
		syncProjectReferences: z.boolean().optional(),
		syncProjectReferencesToPaths: z.boolean().optional(),
		disabled: z.boolean(),
}).strict()


export const projectToolchainConfigSchema = z.object({
	node: projectToolchainNodeConfigSchema.optional(),
	typescript: projectToolchainTypeScriptConfigSchema.optional(),
}).strict()

export const projectWorkspaceConfigSchema = z.object({
	inheritedTasks: z.object({
    exclude: z.array(z.string()).optional(),
    include: z.array(z.string()).optional(),
    rename: z.record(z.string()).optional()
  })
}).strict()

export const projectConfigSchema = z.object({
	dependsOn: z.array(z.union([dependencyConfigSchema, z.string()])),
	env: z.record(z.string(), z.string()).optional(),
	fileGroups: z.record(z.string(), z.array(z.string())),
	language: projectLanguageSchema,
	platform: platformSchema.optional(),
	project: projectMetadataConfigSchema.optional(),
	tags: z.array(z.string()),
	tasks: z.record(z.string(), taskConfigSchema),
	toolchain: projectToolchainConfigSchema,
	type: projectTypeSchema,
	workspace: projectWorkspaceConfigSchema,
}).strict()

export const inheritedTasksConfigSchema = z.object({
  extends: z.string().optional(),
  fileGroups: z.record(z.array(z.string())).optional(),
  implicitDeps: z.array(z.string()).optional(),
  implicitInputs: z.array(z.string()).optional(),
	tasks: z.record(z.string(), taskConfigSchema).optional(),
}).strict()
