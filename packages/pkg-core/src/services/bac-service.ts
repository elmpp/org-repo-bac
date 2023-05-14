// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { doExec, doExecThrow } from "../utils/exec-utils";
import { ServiceInitialiseCommonOptions } from "../__types__";

declare global {
  namespace Bac {
    interface Services {
      bac: {
        insType: BacService;
        clzType: typeof BacService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
  /** path to root of instance */
  // workspacePath: AddressPathAbsolute;
};
type DoExecOptionsLite = Omit<
  Parameters<typeof doExec>[0]["options"],
  "context" | "cwd"
> & {throwOnFail?: boolean}

/**
 Provides programmatic way to interact with a Bac instance
 */
export class BacService {
  static title = "bac";
  options: Required<Options>;

  static async initialise(options: Options) {
    const ins = new BacService(options);
    await ins.initialise(options);
    return ins;
  }

  constructor(options: Options) {
    this.options = options;
  }

  protected async initialise(options: Options) {}

  async run(options: {
    cmd: string;
    options: DoExecOptionsLite & { throwOnFail: true };
  }): ReturnType<typeof doExecThrow>;
  async run(options: {
    cmd: string;
    options: DoExecOptionsLite & { throwOnFail: false };
  }): ReturnType<typeof doExec>;
  async run(options: {
    cmd: string;
    options?: DoExecOptionsLite;
  }): ReturnType<typeof doExec>;
  async run(options: {
    cmd: string;
    options: DoExecOptionsLite;
  }): ReturnType<typeof doExec>;
  async run(options: {
    cmd: string;
    options?: DoExecOptionsLite;
  }): Promise<any> {
    const args = {
      cmd: `pnpm bac ${options.cmd}`,
      options: {
        shell: true,
        ...(options.options ?? {}),
        context: this.options.context,
        cwd: addr.pathUtils.join(
          this.options.destinationPath,
          addr.parsePath(this.options.workingPath)
        ) as AddressPathAbsolute,
      },
    }

    if (options.options?.throwOnFail) {
      return doExecThrow(args);
    }
    return doExec(args);
  }
}
