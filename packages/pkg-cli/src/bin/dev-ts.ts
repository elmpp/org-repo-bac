import * as oclif from "@oclif/core";
import path from "path";
import { BaseCommand } from "@business-as-code/core";

const project = path.join(__dirname, "../..", "tsconfig.json");

// In dev mode -> use ts-node and dev plugins
process.env.NODE_ENV = "development";

require("ts-node").register({ project }); // hopefully should be swc

// In dev mode, always show stack traces
oclif.settings.debug = true;

// Start the CLI
oclif
  .run()
  .then(() => oclif.flush())
  .catch((err) => {
    return BaseCommand.handleError({ err, exitProcess: true });
  });

// .catch(oclif.Errors.handle);
