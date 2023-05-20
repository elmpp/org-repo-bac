/** test-specific schematic-utils */

import { Path, virtualFs } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import {
  HostCreateTree,
  Rule,
  SchematicContext,
  Tree
} from "@angular-devkit/schematics";
import { schematicUtils } from "@business-as-code/core";

export function getFiles(tree: Tree) {
  const treeFiles: string[] = [];
  tree.visit((p) => !p.match('node_modules/') && treeFiles.push(p));
  // tree.visit((p) => !!p.match(/(?!\/?node_modules\/.+)/) && treeFiles.push(p));
  return treeFiles;
}
export function debugRule(
  options: Pick<
    schematicUtils.ServiceOptionsLite<"git">,
    "initialiseOptions" | "context"
  > & {withRealFs?: boolean}
): Rule {
  function getFsContents(tree: Tree) {
    const treeFiles: string[] = [];
    tree.visit((p) => treeFiles.push(p));
    return treeFiles;
  }
  function getTreeActions(tree: Tree): string[] {
    return tree.actions.map((a) =>
      a.kind === "r"
        ? `tree$ index: '0'; kind: ${a.kind}; fromPath: ${a.path} -> ${a.to}`
        : `tree$ index: '0'; kind: ${a.kind}; path: ${a.path}`
    );
  }

  return (tree: Tree, schematicContext: SchematicContext) => {
    const liveFsTree = new HostCreateTree(
      // const liveFsTree = new HostCreateTree(
      new virtualFs.ScopedHost(
        new NodeJsSyncHost(),
        schematicUtils.getHostRoot(schematicContext).original as Path,
      )
    );

    const debuggable: Record<string, any> = {
      cwd: schematicUtils.getHostRoot(schematicContext).original,
      treeContents: getFsContents(tree),
      fsContents: getFsContents(liveFsTree),
      actions: getTreeActions(tree),
    };

    const withGitRule = schematicUtils.wrapServiceAsRule({
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

    return withGitRule;
  };
}
