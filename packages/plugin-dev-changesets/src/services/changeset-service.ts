import {
  expectIsOk,
  ServiceInitialiseCommonOptions,
  execUtils as _execUtils,
} from "@business-as-code/core";
import { BacError as _BacError } from "@business-as-code/error";

declare global {
  namespace Bac {
    interface Services {
      changeset: {
        insType: ChangesetService;
        staticType: typeof ChangesetService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {};

export class ChangesetService {
  static title = "changeset" as const;

  // options: Options;

  get ctor(): typeof ChangesetService {
    return this.constructor as unknown as typeof ChangesetService;
  }
  get title(): (typeof ChangesetService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof ChangesetService)["title"];
  }

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */

  static async initialise(options: Options) {
    const ins = new ChangesetService(options);
    return ins;
  }

  constructor(protected options: Options) {
    // this.options = options;
  }

  async create({
    query = "projectType=library || projectType=application",
    bump = "patch",
    message,
  }: {
    query?: string;
    message: string;
    bump?: "major" | "minor" | "patch";
  }) {
    const { context } = this.options;

    const moonService = await context.serviceFactory("moon", {
      context,
      workingPath: ".",
    });
    const schematicService = await context.serviceFactory("schematics", {
      context,
      workingPath: ".",
    });

    // const snapshotProjects = await moonService.findProjects()
    const snapshotProjects = await moonService.findProjectsJson({
      query,
    });

    const schematicOptionsChanges: {
      message: string;
      changes: Record<string, "major" | "minor" | "patch">;
    } = {
      message,
      changes: snapshotProjects.projects.reduce((acc, p) => {
        acc[p.alias ?? p.id] = bump!;
        return acc;
      }, {} as Record<string, "major" | "minor" | "patch">),
    };

    await schematicService.runSchematic({
      address: `@business-as-code/plugin-dev-changesets#namespace=changeset-generate`,
      options: {
        ...schematicOptionsChanges,
        _bacContext: context,
      },
    });
  }

  async version({ tag, isSnapshot = false }: { tag?: string, isSnapshot?: boolean }) {
    const { context } = this.options;
    const packageManagerService = await context.serviceFactory(
      "packageManager",
      { context, workingPath: "." }
    );
    const command =
      `changeset version ${isSnapshot ? ` --snapshot` : ""}${tag ? ` ${tag}` : ""}`;

    const resPublish = await packageManagerService.run({
      command,
      options: {
      },
    });
    return resPublish;
  }

  async publish({ registry, tag }: { registry?: string; tag?: string }) {
    const { context } = this.options;
    const packageManagerService = await context.serviceFactory(
      "packageManager",
      { context, workingPath: "." }
    );
    // const execService = await context.serviceFactory('exec', {context, workingPath: '.'})

    const resLogin = await packageManagerService.login();

    expectIsOk(resLogin);

    const command =
      `changeset publish --no-git-tag` + (tag ? ` --tag ${tag}` : "");

    const resPublish = await packageManagerService.run({
      command,
      options: {
        env: {
          ...(registry ? { npm_config_registry: registry } : {}),
        },
      },
    });
    return resPublish;
  }
}
