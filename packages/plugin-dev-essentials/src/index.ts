import { Plugin } from "@business-as-code/core";
import { ReleaseService } from "./services/release-service";

export const plugin = {
  services: [ReleaseService],
} satisfies Plugin;
