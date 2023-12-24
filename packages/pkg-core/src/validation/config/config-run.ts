import { z } from 'zod'

export const configRunSchema = z.object({
  version: z.string(),
  /** Moon syntax for finding workspaces. e.g. 'projectType=library || projectType=application' */
  query: z.string(),
  command: z.string()
})

export type ConfigRunSchema = z.infer<typeof configRunSchema>

export type ConfigRun = z.infer<typeof configRunSchema>
