import { z } from 'zod'

export const denoConfigSchema = z
  .object({
    depsFile: z.string(),
    lockfile: z.string()
  })
  .strict()

export const nodeVersionFormatSchema = z.union([
  z.literal('file'),
  z.literal('link'),
  z.literal('star'),
  z.literal('version-caret'),
  z.literal('version-tilde'),
  z.literal('version'),
  z.literal('workspace-caret'),
  z.literal('workspace-tilde'),
  z.literal('workspace')
])

export const nodePackageManagerConfigSchema = z
  .object({
    version: z.string().optional()
  })
  .strict()

export const yarnConfigSchema = nodePackageManagerConfigSchema.extend({
  plugins: z.array(z.string())
})

export const nodeConfigSchema = z
  .object({
    addEnginesConstraint: z.boolean(),
    binExecArgs: z.array(z.string()),
    dedupeOnLockfileChange: z.boolean(),
    dependencyVersionFormat: nodeVersionFormatSchema,
    inferTasksFromScripts: z.boolean(),
    npm: nodePackageManagerConfigSchema,
    packageManager: z.union([
      z.literal('npm'),
      z.literal('pnpm'),
      z.literal('yarn')
    ]),
    pnpm: nodePackageManagerConfigSchema.optional(),
    syncProjectWorkspaceDependencies: z.boolean(),
    syncVersionManagerConfig: z
      .union([z.literal('nodenv'), z.literal('nvm')])
      .optional(),
    version: z.string().optional(),
    yarn: yarnConfigSchema.optional()
  })
  .strict()

export const typeScriptConfigSchema = z
  .object({
    createMissingConfig: z.boolean(),
    projectConfigFileName: z.string(),
    rootConfigFileName: z.string(),
    rootOptionsConfigFileName: z.string(),
    routeOutDirToCache: z.boolean(),
    syncProjectReferences: z.boolean(),
    syncProjectReferencesToPaths: z.boolean()
  })
  .strict()

export const toolchainConfigSchema = z
  .object({
    extends: z.string().optional(),
    deno: denoConfigSchema.optional(),
    node: nodeConfigSchema.optional(),
    typescript: typeScriptConfigSchema.optional()
  })
  .strict()
