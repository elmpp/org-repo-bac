import { z } from 'zod';
import { dependencyConfigSchema, dependencyScopeSchema, inheritedTasksConfigSchema, projectConfigSchema, projectLanguageSchema, projectMetadataConfigSchema, projectToolchainConfigSchema, projectToolchainNodeConfigSchema, projectToolchainTypeScriptConfigSchema, projectTypeSchema, projectWorkspaceConfigSchema, taskConfigSchema, taskMergeStrategySchema, taskOptionsConfigSchema, taskOutputStyleSchema } from '../project-config';

export type MoonDependencyScope = z.infer<typeof dependencyScopeSchema>
export type MoonDependencyConfig = z.infer<typeof dependencyConfigSchema>
export type MoonDependencyScopeSchema = z.infer<typeof dependencyScopeSchema>
export type MoonTaskMergeStrategy = z.infer<typeof taskMergeStrategySchema>
export type MoonTaskOutputStyle = z.infer<typeof taskOutputStyleSchema>
export type MoonTaskOptionsConfig = z.infer<typeof taskOptionsConfigSchema>
export type MoonTaskConfig = z.infer<typeof taskConfigSchema>
export type MoonProjectLanguage = z.infer<typeof projectLanguageSchema>
export type MoonProjectType = z.infer<typeof projectTypeSchema>
export type MoonProjectMetadataConfig = z.infer<typeof projectMetadataConfigSchema>
export type MoonProjectToolchainNodeConfig = z.infer<typeof projectToolchainNodeConfigSchema>
export type MoonProjectToolchainTypeScriptConfig = z.infer<typeof projectToolchainTypeScriptConfigSchema>
export type MoonProjectToolchainConfig = z.infer<typeof projectToolchainConfigSchema>
export type MoonProjectWorkspaceConfig = z.infer<typeof projectWorkspaceConfigSchema>
export type MoonProjectConfig = z.infer<typeof projectConfigSchema>
export type MoonInheritedTasksConfig = z.infer<typeof inheritedTasksConfigSchema>

