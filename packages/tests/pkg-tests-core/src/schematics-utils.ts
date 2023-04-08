/** test-specific schematic-utils */

import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
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
  function getCwd(tree: Tree, context: SchematicContext) {
    const fsHost = getSchematicsEngineHost(context);
    return fsHost._root;
  }

  return (tree: Tree, context: SchematicContext) => {
    const debuggable: Record<string, any> = {
      cwd: getCwd(tree, context),
      treeContents: getFsContents(tree, context),
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

          console.log(`debuggable :>> `, debuggable);

          return tree;
        },
        context: options._bacContext,
        serviceOptions: {},
      },
      context
    );

    return gitRule;
  };
}
