// import type { Platform } from './common';
// import type {
// 	DependencyConfig,
// 	InheritedTasksConfig,
// 	ProjectConfig,
// 	ProjectLanguage,
// 	ProjectType,
// 	TaskMergeStrategy,
// 	TaskOutputStyle,
// } from './project-config';

import { z } from "zod";
import { platformSchema } from "./common";
// import { projectTypeSchema } from "../common";
// import { projectConfigSchema } from "../project";
import { dependencyScopeSchema, inheritedTasksConfigSchema, projectConfigSchema, projectLanguageSchema, taskMergeStrategySchema, taskOutputStyleSchema } from "./project-config";
// import { projectTypeSchema } from "../common";
// import { projectConfigSchema } from "../project";
// import { dependencyScopeSchema, inheritedTasksConfigSchema, projectLanguageSchema } from "./moon-project-config";

export const projectTypeSchema = z.union([
  z.literal("application"),
  z.literal("library"),
  z.literal("tool"),
  z.literal("unknown"),
]);

export const taskTypeSchema = z.union([
  z.literal("build"),
  z.literal("run"),
  z.literal("test")
])

export const fileGroupSchema = z.object({
  files: z.array(z.string()),
  id: z.string(),
  globs: z.array(z.string()),
}).strict()

export const taskOptionsSchema = z.object({
  affectedFiles: z.union([
    z.literal("args"),
    z.literal("both"),
    z.literal("env")
  ]).nullable(),
  cache: z.boolean(),
  envFile: z.string().nullable(),

  mergeArgs: taskMergeStrategySchema,
	mergeDeps: taskMergeStrategySchema,
	mergeEnv: taskMergeStrategySchema,
	mergeInputs: taskMergeStrategySchema,
	mergeOutputs: taskMergeStrategySchema,
	outputStyle: taskOutputStyleSchema.nullable(),

  retryCount: z.number(),
  runDepsInParallel: z.boolean(),
  runInCI: z.boolean().optional(),
  runFromWorkspaceRoot: z.boolean(),
  shell: z.boolean(),
  persistent: z.boolean().optional(), // v1.6.0 onwards
}).strict()

export const taskSchema = z.object({
  args: z.array(z.string()),
  command: z.string(),
  deps: z.array(z.string()),
  env: z.record(z.string()),
  id: z.string(),
  inputs: z.array(z.string()),
  inputGlobs: z.array(z.string()),
  inputPaths: z.array(z.string()),
  inputVars: z.array(z.string()),
  options: taskOptionsSchema,
  outputs: z.array(z.string()),
  outputGlobs: z.array(z.string()),
  outputPaths: z.array(z.string()),
	// platform: Platform;
  target: z.string(),
	// type: TaskType;

  // not in types at all
  flags: z.record(z.unknown()),
  globalInputs: z.array(z.string()).optional(),
  platform: platformSchema,
  type: taskTypeSchema,
}).strict()

export const projectDependencySchema = z.object({
	id: z.string(),
  scope: dependencyScopeSchema,
  via: z.string().optional(),
	source: z.union([z.literal("explicit"), z.literal("implicit")]),
}).strict()

export const projectSchema = z.object({
  alias: z.string().nullable().optional(),
	config: z.union([projectConfigSchema, z.object({})]),
	// config: projectConfigSchema,
	dependencies: z.record(z.string(), projectDependencySchema),
	// dependencies: Record<string, ProjectDependency>;
	fileGroups: z.record(z.string(), fileGroupSchema),
	// fileGroups: Record<string, FileGroup>;
  id: z.string(),
  inherited: z.object({
    config: inheritedTasksConfigSchema,
    layers: z.unknown(),
    order: z.array(z.string()),
  }),
	language: projectLanguageSchema,
  platform: platformSchema,
  root: z.string(),
  source: z.string(),
	tasks: z.record(z.string(), taskSchema),
	type: projectTypeSchema,
}).strict()

// export interface Project {
// 	alias: string | null;
// 	// config: ProjectConfig;
// 	// dependencies: Record<string, ProjectDependency>;
// 	// fileGroups: Record<string, FileGroup>;
// 	id: string;
// 	// inheritedConfig: InheritedTasksConfig;
// 	// language: ProjectLanguage;
// 	root: string;
// 	source: string;
// 	// tasks: Record<string, Task>;
// 	// type: ProjectType;
// }
