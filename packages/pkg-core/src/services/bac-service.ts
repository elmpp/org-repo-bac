// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { execUtils } from "../utils";
import { ServiceInitialiseCommonOptions } from "../__types__";

declare global {
  namespace Bac {
    interface Services {
      bac: {
        insType: BacService;
        staticType: typeof BacService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
};
type DoExecOptionsLite = Omit<
  Parameters<typeof execUtils.doExec>[0]["options"],
  "context" | "cwd"
>
// type DoExecOptionsLite = Omit<
//   Parameters<typeof execUtils.doExec>[0]["options"],
//   "context" | "cwd"
// > & {throwOnFail?: boolean}

/**
 Provides programmatic way to interact with a Bac instance
 */
export class BacService {
  static title = "bac" as const
  // title = 'bac' as const
  options: Required<Options>;

  get ctor(): typeof BacService {
    return this.constructor as unknown as typeof BacService;
  }
  get title(): (typeof BacService)['title'] {
    return (this.constructor as any).title as unknown as (typeof BacService)['title']
  }

  static async initialise(options: Options) {
    const ins = new BacService(options);
    await ins.initialise(options);
    return ins;
  }

  constructor(options: Options) {
    this.options = options;
  }

  protected async initialise(options: Options) {}

  // async run(options: {
  //   command: string;
  //   options: DoExecOptionsLite & { throwOnFail: true };
  // }): ReturnType<typeof execUtils.doExecThrow>;
  // async run(options: {
  //   command: string;
  //   options: DoExecOptionsLite & { throwOnFail: false };
  // }): ReturnType<typeof execUtils.doExec>;
  async run(options: {
    command: string;
    options?: DoExecOptionsLite;
  }): ReturnType<typeof execUtils.doExec>;
  async run(options: {
    command: string;
    options: DoExecOptionsLite;
  }): ReturnType<typeof execUtils.doExec>;
  async run(options: {
    command: string;
    options?: DoExecOptionsLite;
  }): Promise<any> {
    const args = {
      command: `pnpm bac ${options.command}`,
      options: {
        shell: true,
        ...(options.options ?? {}),
        context: this.options.context,
        cwd: addr.pathUtils.join(
          this.options.workspacePath,
          addr.parsePath(this.options.workingPath)
        ) as AddressPathAbsolute,
      },
    }

    // if (options.options?.throwOnFail) {
    //   return doExecThrow(args);
    // }
    return execUtils.doExec(args);
  }
}
