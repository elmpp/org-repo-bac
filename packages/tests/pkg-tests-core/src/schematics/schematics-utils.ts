/** test-specific schematic-utils */

import { Path, virtualFs } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import { HostCreateTree, Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { NodeModulesEngineHost, NodeWorkflow } from "@angular-devkit/schematics/tools";
import {
  Context,
  getSchematicsEngineHost,
  wrapServiceAsRule,
} from "@business-as-code/core";

export function debugRule(options: { _bacContext: Context }): Rule {
  function getFsContents(tree: Tree, _context: SchematicContext) {
    const treeFiles: string[] = [];
    tree.visit((p) => treeFiles.push(p));
    return treeFiles;
  }
  function getCwd(tree: Tree, schematicsContext: SchematicContext): Path {
    const fsHost = getSchematicsEngineHost(schematicsContext);
    (schematicsContext.engine.workflow as NodeWorkflow)?.engine
    return fsHost._root as Path;
  }

  return (tree: Tree, schematicsContext: SchematicContext) => {

    const liveFsTree = new HostCreateTree(
    // const liveFsTree = new HostCreateTree(
      new virtualFs.ScopedHost(
      new NodeJsSyncHost(),
      getCwd(tree, schematicsContext),
    ))

    const debuggable: Record<string, any> = {
      cwd: getCwd(tree, schematicsContext),
      treeContents: getFsContents(tree, schematicsContext),
      fsContents: getFsContents(liveFsTree, schematicsContext),
    };

    const gitRule = wrapServiceAsRule(
      {
        serviceName: "git",
        cb: async ({ service }) => {
          const repo = service.getRepository(false);
          if (repo) {
            debuggable.status = await repo.status();
            debuggable.branches = await repo.branch();
            debuggable.localBranches = await repo.branchLocal();
            debuggable.logs = await repo.log();
          }

          return tree;
        },
        context: options._bacContext,
        serviceOptions: {},
      },
      schematicsContext
    );

    return gitRule;
  };
}
