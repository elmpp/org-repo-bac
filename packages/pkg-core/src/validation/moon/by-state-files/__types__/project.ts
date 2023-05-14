import { z } from "zod";
import { projectDependencySchema, projectSchema, taskSchema, taskTypeSchema } from "../project";

export type MoonTaskType = z.infer<typeof taskTypeSchema>
export type MoonFileGroup = z.infer<typeof taskTypeSchema>
export type MoonTaskOptions = z.infer<typeof taskTypeSchema>
export type MoonTask = z.infer<typeof taskSchema>
export type MoonProjectDependency = z.infer<typeof projectDependencySchema>
export type MoonProject = z.infer<typeof projectSchema>

