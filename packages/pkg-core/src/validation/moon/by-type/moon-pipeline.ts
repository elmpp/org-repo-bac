import { z } from "zod"

export const actionStatusSchema = z.union([
  z.literal("cached-from-remote"),
  z.literal("cached"),
  z.literal("failed-and-abort"),
  z.literal("failed"),
  z.literal("invalid"),
  z.literal("passed"),
  z.literal("running"),
  z.literal("skipped")
])

export const attemptSchema = z.object({
  duration: z
    .object({
      secs: z.number(),
      nanos: z.number()
    })
    .nullable(),
  finishedAt: z.string().nullable(),
  index: z.number(),
  startedAt: z.string(),
  status: actionStatusSchema
})

export const actionSchema = z.object({
  attempts: z.array(attemptSchema).nullable(),
  createdAt: z.string(),
  duration: z
    .object({
      secs: z.number(),
      nanos: z.number()
    })
    .nullable(),
  error: z.string().nullable(),
  finishedAt: z.string().nullable(),
  flaky: z.boolean(),
  label: z.string().nullable(),
  nodeIndex: z.number(),
  startedAt: z.string().nullable(),
  status: actionStatusSchema
})

export const actionContextSchema = z.object({
  affectedOnly: z.boolean(),
  initialTargets: z.array(z.string()),
  interactive: z.boolean(),
  passthroughArgs: z.array(z.string()),
  primaryTargets: z.array(z.string()),
  profile: z.union([z.literal("cpu"), z.literal("heap")]).nullable(),
  targetHashes: z.record(z.string()),
  touchedFiles: z.array(z.string()),
  workspaceRoot: z.string()
})

export const runReportSchema = z.object({
  actions: z.array(actionSchema),
  context: actionContextSchema,
  duration: z.object({
    secs: z.number(),
    nanos: z.number()
  }),
  comparisonEstimate: z.object({
    duration: z.object({
      secs: z.number(),
      nanos: z.number()
    }),
    gain: z
      .object({
        secs: z.number(),
        nanos: z.number()
      })
      .nullable(),
    loss: z
      .object({
        secs: z.number(),
        nanos: z.number()
      })
      .nullable(),
    percent: z.number(),
    tasks: z.record(
      z.object({
        count: z.number(),
        total: z.object({
          secs: z.number(),
          nanos: z.number()
        })
      })
    )
  }),
  estimatedSavings: z
    .object({
      secs: z.number(),
      nanos: z.number()
    })
    .optional()
    .nullable(),
  projectedDuration: z
    .object({
      secs: z.number(),
      nanos: z.number()
    })
    .optional()
})

export const actionNodeInstallDepsSchema = z.object({
  action: z.literal("InstallDeps"),
  params: z.object({
    platform: z.union([
      z.literal("Deno"),
      z.literal("Node"),
      z.literal("System"),
      z.literal("Unknown")
    ]),
    version: z.string().optional()
  })
})

export const actionNodeInstallProjectDepsSchema = z.object({
  action: z.literal("InstallProjectDeps"),
  params: z.tuple([
    z.object({
      platform: z.union([
        z.literal("Deno"),
        z.literal("Node"),
        z.literal("System"),
        z.literal("Unknown")
      ]),
      version: z.string().optional()
    }),
    z.string()
  ])
})

export const actionNodeRunTargetSchema = z.object({
  action: z.literal("RunTarget"),
  params: z.tuple([
    z.object({
      platform: z.union([
        z.literal("Deno"),
        z.literal("Node"),
        z.literal("System"),
        z.literal("Unknown")
      ]),
      version: z.string().optional()
    }),
    z.string()
  ])
})

export const actionNodeSetupToolSchema = z.object({
  action: z.literal("SetupTool"),
  params: z.object({
    platform: z.union([
      z.literal("Deno"),
      z.literal("Node"),
      z.literal("System"),
      z.literal("Unknown")
    ]),
    version: z.string().optional()
  })
})

export const actionNodeSyncProjectSchema = z.object({
  action: z.literal("SyncProject"),
  params: z.tuple([
    z.object({
      platform: z.union([
        z.literal("Deno"),
        z.literal("Node"),
        z.literal("System"),
        z.literal("Unknown")
      ]),
      version: z.string().optional()
    }),
    z.string()
  ])
})

export const actionNodeSchema = z.union([
  actionNodeInstallDepsSchema,
  actionNodeInstallProjectDepsSchema,
  actionNodeRunTargetSchema,
  actionNodeSetupToolSchema,
  actionNodeSyncProjectSchema
])
