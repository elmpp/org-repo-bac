import { Args, Flags } from "@oclif/core";
import * as Interfaces from "@oclif/core/lib/interfaces/parser"; // need to import into subCommands because of this dreaded bug - https://tinyurl.com/2fzprqtm
import type {Plugin} from "@oclif/core/lib/interfaces/plugin"; // need to import into subCommands because of this dreaded bug - https://tinyurl.com/2fzprqtm

export * from "./__types__";
export * from "./commands";
export * from "./validation";
export { constants } from "./constants";

export { Args, Flags, Interfaces, Plugin };

// export type Simplify<T> = {[KeyType in keyof T]: T[KeyType]}
// type Bac2 = Simplify<Bac.Services>
