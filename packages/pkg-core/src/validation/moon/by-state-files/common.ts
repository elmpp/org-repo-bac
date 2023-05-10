import { z } from "zod"

export const platformSchema = z.union([
  z.literal("deno"),
  z.literal("node"),
  z.literal("system"),
  z.literal("unknown")
])

export const durationSchema = z.object({
  secs: z.number(),
  nanos: z.number()
}).strict()

export const runtimeSchema = z.object({
  platform: z.union([
    z.literal("Deno"),
    z.literal("Node"),
    z.literal("System"),
    z.literal("Unknown")
  ]),
  version: z.string().optional()
}).strict()
