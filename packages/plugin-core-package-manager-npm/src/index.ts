import { Plugin } from "@business-as-code/core";
import { PackageManagerNpmService } from "./services/package-manager-npm-service";

export const plugin = {
  services: [PackageManagerNpmService],
} satisfies Plugin;
