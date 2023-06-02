import { z } from "zod";
import { teamProviderTypeSchema } from "../common";


export const configTeamSchema = z.object({
  provider: teamProviderTypeSchema,
  name: z.string(),
  email: z.string().email(),
  description: z.string().optional(),
})

