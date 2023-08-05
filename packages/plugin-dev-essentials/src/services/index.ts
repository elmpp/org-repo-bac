import { ServiceStaticInterface } from "@business-as-code/core";
import { ReleaseService } from "./release-service";
import { TestService } from "./test-service";

export const services: ServiceStaticInterface[] = [ReleaseService, TestService];
