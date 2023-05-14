import { Context } from "../__types__";
import { InitialiseLifecycle } from "./initialise-lifecycle";

export const setupLifecycles = (options: {context: Context}) => ({
  initialise: new InitialiseLifecycle(options),
});

// inspired by webpack's api - https://webpack.js.org/contribute/writing-a-plugin/
// full webpack compilation api - https://tinyurl.com/2otw8uz5
export type Lifecycles = ReturnType<typeof setupLifecycles>;
