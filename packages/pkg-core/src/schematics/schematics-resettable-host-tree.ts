import { Path, virtualFs } from '@angular-devkit/core'
import {
  Action,
  ActionBase,
  CreateFileAction,
  DeleteFileAction,
  DirEntry,
  HostTree,
  MergeConflictException,
  MergeStrategy,
  OverwriteFileAction,
  RenameFileAction,
  Tree
} from '@angular-devkit/schematics'
import { SchematicResettableCordHost } from './schematics-resettable-cord-host'

export interface ResettableDeleteDirAction extends ActionBase {
  readonly kind: 't'
}
export type ResettableAction = Action | ResettableDeleteDirAction

export function assertIsSchematicResettableHostTree(
  tree: any
): asserts tree is SchematicsResettableHostTree {
  console.log(`tree :>> `, tree)
  if (typeof tree.mvDir === 'function') {
    return
  }
  throw new Error(`Expected tree to be instance of SchematicResettableHostTree`)
}

export class SchematicsResettableHostTree extends HostTree {
  // constructor(workspacePath: string) {
  // constructor(
  //   public override _backend: SchematicResettableScopedNodeJsSyncHost
  // ) {
  //   // constructor(public override _backend: virtualFs.ReadonlyHost<{}>) {
  //   // const backend = new virtualFs.ScopedHost(
  //   //       new NodeJsSyncHost(),
  //   //       // workflowHost,
  //   //       workspacePath as Path,
  //   //       // tree._root,
  //   //     )
  //   super(_backend);
  //   // super(_backend)
  //   // @ts-ignore
  //   // this._record = new SchematicResettableCordHost(new virtualFs.SafeReadonlyHost(backend));
  //   // this._record = new virtualFs.CordHost(new virtualFs.SafeReadonlyHost(_backend));
  //   // // @ts-ignore
  //   // this._recordSync = new virtualFs.SyncDelegateHost(this._record);
  // }

  /** branches against the current real FS with provided tree */
  static branchFromFs(
    workspacePath: string,
    tree: Tree
  ): SchematicsResettableHostTree {
    // static fromExisting(workspacePath: string, tree: SchematicsResettableHostTree): SchematicsResettableHostTree {
    // const ins = new SchematicsResettableHostTree(workspacePath)
    // ins.merge(tree)

    // @ts-ignore
    const ins = new SchematicsResettableHostTree(this._backend)
    // @ts-ignore
    ins._record = SchematicResettableCordHost.cloneFrom(tree._record)
    // ins._record = tree._record.clone();
    // @ts-ignore
    ins._recordSync = new virtualFs.SyncDelegateHost(ins._record)
    // @ts-ignore
    ins._ancestry = new Set(tree._ancestry).add(tree._id)

    // console.log(`ins._record :>> `, ins._record)

    return ins
  }

  /** branches normally using provided tree */
  static branchFromTree(
    // workspacePath: string,
    // prevTree: Tree,
    nextTree: Tree,
    mergeStrategy?: MergeStrategy
  ): SchematicsResettableHostTree {
    // static fromExisting(workspacePath: string, tree: SchematicsResettableHostTree): SchematicsResettableHostTree {
    // const ins = new SchematicsResettableHostTree(workspacePath)
    // ins.merge(tree)

    // const branched = tree.branch()

    // nextTree.merge(prevTree, MergeStrategy.Overwrite)

    // return nextTree

    // prevTree.merge(nextTree, MergeStrategy.Overwrite)

    // return prevTree

    // prevTree.merge(nextTree)

    // assertIsSchematicResettableHostTree(prevTree); // they may not be SchematicResettableHostTree actually (schematics start withy EMPTY() trees)
    // assertIsSchematicResettableHostTree(nextTree); // they may not be SchematicResettableHostTree actually (schematics start withy EMPTY() trees)

    // @ts-ignore
    const ins = new SchematicsResettableHostTree(this._backend)

    // @ts-ignore
    ins._record = SchematicResettableCordHost.cloneFrom(nextTree._record)
    // // ins._record = tree._record.clone();
    // @ts-ignore
    ins._recordSync = new virtualFs.SyncDelegateHost(ins._record)

    // @ts-ignore
    ins._ancestry = new Set(nextTree._ancestry).add(nextTree._id)

    // prevTree.merge(nextTree)

    // console.log(`nextTree.readText('./README.md') :>> `, nextTree.readText('./README.md'))
    // console.log(`prevTree.readText('./README.md') :>> `, prevTree.readText('./README.md'))
    // console.log(
    //   `ins.readText('./README.md') 1 :>> `,
    //   ins.readText("./README.md")
    // );

    ins.merge(nextTree, mergeStrategy)

    // nextTree.merge(ins, MergeStrategy.AllowCreationConflict)

    // ins.merge(nextTree, MergeStrategy.Overwrite)
    // console.log(
    //   `nextTree.readText('./README.md') 2 :>> `,
    //   nextTree.readText("./README.md")
    // );
    // console.log(
    //   `ins.readText('./README.md') 2 :>> `,
    //   ins.readText("./README.md")
    // );

    // // @ts-ignore
    // const ins = new SchematicsResettableHostTree(this._backend);

    // // @ts-ignore
    // ins._record = SchematicResettableCordHost.cloneFrom(prevTree._record);
    // // ins._record = tree._record.clone();
    // // @ts-ignore
    // ins._recordSync = new virtualFs.SyncDelegateHost(ins._record);
    // // @ts-ignore
    // ins._ancestry = new Set(prevTree._ancestry).add(prevTree._id);

    // ins.merge(tree, MergeStrategy.Overwrite)
    // @ts-ignore
    // ins._record = SchematicResettableCordHost.cloneFrom(tree._record);
    // ins._record = tree._record.clone();
    // @ts-ignore
    // ins._recordSync = new virtualFs.SyncDelegateHost(ins._record);
    // @ts-ignore
    // ins._ancestry = new Set(tree._ancestry).add(tree._id);

    // console.log(`ins._record :>> `, ins._record)

    return ins
  }

  protected getRecord(): SchematicResettableCordHost {
    return (this as any)._record
  }

  private override *generateActions(): Iterable<ResettableAction> {
    for (const record of this.getRecord().records()) {
      switch (record.kind) {
        case 'create':
          yield {
            id: (this as any)._id,
            parent: 0,
            kind: 'c',
            path: record.path,
            content: Buffer.from(record.content)
          } as CreateFileAction
          break
        case 'overwrite':
          yield {
            id: (this as any)._id,
            parent: 0,
            kind: 'o',
            path: record.path,
            content: Buffer.from(record.content)
          } as OverwriteFileAction
          break
        case 'rename':
          yield {
            id: (this as any)._id,
            parent: 0,
            kind: 'r',
            path: record.from,
            to: record.to
          } as RenameFileAction
          break
        case 'delete':
          yield {
            id: (this as any)._id,
            parent: 0,
            kind: 'd',
            path: record.path
            // isDir: false,
          } as DeleteFileAction
          break
        case 'deleteDir':
          yield {
            id: (this as any)._id,
            parent: 0,
            kind: 't',
            path: record.path
            // isDir: true,
          } as ResettableDeleteDirAction
          break
      }
    }
  }

  // @ts-ignore
  override get actions(): ResettableAction[] {
    // Create a list of all records until we hit our original backend. This is to support branches
    // that diverge from each others.
    return Array.from(this.generateActions())
  }

  override merge(other: Tree, strategy = MergeStrategy.Default) {
    // assertIsSchematicResettableHostTree(other); // may actually still be just a tree

    if (other === this) {
      // Merging with yourself? Tsk tsk. Nothing to do at least.
      return
    }

    // @ts-ignore
    if (this.isAncestorOf(other)) {
      // Workaround for merging a branch back into one of its ancestors
      // More complete branch point tracking is required to avoid
      strategy |= MergeStrategy.Overwrite
    }

    // const _creationConflictAllowed =
    //   (strategy & MergeStrategy.AllowCreationConflict) ==
    //   MergeStrategy.AllowCreationConflict;
    const overwriteConflictAllowed =
      (strategy & MergeStrategy.AllowOverwriteConflict) ==
      MergeStrategy.AllowOverwriteConflict
    const deleteConflictAllowed =
      (strategy & MergeStrategy.AllowDeleteConflict) ==
      MergeStrategy.AllowDeleteConflict

    other.actions.forEach((action) => {
      switch (action.kind) {
        case 'c': {
          const { path, content } = action

          if (
            this._willCreate(path) ||
            this._willOverwrite(path) ||
            this.exists(path)
          ) {
            const existingContent = this.read(path)
            if (existingContent && content.equals(existingContent)) {
              // Identical outcome; no action required
              return
            }

            // if (!creationConflictAllowed) {
            //   throw new MergeConflictException(path);
            // }

            //   if (action.path === '/README.md') {
            //     console.log(`action :>> `, action, this._willCreate(path), this._willOverwrite(path), this.exists(path), content.toString(), existingContent?.toString(), strategy)
            // }

            /** WE EXPLICITLY ONLY ALLOW OVERWRITES WITH OUR CUSTOM MERGE */
            if (MergeStrategy.AllowCreationConflict === strategy) {
              // @ts-ignore
              this._record
                .overwrite(path, content as {} as virtualFs.FileBuffer)
                .subscribe()
            }
            // console.log(`:>> PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP`);

            return
          } else {
            // @ts-ignore
            this._record
              .create(path, content as {} as virtualFs.FileBuffer)
              .subscribe()
          }

          return
        }

        case 'o': {
          const { path, content } = action
          if (this._willDelete(path) && !overwriteConflictAllowed) {
            console.log(`:>> mergeConflictException overwriting::deleting`)
            throw new MergeConflictException(path)
          }

          // Ignore if content is the same (considered the same change).
          if (this._willOverwrite(path)) {
            const existingContent = this.read(path)
            if (existingContent && content.equals(existingContent)) {
              // Identical outcome; no action required
              return
            }

            if (!overwriteConflictAllowed) {
              console.log(`:>> mergeConflictException overwriting::overwriting`)
              throw new MergeConflictException(path)
            }
          }
          // We use write here as merge validation has already been done, and we want to let
          // the CordHost do its job.
          // @ts-ignore
          this._record
            .write(path, content as {} as virtualFs.FileBuffer)
            .subscribe()

          return
        }

        case 'r': {
          const { path, to } = action
          if (this._willDelete(path)) {
            console.log(`:>> mergeConflictException renaming::deleting`)
            throw new MergeConflictException(path)
          }

          if (this._willRename(path)) {
            // @ts-ignore
            if (this._record.willRenameTo(path, to)) {
              // Identical outcome; no action required
              return
            }

            // No override possible for renaming.
            console.log(`:>> mergeConflictException renaming::renaming`)
            throw new MergeConflictException(path)
          }
          this.rename(path, to)

          return
        }

        case 'd': {
          const { path } = action
          if (this._willDelete(path)) {
            // TODO: This should technically check the content (e.g., hash on delete)
            // Identical outcome; no action required
            return
          }

          if (!this.exists(path) && !deleteConflictAllowed) {
            console.log(`:>> mergeConflictException deleting::deleting`)
            throw new MergeConflictException(path)
          }

          // @ts-ignore
          this._recordSync.delete(path)

          return
        }
      }
    })
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

    this.getRecord().rmDir(dirEntry)
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

    this.getRecord().mvDir(fromPath, toPath)
  }

  // reset() {
  //   // this._record._filesToCreate = new Set();
  //   // this._record._filesToRename = new Map();
  //   // this._record._filesToRenameRevert = new Map();
  //   // this._record._filesToDelete = new Set();
  //   // this._record._filesToOverwrite = new Set();
  // }
}
