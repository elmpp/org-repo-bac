import { Path, virtualFs } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import { CordHost } from "@angular-devkit/core/src/virtual-fs/host";
import { Action, ActionBase, CreateFileAction, DeleteFileAction, DirEntry, HostTree, OverwriteFileAction, RenameFileAction, Tree } from "@angular-devkit/schematics";
import { SchematicResettableNodeJsSyncHost } from "./schematic-resettable-scoped-node-js-sync-host";
import { SchematicResettableCordHost } from "./schematics-resettable-cord-host";

export interface ResettableDeleteDirAction extends ActionBase {
  readonly kind: 't';
}
export type ResettableAction = Action | ResettableDeleteDirAction

export class SchematicsResettableHostTree extends HostTree {

  static fromExisting(workspacePath: string, tree: Tree): SchematicsResettableHostTree {
  // static fromExisting(workspacePath: string, tree: SchematicsResettableHostTree): SchematicsResettableHostTree {
    // const ins = new SchematicsResettableHostTree(workspacePath)
    // ins.merge(tree)

    const ins = new SchematicsResettableHostTree(this._backend);
    ins._record = SchematicResettableCordHost.cloneFrom(tree._record);
    // ins._record = tree._record.clone();
    ins._recordSync = new virtualFs.SyncDelegateHost(ins._record);
    ins._ancestry = new Set(tree._ancestry).add(tree._id);

    // console.log(`ins._record :>> `, ins._record)

    return ins;
  }

  // constructor(workspacePath: string) {
  constructor(public override _backend: SchematicResettableNodeJsSyncHost) {
  // constructor(public override _backend: virtualFs.ReadonlyHost<{}>) {
    // const backend = new virtualFs.ScopedHost(
    //       new NodeJsSyncHost(),
    //       // workflowHost,
    //       workspacePath as Path,
    //       // tree._root,
    //     )
    super(_backend)
    // super(_backend)
    // @ts-ignore
    // this._record = new SchematicResettableCordHost(new virtualFs.SafeReadonlyHost(backend));
    // this._record = new virtualFs.CordHost(new virtualFs.SafeReadonlyHost(_backend));
    // // @ts-ignore
    // this._recordSync = new virtualFs.SyncDelegateHost(this._record);
  }

  private override *generateActions(): Iterable<ResettableAction> {
    for (const record of this._record.records()) {
      switch (record.kind) {
        case 'create':
          yield {
            id: this._id,
            parent: 0,
            kind: 'c',
            path: record.path,
            content: Buffer.from(record.content),
          } as CreateFileAction;
          break;
        case 'overwrite':
          yield {
            id: this._id,
            parent: 0,
            kind: 'o',
            path: record.path,
            content: Buffer.from(record.content),
          } as OverwriteFileAction;
          break;
        case 'rename':
          yield {
            id: this._id,
            parent: 0,
            kind: 'r',
            path: record.from,
            to: record.to,
          } as RenameFileAction;
          break;
        case 'delete':
          yield {
            id: this._id,
            parent: 0,
            kind: 'd',
            path: record.path,
            // isDir: false,
          } as DeleteFileAction;
          break;
        case 'deleteDir':
          yield {
            id: this._id,
            parent: 0,
            kind: 't',
            path: record.path,
            // isDir: true,
          } as ResettableDeleteDirAction;
          break;
      }
    }
  }

  override get actions(): ResettableAction[] {
    // Create a list of all records until we hit our original backend. This is to support branches
    // that diverge from each others.
    return Array.from(this.generateActions());
  }

  /**
   * Custom hack to effect removal of directories, despite Schematic's file-only mechanics - https://tinyurl.com/2yl7gxra
   * As a halfway nod to security, only folders without any files (nested empty folders are ok) are allowed. Therefore
   * suitable for use after normal tree.delete(folderPath)
  */
  rmDir(dirEntry: DirEntry) {
    // console.log(`this._backend, this._record :>> `, this._backend, this._record)

    // const filePath = dirEntry.path

    // // only want to schedule its deletion if it's not in the other rename etc
    // const maybeOrigin = this._filesToRenameRevert.get(filePath);
    //     if (maybeOrigin) {
    //       this._filesToRenameRevert.delete(filePath);
    //       this._filesToRename.delete(maybeOrigin);
    //       this._filesToDelete.add(maybeOrigin);
    //     } else {
    //       return throwError(
    //         new UnknownException(`This should never happen. Path: ${JSON.stringify(path)}.`),
    //       );
    //     }

    this._record.rmDir(dirEntry)
  }

  /**
   * Custom hack to effect removal of directories, despite Schematic's file-only mechanics - https://tinyurl.com/2yl7gxra
   * As a halfway nod to security, only folders without any files (nested empty folders are ok) are allowed. Therefore
   * suitable for use after normal tree.delete(folderPath)
  */
  mvDir(fromPath: Path, toPath: Path) {
    // console.log(`this._backend, this._record :>> `, this._backend, this._record)

    // const filePath = dirEntry.path

    // // only want to schedule its deletion if it's not in the other rename etc
    // const maybeOrigin = this._filesToRenameRevert.get(filePath);
    //     if (maybeOrigin) {
    //       this._filesToRenameRevert.delete(filePath);
    //       this._filesToRename.delete(maybeOrigin);
    //       this._filesToDelete.add(maybeOrigin);
    //     } else {
    //       return throwError(
    //         new UnknownException(`This should never happen. Path: ${JSON.stringify(path)}.`),
    //       );
    //     }

    this._record.mvDir(fromPath, toPath)
  }

  reset() {
    // this._record._filesToCreate = new Set();
    // this._record._filesToRename = new Map();
    // this._record._filesToRenameRevert = new Map();
    // this._record._filesToDelete = new Set();
    // this._record._filesToOverwrite = new Set();
  }


}