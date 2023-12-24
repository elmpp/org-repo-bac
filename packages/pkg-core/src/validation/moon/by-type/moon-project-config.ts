// import type { Nullable, Platform } from './common';
// import type { NodeConfig, TypeScriptConfig } from './toolchain-config';

import { z } from 'zod'
import { platformSchema } from './moon-common'

export const dependencyScopeSchema = z.union([
  z.literal('development'),
  z.literal('peer'),
  z.literal('production')
])

export const dependencyConfigSchema = z.object({
  id: z.string(),
  scope: dependencyScopeSchema,
  via: z.string().nullable()
})

export const taskMergeStrategySchema = z.union([
  z.literal('append'),
  z.literal('prepend'),
  z.literal('replace')
])

export const taskOutputStyleSchema = z.union([
  z.literal('buffer-only-failure'),
  z.literal('buffer'),
  z.literal('hash'),
  z.literal('none'),
  z.literal('stream')
])

export const taskOptionsConfigSchema = z.object({
  affectedFiles: z
    .union([z.boolean(), z.literal('args'), z.literal('env')])
    .nullable(),
  cache: z.boolean().nullable(),
  envFile: z.union([z.boolean(), z.string()]).nullable(),
  mergeArgs: taskMergeStrategySchema.nullable(),
  mergeDeps: taskMergeStrategySchema.nullable(),
  mergeEnv: taskMergeStrategySchema.nullable(),
  mergeInputs: taskMergeStrategySchema.nullable(),
  mergeOutputs: taskMergeStrategySchema.nullable(),
  outputStyle: taskOutputStyleSchema.nullable(),
  retryCount: z.number().nullable(),
  runDepsInParallel: z.boolean().nullable(),
  runInCI: z.boolean().nullable(),
  runFromWorkspaceRoot: z.boolean().nullable(),
  shell: z.boolean().nullable()
})

export const taskConfigSchema = z.object({
  command: z.union([z.array(z.string()), z.string()]).nullable(),
  args: z.union([z.array(z.string()), z.string()]).nullable(),
  deps: z.array(z.string()).nullable(),
  env: z.record(z.string()).nullable(),
  inputs: z.array(z.string()).nullable(),
  local: z.boolean(),
  outputs: z.array(z.string()).nullable(),
  options: taskOptionsConfigSchema,
  platform: platformSchema
})

export const projectLanguageSchema = z.union([
  z.literal('bash'),
  z.literal('batch'),
  z.literal('go'),
  z.literal('javascript'),
  z.literal('php'),
  z.literal('python'),
  z.literal('ruby'),
  z.literal('rust'),
  z.literal('typescript'),
  z.literal('unknown')
])

export const projectTypeSchema = z.union([
  z.literal('application'),
  z.literal('library'),
  z.literal('tool'),
  z.literal('unknown')
])

export const projectMetadataConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  owner: z.string(),
  maintainers: z.array(z.string()),
  channel: z.string()
})

export const projectToolchainNodeConfigSchema = z.object({
  version: z.string().nullable()
})

export const projectToolchainTypeScriptConfig = z.object({
  routeOutDirToCache: z.boolean().nullable(),
  syncProjectReferences: z.boolean().nullable(),
  syncProjectReferencesToPaths: z.boolean().nullable(),
  disabled: z.boolean()
})

export const projectToolchainConfigSchema = z.object({
  node: projectToolchainNodeConfigSchema.nullable(),
  typescript: projectToolchainTypeScriptConfig.nullable()
})

export const projectWorkspaceConfigSchema = z.object({
  inheritedTasks: z.object({
    exclude: z.array(z.string()).nullable(),
    include: z.array(z.string()).nullable(),
    rename: z.record(z.string()).nullable()
  })
})

export const projectConfigSchema = z.object({
  dependsOn: z.array(z.union([dependencyConfigSchema, z.string()])),
  env: z.record(z.string(), z.string()).nullable(),
  fileGroups: z.record(z.string(), z.array(z.string())),
  language: projectLanguageSchema,
  platform: platformSchema.nullable(),
  project: projectMetadataConfigSchema.optional(),
  tags: z.array(z.string()),
  tasks: z.record(z.string(), taskConfigSchema),
  toolchain: projectToolchainConfigSchema,
  type: projectTypeSchema,
  workspace: projectWorkspaceConfigSchema
})

export const inheritedTasksConfigSchema = z.object({
  extends: z.string().nullable(),
  fileGroups: z.record(z.array(z.string())),
  implicitDeps: z.array(z.string()),
  implicitInputs: z.array(z.string()),
  tasks: z.record(z.string(), taskConfigSchema)
})
