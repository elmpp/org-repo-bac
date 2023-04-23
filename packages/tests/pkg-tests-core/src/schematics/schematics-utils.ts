/** test-specific schematic-utils */

import { Path, virtualFs } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import {
  HostCreateTree,
  Rule,
  SchematicContext,
  Tree,
} from "@angular-devkit/schematics";
import { NodeWorkflow } from "@angular-devkit/schematics/tools";
import {
  schematicUtils
} from "@business-as-code/core";

export function debugRule(
  options: Pick<schematicUtils.ServiceOptionsLite<"git">, "initialiseOptions" | "context">
): Rule {
  function getFsContents(tree: Tree, _context: SchematicContext) {
    const treeFiles: string[] = [];
    tree.visit((p) => treeFiles.push(p));
    return treeFiles;
  }
  function getCwd(tree: Tree, schematicContext: SchematicContext): Path {
    const fsHost = schematicUtils.getSchematicsEngineHost(schematicContext);
    (schematicContext.engine.workflow as NodeWorkflow)?.engine;
    return fsHost._root as Path;
  }

  return (tree: Tree, schematicContext: SchematicContext) => {
    const liveFsTree = new HostCreateTree(
      // const liveFsTree = new HostCreateTree(
      new virtualFs.ScopedHost(
        new NodeJsSyncHost(),
        getCwd(tree, schematicContext)
      )
    );

    const debuggable: Record<string, any> = {
      cwd: getCwd(tree, schematicContext),
      treeContents: getFsContents(tree, schematicContext),
      fsContents: getFsContents(liveFsTree, schematicContext),
    };

    const gitRule = schematicUtils.wrapServiceAsRule({
      serviceOptions: {
        serviceName: "git",
        cb: async ({ service }) => {
          const repo = service.getRepository(false);
          if (repo) {
            // console.log(`service.get :>> `, service.getWorkingDestinationPath())
            // console.log(`repo.config :>> `, repo)

            debuggable.status = await repo.status();
            debuggable.branches = await repo.branch();
            debuggable.localBranches = await repo.branchLocal();
            debuggable.logs = await repo.log();
          }

          console.log(`debugRule: :>> `, debuggable);

          return tree;
        },
        ...options,
      },
      schematicContext,
    });

    return gitRule;
  };
}
