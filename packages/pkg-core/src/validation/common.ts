import { addr, AddressType } from "@business-as-code/address";
// import type {
//   ProjectLanguage as MoonLanguage,
//   ProjectType as MoonProjectType,
// } from "@moonrepo/types";

import { expectTypeOf } from "expect-type";
import { z } from "zod";
import {
  MoonProject,
  MoonProjectType,
  MoonProjectLanguage,
} from "./moon/by-state-files/__types__";

/** the origin providers. Will be only core plugins so we know their handles upfront */
export const originProviderTypeSchema = z.union([
  z.literal("git"),
  z.literal("github"),
]);

export const teamProviderTypeSchema = z.union([
  z.literal("codeowners"),
  /** passed through during config */
  z.literal('config')
]);

export const languageSchema = z.union([
  z.literal("javascript"),
  z.literal("rust"),
]);

export const languageVariantSchema = z.union([
  // z.literal("bash"),
  // z.literal("batch"),
  // z.literal("go"),
  z.literal("javascript"),
  // z.literal("php"),
  // z.literal("python"),
  // z.literal("ruby"),
  z.literal("rust"),
  z.literal("typescript"),
  // z.literal("unknown"),
]);

// export const platformSchema = z.union([
//   z.literal("javascript"),
//   z.literal("rust"),
//   z.literal("typescript"),
// ]);

export const projectTypeSchema = z.union([
  z.literal("application"),
  z.literal("library"),
  z.literal("tool"),
  // z.literal("unknown"),
]);

type AddressPathAbsoluteString = string;
type AddressUrlGitString = string;
/** we support currently absolute filepaths or our git format with workspace indexing support */
export const sourceLocation = z
  .string()
  .refine<AddressPathAbsoluteString | AddressUrlGitString>(
    (val): val is AddressPathAbsoluteString | AddressUrlGitString => {
      const valAddress = addr.parse({ address: val as string, strict: false });
      if (!valAddress) {
        return false;
      }
      if (
        !(
          [
            "portablePathPosixAbsolute",
            "portablePathWindowsAbsolute",
            "githubRepoUrl",
          ] as (keyof AddressType)[]
        ).includes(valAddress.type)
      ) {
        return false;
      }

      return true;

      // if (assertIsAddressPathAbsolute(val)) {
      //   return true
      // }
      // if (assertIsAddressUrl(val)) {
      //   return true
      // }
      // return false
    },
    { message: "bollocks" }
  );

export type ProjectLanguage = z.infer<typeof languageSchema>;
export type ProjectLanguageVariant = z.infer<typeof languageVariantSchema>;
export type Project = z.infer<typeof projectTypeSchema>;
// export type SourceLocation = z.infer<typeof projectTypeSchema>;

// ensure the values that will go into Moon should match
expectTypeOf<ProjectLanguage>().toMatchTypeOf<MoonProjectLanguage>();
expectTypeOf<ProjectLanguageVariant>().toMatchTypeOf<MoonProjectLanguage>();
expectTypeOf<Project>().toMatchTypeOf<MoonProjectType>();
