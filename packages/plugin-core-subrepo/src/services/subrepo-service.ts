import {
  ServiceInitialiseCommonOptions
} from "@business-as-code/core";

declare global {
  namespace Bac {
    interface Services {
      subrepo: {
        insType: SubrepoService;
        staticType: typeof SubrepoService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {};

/**
 GitSubrepo GH - original inspiration around subrepos - https://tinyurl.com/yqllu29k

 */
export class SubrepoService {
  static title = "subrepo" as const;

  protected options: Options;

  get ctor(): typeof SubrepoService {
    return this.constructor as unknown as typeof SubrepoService;
  }
  get title(): (typeof SubrepoService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof SubrepoService)["title"];
  }

  static async initialise(options: Options) {
    const ins = new SubrepoService(options);
    return ins;
  }

  constructor(options: Options) {
    this.options = options;
  }



  // THIS PACKAGE NEEDS A WAY TO INSTALL THE SUBREPO BINARY IN THE MAIN EXECPATH (DO WE NEED AN EXECSERVICE?)

  // --- MIGHT BE A GOOD TIME TO JUST SET UP BUN BUNDLING SO THAT BINARIES CAN BE EXECUTED AS WELL WITHOUT COPYING - https://bun.sh/docs/bundler --
}
