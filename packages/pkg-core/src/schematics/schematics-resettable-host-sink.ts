/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { virtualFs } from "@angular-devkit/core";
import { concat as concatObservables, from as observableFrom } from "rxjs";
import { concatMap, reduce } from "rxjs/operators";
import { SchematicResettableScopedNodeJsSyncHost } from "./schematic-resettable-scoped-node-js-sync-host";
import { SchematicResettableDryRunSink } from "./schematics-resettable-dry-run-sink";

export class SchematicResettableHostSink extends SchematicResettableDryRunSink {
  // export class SchematicResettableHostSink extends HostSink {

  constructor(
    protected override _host: SchematicResettableScopedNodeJsSyncHost,
    protected override _force = false
  ) {
    super(_host, _force);
  }

  // protected _filesToDelete = new Set<Path>();
  // protected _filesToRename = new Set<[Path, Path]>();
  // protected _filesToCreate = new Map<Path, UpdateBufferBase>();
  // protected _filesToUpdate = new Map<Path, UpdateBufferBase>();

  // protected _dirsToDelete = new Set<Path>();

  // protected _deleteDir(path: Path): Observable<void> {
  //   this._dirsToDelete.add(path);

  //   // if (this._filesToCreate.has(path)) {
  //   //   this._filesToCreate.delete(path);
  //   //   this._filesToUpdate.delete(path);
  //   // } else {
  //   //   this._filesToDelete.add(path);
  //   // }

  //   return EMPTY;
  // }

  // override validateSingleAction(action: ResettableAction): Observable<void> {
  //   switch (action.kind) {
  //     case 'o':
  //       return this._validateOverwriteAction(action);
  //     case 'c':
  //       return this._validateCreateAction(action);
  //     case 'r':
  //       return this._validateRenameAction(action);
  //     case 'd':
  //       return this._validateDeleteAction(action);
  //     case 't':
  //       return this._validateDeleteDirAction(action);
  //     default:
  //       throw new UnknownActionException(action);
  //   }
  // }

  // override commitSingleAction(action: ResettableAction): Observable<void> {
  //   return concat(
  //     this.validateSingleAction(action),
  //     new Observable<void>((observer) => {
  //       let committed: Observable<void> | null = null;
  //       switch (action.kind) {
  //         case 'o':
  //           committed = this._overwriteFile(action.path, action.content);
  //           break;
  //         case 'c':
  //           committed = this._createFile(action.path, action.content);
  //           break;
  //         case 'r':
  //           committed = this._renameFile(action.path, action.to);
  //           break;
  //         case 'd':
  //           committed = this._deleteFile(action.path);
  //           break;
  //         case 't':
  //           console.log(`action DELETE :>> `, action)
  //           committed = this._deleteDir(action.path);
  //           break;
  //       }

  //       if (committed) {
  //         committed.subscribe(observer);
  //       } else {
  //         observer.complete();
  //       }
  //     }),
  //   ).pipe(ignoreElements());
  // }

  // protected _dirDoesNotExistException(path: string): void {
  //   throw new Error(`Resettable directory does not exist when removing '${path}'`);
  // }

  // protected _validateDeleteDirAction(action: ResettableDeleteDirAction): Observable<void> {
  //   console.log(`action :>> `, action)
  //   return this._validateDirExists(action.path).pipe(
  //     map((b) => {
  //       if (!b) {
  //         this._dirDoesNotExistException(action.path);
  //       }
  //     }),
  //   );
  // }

  // protected _validateDirExists(p: Path): Observable<boolean> {
  //   return of(true)

  //   if (this._filesToCreate.has(p) || this._filesToUpdate.has(p)) {
  //     return of(true);
  //   }

  //   if (this._dirsToDelete.has(p)) {
  //     return of(false);
  //   }

  //   for (const [from, to] of this._filesToRename.values()) {
  //     switch (p) {
  //       case from:
  //         return of(false);
  //       case to:
  //         return of(true);
  //     }
  //   }

  //   return this._host.exists(p);
  // }

  // constructor(protected _host: virtualFs.Host, protected _force = false) {
  //   super();
  // }

  // protected override _validateCreateAction(
  //   action: CreateFileAction
  // ): Observable<void> {
  //   return this._force ? EMPTY : super._validateCreateAction(action);
  // }

  // protected _validateFileExists(p: Path): Observable<boolean> {
  //   if (this._filesToCreate.has(p) || this._filesToUpdate.has(p)) {
  //     return observableOf(true);
  //   }

  //   if (this._filesToDelete.has(p)) {
  //     return observableOf(false);
  //   }

  //   for (const [from, to] of this._filesToRename.values()) {
  //     switch (p) {
  //       case from:
  //         return observableOf(false);
  //       case to:
  //         return observableOf(true);
  //     }
  //   }

  //   return this._host.exists(p);
  // }

  // protected _overwriteFile(path: Path, content: Buffer): Observable<void> {
  //   this._filesToUpdate.set(path, UpdateBufferBase.create(content));

  //   return EMPTY;
  // }
  // protected _createFile(path: Path, content: Buffer): Observable<void> {
  //   this._filesToCreate.set(path, UpdateBufferBase.create(content));

  //   return EMPTY;
  // }
  // protected _renameFile(from: Path, to: Path): Observable<void> {
  //   this._filesToRename.add([from, to]);

  //   return EMPTY;
  // }
  // protected _deleteFile(path: Path): Observable<void> {
  //   if (this._filesToCreate.has(path)) {
  //     this._filesToCreate.delete(path);
  //     this._filesToUpdate.delete(path);
  //   } else {
  //     this._filesToDelete.add(path);
  //   }

  //   return EMPTY;
  // }

  // @ts-ignore
  _done() {
    // Really commit everything to the actual filesystem.
    return concatObservables(
      observableFrom([...this._filesToDelete.values()]).pipe(
        concatMap((path) => this._host.delete(path))
      ),
      observableFrom([...this._filesToRename.entries()]).pipe(
        concatMap(([_, [path, to]]) => this._host.rename(path, to))
      ),
      observableFrom([...this._filesToCreate.entries()]).pipe(
        concatMap(([path, buffer]) => {
          return this._host.write(
            path,
            buffer.generate() as {} as virtualFs.FileBuffer
          );
        })
      ),
      observableFrom([...this._filesToUpdate.entries()]).pipe(
        concatMap(([path, buffer]) => {
          return this._host.write(
            path,
            buffer.generate() as {} as virtualFs.FileBuffer
          );
        })
      ),
      /** must be last!! */
      observableFrom([...this._dirsToDelete.values()]).pipe(
        // tap((dirToDelete) => {
        //   console.log(`dirToDelete :>> `, dirToDelete)
        // }),
        // concatMap((path) => this._host.delete(path))
        concatMap((path) => {
          // const absPath
          // console.log(`this._host :>> `, this._host)
          return this._host.deleteDir(path);
        })
      )
    ).pipe(reduce(() => {}));
  }
}
