import type {
  Project as MoonProject,
  ProjectType as MoonProjectType,
  ProjectLanguage as MoonLanguage,
} from '@moonrepo/types'
import { z } from "zod";
import {expectTypeOf} from 'expect-type'


export const languageSchema = z.union([
  // z.literal("bash"),
  // z.literal("batch"),
  // z.literal("go"),
  // z.literal("javascript"),
  // z.literal("php"),
  // z.literal("python"),
  // z.literal("ruby"),
  z.literal("rust"),
  z.literal("typescript"),
  // z.literal("unknown"),
]);

export const projectTypeSchema = z.union([
  z.literal("application"),
  z.literal("library"),
  z.literal("tool"),
])

export type Language = z.infer<typeof languageSchema>
export type ProjectType = z.infer<typeof projectTypeSchema>

// ensure the values that will go into Moon should match
expectTypeOf<Language>().toMatchTypeOf<MoonLanguage>()
expectTypeOf<ProjectType>().toMatchTypeOf<MoonProjectType>()
