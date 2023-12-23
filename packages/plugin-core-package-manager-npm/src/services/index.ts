import { ServiceStaticInterface } from "@business-as-code/core";
import { PackageManagerNpmService } from "./package-manager-npm-service";

export const services: ServiceStaticInterface[] = [
  PackageManagerNpmService,
];
