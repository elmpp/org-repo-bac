import { z } from 'zod'
import { projectSchema } from './moon/by-state-files/project'

export const workspaceSchema = z.object({
  lastHashTime: z.string().datetime(),
  lastHash: z.string()
})

export const projectGraph = z.object({
  projects: z.object({
    aliases: z.record(z.string(), z.string()),
    graph: z.object({
      nodes: z.array(projectSchema),
      node_holes: z.array(z.unknown()),
      edge_property: z.literal('directed'),
      edges: z.array(z.tuple([z.number(), z.number(), z.null()]))
    }),
    indices: z.record(z.string(), z.number()),
    sources: z.record(z.string(), z.string())
  }),
  workspace: workspaceSchema
})
