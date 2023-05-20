import {
  MoonProjectLanguage,
  MoonProjectType,
} from "../moon/by-state-files/__types__";
import { expectTypeOf } from "expect-type";
import { Project, ProjectLanguage, ProjectLanguageVariant } from "../common";

// ensure the values that will go into Moon should match
expectTypeOf<ProjectLanguage>().toMatchTypeOf<MoonProjectLanguage>();
expectTypeOf<ProjectLanguageVariant>().toMatchTypeOf<MoonProjectLanguage>();
expectTypeOf<Project>().toMatchTypeOf<MoonProjectType>();
