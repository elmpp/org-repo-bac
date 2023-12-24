import { z } from 'zod'
import { configProjectSourceConfigSchema } from './config-project-source'

/**
 entire workspace is driven by this configuration format. Highly optional
 */
export const configSchema = z.object({
  /** define projects for the workspace */
  projectSource: z.array(configProjectSourceConfigSchema).nonempty()
})

export type Config = z.infer<typeof configSchema>
