// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { BacError, MessageName } from "@business-as-code/error";
import { doExec, DoExecOptions, DoExecOptionsLite as DoExecOptionsLiteOrig } from "../utils/exec-utils";
import { objectMapAndFilter } from "../utils/object-utils";
import {
  MoonQueryProjects,
  moonQueryProjects,
} from "../validation/moon-query-projects";
import {
  assertIsOk,
  expectIsOk,
  MoonQuery,
  ResultPromiseAugment,
  ServiceInitialiseCommonOptions,
} from "../__types__";

declare global {
  namespace Bac {
    interface Services {
      moon: {
        insType: MoonService;
        staticType: typeof MoonService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
  // /** path to root of instance */
  // workspacePath: AddressPathAbsolute;
};
type DoExecOptionsLite = DoExecOptionsLiteOrig & {
  json?: boolean;
};

/**
 Light wrapper for processes involving a Moon instance
 */
export class MoonService {
  static title = "moon" as const;
  options: Required<Options>;

  static async initialise(options: Options) {
    const ins = new MoonService(options);
    await ins.initialise(options);
    return ins;
  }

  constructor(options: Options) {
    this.options = options;
  }

  get ctor(): typeof MoonService {
    return this.constructor as unknown as typeof MoonService;
  }
  get title(): (typeof MoonService)['title'] {
    return (this.constructor as any).title as unknown as (typeof MoonService)['title']
  }

  protected async initialise(options: Options) {
    try {
      await this.getVersion();
    } catch (err) {
      throw new BacError(
        MessageName.SERVICE_INITIALISATION_ERROR,
        `MoonService: moon instance not found at cwd: '${this.options.workspacePath.original}'`
      );
    }
  }

  async getVersion(): Promise<string> {
    const res = await this.run({ command: "--version" });
    expectIsOk(res);
    return res.res.outputs.stdout.replace(/moon[\s]*/i, "");
    // const res = this.run({command: '--version'})
  }

  async findProjectsJson(options: {
    query?: MoonQuery;
    affected?: boolean;
  } = {}): Promise<MoonQueryProjects> {
    const res = await this.run({
      command: `query projects${options?.query ? ` '${options.query}'` : ""}${
        options?.affected ? " --affected" : ""
      }`,
      options: { json: true },
    });
    // console.log(`res :>> `, res.res)

    expectIsOk(res)

    // const resJson =
// console.log(`res :>> `, res)
    return moonQueryProjects.parse(res.res.parsed);

    // console.log(`query :>> `, queryProjects.projects.map(p => p.id))

    // console.log(`projects :>> `, projects)
  }



  async findProjectsString(options: {
    query?: MoonQuery;
    affected?: boolean;
  } = {}): Promise<string> {
    const res = await this.run({
      command: `query projects${options?.query ? ` '${options.query}'` : ""}${
        options?.affected ? " --affected" : ""
      }`,
      options: { json: false },
    });
    // console.log(`res :>> `, res.res)

    expectIsOk(res)

    return res.res.outputs.stdout

    // const resJson =
// console.log(`res :>> `, res)
    // return moonQueryProjects.parse(res.res.parsed);

    // console.log(`query :>> `, queryProjects.projects.map(p => p.id))

    // console.log(`projects :>> `, projects)
  }

  async runTask(options: {
    command: string;
    options: DoExecOptionsLite & { json: true };
  }): ResultPromiseAugment<ReturnType<typeof doExec>, { parsed: any }>;
  async runTask(options: {
    command: string;
    options?: DoExecOptionsLite;
  }): ReturnType<typeof doExec>;
  async runTask(options: {
    command: string;
    options: DoExecOptionsLite;
  }): ReturnType<typeof doExec>;
  async runTask(options: {
    command: string;
    options?: DoExecOptionsLite;
  }): Promise<any> {
    return this.run({
      ...options,
      command: `run ${options.command}`
    })
  }

  protected async run(options: {
    command: string;
    options: DoExecOptionsLite & { json: true };
  }): ResultPromiseAugment<ReturnType<typeof doExec>, { parsed: any }>;
  // protected async run(options: {
  //   command: string;
  //   options: DoExecOptionsLite & { json?: boolean };
  // }): ReturnType<typeof doExec>;
  // protected async run(options: {
  //   command: string;
  //   options: DoExecOptionsLite & { json: true, throwOnFail?: false };
  // }): Promise<any>;
  // protected async run(options: {
  //   command: string;
  //   options: DoExecOptionsLite & { json?: boolean, throwOnFail?: false };
  // }): ReturnType<typeof doExec>;
  // protected async run(options: {
  //   command: string;
  //   options: DoExecOptionsLite & { throwOnFail: true };
  // }): ReturnType<typeof doExecThrow>;
  // protected async run(options: {
  //   command: string;
  //   options: DoExecOptionsLite & { throwOnFail?: false };
  // }): ReturnType<typeof doExec>;
  protected async run(options: {
    command: string;
    options?: DoExecOptionsLite;
  }): ReturnType<typeof doExec>;
  protected async run(options: {
    command: string;
    options: DoExecOptionsLite;
  }): ReturnType<typeof doExec>;
  protected async run(options: {
    command: string;
    options?: DoExecOptionsLite;
  }): Promise<any> {
    const args = {
      command: `pnpm moon ${options.command}${options.options?.json ? " --json" : ""}`,
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
          if (typeof key === "string" && key.startsWith("MOON_")) {
            return objectMapAndFilter.skip;
          }
          return val;
        }),
      } satisfies DoExecOptions,
    };

    const res = await doExec(args);
    // expectIsOk(res)
    // console.log(`res :>> `, res)
    // process.exit(1)

    if (assertIsOk(res) && options.options?.json) {
      // return JSON.parse(res.res.outputs.stdout)
      return {
        ...res,
        res: {
          ...res.res,
          parsed: JSON.parse(res.res.outputs.stdout),
        },
      };
    }
    return res;
    // return res.res.outputs.stdout
  }
}
