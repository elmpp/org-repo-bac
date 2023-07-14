// taken from strato-runner - https://tinyurl.com/29x8b8nf
// inspired by the Webpack tapable library - https://tinyurl.com/2dzb777b
// import debug from 'debug'

import {
  LifecycleMethods,
  LifecycleOptionsByMethodKeyedByProviderArray,
  LifecycleReturnsByMethod,
} from "../__types__";

// const dbg = debug('tapable')

/** A `hook` that can be `tap`ped for easy extensibility */
export class Hook<TArgs, R, LMethod extends LifecycleMethods> {
  protected _name: string; // to cover the after/before distinctness
  protected _lifecycleMethod: LMethod; // after/before should give the canonical hook name
  protected _args: string[];
  taps: { nameOrProvider: string; fn: Function }[];
  protected _async: boolean;
  // protected _fName: string | null

  /**
   * Create a hook
   */
  constructor(args: string[] = [], method: LMethod, name: string) {
    this._name = name;
    this._lifecycleMethod = method;
    this._args = args;
    // /** @type {{ name: string; fn: Function; }[]} */
    this.taps = [];
    this._async = false;
    // this._fName = null
    // dbg('Hook %s created', this.name)
  }

  /**
   * A pretty name for the hook, for debugging
   * @return {string} the name
   */
  get name() {
    // if (!this._name)
    return `${this._async ? "async " : ""}${
      this._lifecycleMethod
    }(${this._args.join(", ")})`;
    // return this._name
  }

  /**
   * Is there an async tap attached?
   * @returns {boolean}
   */
  get isAsync() {
    return this._async;
  }

  _handleError(name: string, error: Error) {
    if (error?.message) {
      error.message = `Hook ${this.name} tap ${name}: ${error.message}`;
      throw error;
    } else {
      throw new Error(
        `Hook ${this.name} tap ${name} errored: ${String(error)}`
      );
    }
  }

  // _testArgs(args: { name: string; fn: Function; }[], isSync?: boolean) {
  _testArgs(args: any, isSync?: boolean) {
    if (process.env.NODE_ENV === "production") return;
    if (this._async && isSync)
      throw new Error(
        `${this.name}: async hook cannot be called sync (maybe one of the taps is async?)`
      );
    // if (args.length > 1) {
    //   throw new Error(`All hooks are expected to use destructured option objects. '${JSON.stringify(args)}'`)
    // }
    // if (args.length !== this._args.length)
    // 	// eslint-disable-next-line no-console
    // 	console.error(
    // 		`!!! Hook ${this.name}: called with ${args.length} instead of ${this._args.length}`
    // 	)
  }

  /**
   * add a `tap`
   * @param {string} nameOrProvider - the name of the tap, should be unique
   * @param {function} fn - the function that will be called
   * @param {{before?: string, after?: string}} [options]
   */
  tap(
    nameOrProvider: string,
    fn: Function,
    options?: { before?: string; after?: string }
  ) {
    if (process.env.NODE_ENV !== "production") {
      const prev = this.taps.find((t) => t.nameOrProvider === nameOrProvider);
      if (prev)
        // eslint-disable-next-line no-console
        console.error(
          `!!! Hook ${this.name} tap: ${nameOrProvider} was already added!`
        );
    }
    const tap = { nameOrProvider, fn };
    // dbg('%s: Adding tap %s %o', this.name, name, options)
    if (options?.before) {
      const index = this.taps.findIndex(
        (t) => t.nameOrProvider === options.before
      );
      if (index !== -1) {
        this.taps.splice(index, 0, tap);
        return;
      }
    }
    if (options?.after) {
      const index = this.taps.findIndex(
        (t) => t.nameOrProvider === options.after
      );
      if (index !== -1) {
        this.taps.splice(index + 1, 0, tap);
        return;
      }
    }
    this.taps.push(tap);
  }

  /**
   * Add an async `tap` - marks the Hook async, otherwise identical to `.tap`
   * @param {string} nameOrProvider - the name of the tap, should be unique
   * @param {function} fn - the function that will be awaited
   * @param {{before?: string, after?: string}} [options]
   */
  tapAsync(
    nameOrProvider: string,
    fn: Function,
    options?: { before?: string; after?: string }
  ) {
    this._async = true;
    // this._fName = null
    this.tap(nameOrProvider, fn, options);
  }

  // /**
  //  * remove a `tap`
  //  * @param {function} fn - the function that will be removed
  //  */
  // untap(fn: Function) {
  // 	const idx = this.taps.findIndex(t => t.fn === fn)
  // 	if (idx >= 0) this.taps.splice(idx, 1)
  // }

  // /**
  //  * Replace a `tap` - useful for hot reloading.
  //  * Can be used for async taps as well
  //  * @param {string} name - the name of the tap, should be unique
  //  * @param {function} fn - the function that will be called
  //  */
  // retap(name: string, fn: Function) {
  // 	const tap = this.taps.find(t => t.nameOrProvider === name)
  // 	if (tap) {
  // 		tap.fn = fn
  // 	} else {
  // 		// eslint-disable-next-line no-console
  // 		console.error(`!!! Hook ${this.name} retap: ${name} was not added yet!`)
  // 		this.tap(name, fn)
  // 	}
  // }

  // /**
  //  * call all taps in added order
  //  * @param {...any} args - the arguments each tap will be called with
  //  * @throws as soon as a tap throws
  //  */
  // call(...args: any[]) {
  // 	this._testArgs(args, true)
  // 	// dbg('%s.call%o', this.name, args)
  // 	for (const {nameOrProvider, fn} of this.taps) {
  // 		try {
  // 			fn(...args)
  // 		} catch (error) {
  // 			this._handleError(nameOrProvider, error as Error)
  // 		}
  // 	}
  // }

  /**
   * calls taps according to the args.provider and accepts an array of args which will be cycled over
   * @param {...any} args - the arguments each tap will be called with
   * @returns {Promise} the Promise for completion
   * @throws as soon as a tap throws
   */
  async callLifecycleBailAsync({
    options,
    strict = false,
  }: {
    options: LifecycleOptionsByMethodKeyedByProviderArray<LMethod>;
    strict?: boolean;
  }) {
    this._testArgs(options, false);

    // dbg('%s.callAsync%o', this.name, args)

    let res: LifecycleReturnsByMethod<LMethod>;

    console.log(`options :>> `, options);
    console.log(`options :>> `, options);
    console.log(`this.taps :>> `, this.taps);

    let anOptions: any;
    for (anOptions of options) {
      if (!anOptions.provider) {
        throw new Error(
          `hooks#callLifecycleBailAsync accepts only {provider: string}[]. '${JSON.stringify(
            options
          )}'`
        );
      }

      for (const { nameOrProvider, fn } of this.taps) {
        if (anOptions.provider !== nameOrProvider) {
          anOptions?.options?.context?.logger.debug(
            `Lifecycle method skipped: provider: '${anOptions.provider}', hook provider: '${nameOrProvider}'`
          );
          continue;
        }

        anOptions?.options?.context?.logger.debug(
          `Lifecycle method being triggered: provider: '${
            anOptions.provider
          }', hook provider: '${nameOrProvider}, options: '${JSON.stringify(
            anOptions.options
          )}''`
        );

        try {
          // eslint-disable-next-line no-await-in-loop
          res = await fn(anOptions.options);
        } catch (error) {
          this._handleError(nameOrProvider, error as Error);
        }
      }
    }

    if (!res! && strict) {
      throw new Error(
        `hooks#callLifecycleBailAsync: no provider returned expected result for hook '${
          this._name
        }'. '${JSON.stringify(options)}'`
      );
    }
    return res!;
  }
  // /**
  //  * await all taps in added order
  //  * @param {...any} args - the arguments each tap will be called with
  //  * @returns {Promise} the Promise for completion
  //  * @throws as soon as a tap throws
  //  */
  // async callAsync(...args: any[]) {
  // 	this._testArgs(args)
  // 	// dbg('%s.callAsync%o', this.name, args)
  // 	for (const {name, fn} of this.taps) {
  // 		try {
  // 			// eslint-disable-next-line no-await-in-loop
  // 			await fn(...args)
  // 		} catch (error) {
  // 			this._handleError(name, error as Error)
  // 		}
  // 	}
  // }

  // /**
  //  * call all taps in added order and return their results
  //  * @param {...any} args - the arguments each tap will be called with
  //  * @throws as soon as a tap throws
  //  * @returns {array}
  //  */
  // map(...args: any[]) {
  // 	this._testArgs(args, true)
  // 	// dbg('%s.map%o', this.name, args)
  // 	const out = []
  // 	for (const {nameOrProvider, fn} of this.taps) {
  // 		try {
  // 			out.push(fn(...args))
  // 		} catch (error) {
  // 			this._handleError(nameOrProvider, error as Error)
  // 		}
  // 	}
  // 	return out
  // }

  // /**
  //  * await all taps in parallel
  //  * @param {...any} args - the arguments each tap will be called with
  //  * @returns {Promise<array>} the Promise for the completed array
  //  * @throws as soon as a tap throws but doesn't wait for running calls
  //  */
  // async mapAsync(...args: any[]) {
  // 	this._testArgs(args)
  // 	// dbg('%s.mapAsync%o', this.name, args)
  // 	return Promise.all(
  // 		this.taps.map(async ({nameOrProvider, fn}) => {
  // 			try {
  // 				return await fn(...args)
  // 			} catch (error) {
  // 				this._handleError(nameOrProvider, error as Error)
  // 			}
  // 		})
  // 	)
  // }

  // we could also do callReverse, callUntil, reduce etc

  /** clear all taps */
  reset() {
    this.taps = [];
  }
}

// export const addHook = (hooks: Record<string, Hook<any, any, any>>, name: LifecycleImplementedMethods, args: any[]) => {
// 	if (hooks[name]) throw new Error(`Hook ${name} is already defined`)
// 	hooks[name] = new Hook(args, name)
// }

// export const addAsyncHook = (hooks: Record<string, AsyncHook<any, any, any>>, name: LifecycleImplementedMethods, args: any[]) => {
// 	if (hooks[name]) throw new Error(`Hook ${name} is already defined`)
// 	hooks[name] = new AsyncHook(args, name)
// }

/** Same as Hook but marks the Hook async from the start */
export class AsyncHook<TArgs extends Record<string, unknown>, R, LMethod extends LifecycleMethods> extends Hook<
  TArgs,
  R,
  LMethod
> {
  // export class AsyncHook<TArgs, R, LMethod extends LifecycleImplementedMethods> extends Hook<TArgs, R, LMethod> {
  // export class AsyncHook<TArgs, R, LMethod extends LifecycleImplementedMethods> extends Hook<TArgs, R, LMethod> {
  constructor(args: string[] = [], method: LMethod, name: string) {
    super(args, method, name);
    this._async = true;
    // this._fName = null
  }
}
