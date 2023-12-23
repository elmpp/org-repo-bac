import {
  ServiceInitialiseCommonOptions,
  execUtils as _execUtils,
  Result,
  expectIsOk,
} from "@business-as-code/core";
import { BacError } from "@business-as-code/error";

declare global {
  namespace Bac {
    interface Services {
      release: {
        insType: ReleaseService;
        staticType: typeof ReleaseService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {};

export class ReleaseService {
  static title = "release" as const;

  get ctor(): typeof ReleaseService {
    return this.constructor as unknown as typeof ReleaseService;
  }
  get title(): (typeof ReleaseService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof ReleaseService)["title"];
  }

  static async initialise(options: Options) {
    const ins = new ReleaseService(options);
    return ins;
  }

  constructor(protected options: Options) {}

  protected async build() {
    const { context } = this.options;
    const moonService = await context.serviceFactory("moon", {
      context,
      workingPath: ".",
    });

    return moonService.runTask({ command: "build" });
  }

  async snapshot({
    query,
    message,
    registry = "https://registry.npmjs.org",
    tag = "latest",
  }: {
    query?: string;
    message: string;
    registry?: string;
    tag?: string;
  }): Promise<Result<{ version: string; tag: string }, { error: BacError }>> {
    const { context } = this.options;

    // const buildRes = await this.build(); // do not build here - moon
    // expectIsOk(buildRes)

    const changesetService = await context.serviceFactory("changeset", {
      context,
      workingPath: ".",
    });

    await changesetService.create({
      query: "projectType=library || projectType=application",
      message,
      bump: "patch",
    });

    const versionRes = await changesetService.version({
      tag,
      isSnapshot: true,
    });

    expectIsOk(versionRes);

    console.log(`versionRes :>> `, versionRes)

    const publishRes = await changesetService.publish({
      registry,
      tag,
    });

    expectIsOk(publishRes);

    return {
      success: true,
      res: {
        version: "",
        tag,
      },
    };
  }
}
