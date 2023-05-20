// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { BacError, MessageName } from "@business-as-code/error";
import { doExec, DoExecOptions } from "../utils/exec-utils";
import { objectMapAndFilter } from "../utils/object-utils";
import { MoonQueryProjects, moonQueryProjects } from "../validation/moon-query-projects";
import { expectIsOk, ServiceInitialiseCommonOptions } from "../__types__";

declare global {
  namespace Bac {
    interface Services {
      moon: {
        insType: MoonService;
        clzType: typeof MoonService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
  // /** path to root of instance */
  // workspacePath: AddressPathAbsolute;
};
type DoExecOptionsLite = Omit<
  Parameters<typeof doExec>[0]["options"],
  "context" | "cwd"
> & {
  json?: boolean,
}

/** Moon query language - https://tinyurl.com/2ek7rph4 */
type Query = string // maybe later allow programmatic construction

/**
 Light wrapper for processes involving a Moon instance
 */
export class MoonService {
  static title = "moon";
  options: Required<Options>;

  static async initialise(options: Options) {
    const ins = new MoonService(options);
    await ins.initialise(options);
    return ins;
  }

  constructor(options: Options) {
    this.options = options;
  }

  protected async initialise(options: Options) {
    try {
      await this.getVersion()
    }
    catch (err) {
      throw new BacError(MessageName.SERVICE_INITIALISATION_ERROR, `MoonService: moon instance not found at cwd: '${this.options.workspacePath.original}'`)
    }
  }

  async getVersion(): Promise<string> {
    return this.run({cmd: '--version'}).then(output => output.replace(/moon[\s]*/i, ''))
    // const res = this.run({cmd: '--version'})

  }

  async findProjects(options?: {query?: Query, affected?: boolean}): Promise<MoonQueryProjects> {
    const res = await this.run({
      cmd: `query projects${options?.query ? ` '${options.query}'` : ''}${options?.affected ? ' --affected' : ''}`,
      options: {json: true},
    })
// console.log(`res :>> `, res.res)

//     expectIsOk(res)

    // const resJson =

    return moonQueryProjects.parse(res)

    // console.log(`query :>> `, queryProjects.projects.map(p => p.id))

    // console.log(`projects :>> `, projects)

  }

  protected async run(options: {
    cmd: string;
    options: DoExecOptionsLite & { json: true };
  }): Promise<any>;
  // protected async run(options: {
  //   cmd: string;
  //   options: DoExecOptionsLite & { json?: boolean };
  // }): ReturnType<typeof doExec>;
  // protected async run(options: {
  //   cmd: string;
  //   options: DoExecOptionsLite & { json: true, throwOnFail?: false };
  // }): Promise<any>;
  // protected async run(options: {
  //   cmd: string;
  //   options: DoExecOptionsLite & { json?: boolean, throwOnFail?: false };
  // }): ReturnType<typeof doExec>;
  // protected async run(options: {
  //   cmd: string;
  //   options: DoExecOptionsLite & { throwOnFail: true };
  // }): ReturnType<typeof doExecThrow>;
  // protected async run(options: {
  //   cmd: string;
  //   options: DoExecOptionsLite & { throwOnFail?: false };
  // }): ReturnType<typeof doExec>;
  protected async run(options: {
    cmd: string;
    options?: DoExecOptionsLite;
  }): Promise<string>;
  protected async run(options: {
    cmd: string;
    options: DoExecOptionsLite;
  }): Promise<string>;
  protected async run(options: {
    cmd: string;
    options?: DoExecOptionsLite;
  }): Promise<string> {
    const args = {
      cmd: `pnpm moon ${options.cmd}${options.options?.json ? ' --json' : ''}`,
      options: {
        shell: true,
        ...(options.options ?? {}),
        context: this.options.context,
        cwd: addr.pathUtils.join(
          this.options.workspacePath,
          addr.parsePath(this.options.workingPath)
        ) as AddressPathAbsolute,
        // env: {
          //   MOON_LOG: 'info', // needs to be overwritten when calling moon itself in case the current process is from moon (`MOON_LOG: 'moon=info,proto=info,starbase=info'`)
          // },
        // strip out current Moon envs when calling in new process in case we're inside a moon process
        extendEnv: false,
        env: objectMapAndFilter(process.env, (val, key) => {
          if (typeof key === 'string' && key.startsWith('MOON_')) {
            return objectMapAndFilter.skip
          }
          return val
        })
      } satisfies DoExecOptions,
    }

    const res = await doExec(args);
    expectIsOk(res)

    if (options.options?.json) {
      return JSON.parse(res.res.outputs.stdout)
    }
    return res.res.outputs.stdout
  }
}
