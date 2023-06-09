import { Args, Flags } from "@oclif/core";
import * as Interfaces from "@oclif/core/lib/interfaces/parser"; // need to import into subCommands because of this dreaded bug - https://tinyurl.com/2fzprqtm

export * from "./commands";
export { constants } from "./constants";
export * from "./interfaces";
export * from "./schematics";
export * from "./services";
export * from "./utils";
export * from "./validation";
export * from "./__types__";
export {
  Args,
  Flags,
  Interfaces,
  // OclifPlugin
};

// export type Simplify<T> = {[KeyType in keyof T]: T[KeyType]}
// type Bac2 = Simplify<Bac.Services>
