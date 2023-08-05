import { Plugin } from "@business-as-code/core";
import { ReleaseService } from "./services/release-service";
import { TestService } from "./services/test-service";

export const plugin = {
  services: [ReleaseService, TestService],
} satisfies Plugin;
