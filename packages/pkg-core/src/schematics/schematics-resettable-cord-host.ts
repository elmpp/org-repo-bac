import { FileAlreadyExistException, FileDoesNotExistException, Path } from "@angular-devkit/core";
import { CordHost, CordHostCreate, CordHostDelete, CordHostOverwrite, CordHostRecord, CordHostRename, Host } from "@angular-devkit/core/src/virtual-fs/host";
import { DirEntry } from "@angular-devkit/schematics";
import { from as observableFrom, Observable, of, throwError } from "rxjs";
import { concatMap, reduce, switchMap } from "rxjs/operators";

export interface ResettableCordHostDeleteDir {
  kind: 'deleteDir';
  path: Path;
}
export type ResettableCordHostRecord = CordHostRecord | ResettableCordHostDeleteDir;

export class SchematicResettableCordHost extends CordHost {

  _dirsToRename: Map<Path, Path> = new Map()
  _dirsToDelete: Set<Path> = new Set()
  // NEED TO EXPAND THIS HERE TO INCLUDE OTHER DIRECTORY OPERATIONS

  /** GH - https://github.com/angular/angular-cli/blob/8095268fa4e06c70f2f11323cff648fc6d4aba7d/packages/angular_devkit/core/src/virtual-fs/host/record.ts#L95 */
  static cloneFrom(recordHost: CordHost): SchematicResettableCordHost {

    const dolly = new SchematicResettableCordHost((recordHost as SchematicResettableCordHost)._back);
    // console.log(`recordHost._back :>> `, recordHost._back)

    // dolly._cache = new Map(recordHost._cache);

    /** this resets the actions... */
    dolly._filesToCreate = new Set();
    dolly._filesToRename = new Map();
    dolly._filesToRenameRevert = new Map();
    dolly._filesToDelete = new Set();
    dolly._filesToOverwrite = new Set();
    dolly._dirsToRename = new Map()
    dolly._dirsToDelete = new Set()

    // dolly._filesToCreate = new Set(recordHost._filesToCreate);
    // dolly._filesToRename = new Map(recordHost._filesToRename);
    // dolly._filesToRenameRevert = new Map(recordHost._filesToRenameRevert);
    // dolly._filesToDelete = new Set(recordHost._filesToDelete);
    // dolly._filesToOverwrite = new Set(recordHost._filesToOverwrite);
    // dolly._dirsToRename = new Map(recordHost._dirsToRename);

    // records must be wiped clear (so that hostTree.actions don't rollover)

    return dolly;

    // console.log(`recordHost :>> `, recordHost)
    // return recordHost.clone()
  }

  override exists(path: Path): Observable<boolean> {
    // if (path === '/__TMP_repo1/package.json') {
    //   console.log(`path, this._exists(path), this.willDelete(path), this.willRename(path), this._back.exists(path) :>> `, path, this._exists(path), this.willDelete(path), this.willRename(path), this._back.exists(path))
    //   console.log(` this._filesToRename, this._dirsToRename :>> `,  this._filesToRename, this._dirsToRename)
    // }
    return this._exists(path)
      ? of(true)
      : this.willDelete(path) || this.willRename(path)
      ? of(false)
      : this._back.exists(path);
  }

  mvDir(fromPath: Path, toPath: Path) {
    // console.log(`:>> mvDir being called ${fromPath}, ${toPath}`);

    this._dirsToRename.set(toPath, fromPath) // unintuitively backwards like the _filesToRenameRevert
  }

  /**
   * Custom hack to effect removal of directories, despite Schematic's file-only mechanics - https://tinyurl.com/2yl7gxra
   * As a halfway nod to security, only folders without any files (nested empty folders are ok) are allowed. Therefore
   * suitable for use after normal tree.delete(folderPath)
  */
  rmDir(dirEntry: DirEntry) {

    const dirEntryPath = dirEntry.path

    // console.log(`rmDir: dirEntryPath, this._exists(dirEntryPath), this._filesToCreate.has(dirEntryPath), this._filesToOverwrite.has(dirEntryPath), this._filesToRenameRevert.has(dirEntryPath) :>> `, dirEntryPath, this._exists(dirEntryPath), this._filesToCreate.has(dirEntryPath), this._filesToOverwrite.has(dirEntryPath), this._filesToRenameRevert.has(dirEntryPath))

      // console.log(`:>> Adding ${dirEntryPath}`);

    this._dirsToDelete.add(dirEntryPath)


    // this._filesToDelete.add(dirEntryPath)

    // console.log(`rmDir: dirEntryPath, this._exists(dirEntryPath), this._filesToCreate.has(dirEntryPath), this._filesToOverwrite.has(dirEntryPath), this._filesToRenameRevert.has(dirEntryPath) :>> `, dirEntryPath, this._exists(dirEntryPath), this._filesToCreate.has(dirEntryPath), this._filesToOverwrite.has(dirEntryPath), this._filesToRenameRevert.has(dirEntryPath))

    // if (false && this._exists(dirEntryPath)) { // always assume it's been removed

    //   // need to find out if we're due to create any files within this directory...
    //   const findEntriesMatchingDirPath = (entries: Set<Path>, dirEntryPath: Path) => {
    //     return Array.from(entries.values()).filter(p => p.startsWith(dirEntryPath))
    //   }

    //   const createFiles = findEntriesMatchingDirPath(this._filesToCreate, dirEntryPath)
    //   const overwriteFiles = findEntriesMatchingDirPath(this._filesToOverwrite, dirEntryPath);
    //   const renameFiles = findEntriesMatchingDirPath(new Set(this._filesToRenameRevert.values()), dirEntryPath);
    //   const hasRenameDirs = this._dirsToRename.has(dirEntryPath) || Array.from(this._dirsToRename.values()).includes(dirEntryPath)

    //   console.log(`dirEntryPath, createFiles, overwriteFiles, renameFiles, hasRenameDirs :>> `, dirEntryPath, createFiles, overwriteFiles, renameFiles, hasRenameDirs, this._dirsToRename, this._filesToRenameRevert)

    //   if (hasRenameDirs || renameFiles.length) {
    //     console.log(`:>> rmDir: hasRenameDirs === true -> exiting...`);

    //     return
    //   }

    //   if (createFiles.length) {
    //     return
    //     // this._filesToCreate.delete(dirEntryPath); // we do not want to reverse previous explicit creations when simply removing rmDir
    //   } else if (overwriteFiles.length) {
    //     this._filesToOverwrite.delete(dirEntryPath);
    //     this._filesToDelete.add(dirEntryPath);
    //   } else {
    //     const maybeOrigin = renameFiles;
    //     if (maybeOrigin.length) {
    //       this._filesToRenameRevert.delete(dirEntryPath);
    //       this._filesToRename.delete(dirEntryPath);
    //       this._filesToDelete.add(dirEntryPath);

    //       // this._filesToRename.delete(maybeOrigin);
    //       // this._filesToDelete.add(maybeOrigin);
    //     } else {
    //       console.log(`:>> DDDDDDDDDDDDDDDDDDDDDDDDDDDD`);

    //       this._filesToDelete.add(dirEntryPath) // we trust the user
    //       // return throwError(
    //       //   new UnknownException(`This should never happen. Path: ${JSON.stringify(dirEntryPath)}.`),
    //       // );
    //     }
    //   }

    //   return super.delete(dirEntryPath);
    // } else {

    //   console.log(`rmDir: dirEntryPath, this._exists(dirEntryPath), this._filesToCreate.has(dirEntryPath), this._filesToOverwrite.has(dirEntryPath), this._filesToRenameRevert.has(dirEntryPath) :>> `, dirEntryPath, this._exists(dirEntryPath), this._filesToCreate.has(dirEntryPath), this._filesToOverwrite.has(dirEntryPath), this._filesToRenameRevert.has(dirEntryPath))

    //   console.log(`:>> Adding ${dirEntryPath}`);

    //   this._dirsToDelete.add(dirEntryPath)

    //   // return this._back.exists(dirEntryPath).pipe(
    //   //   switchMap((exists) => {
    //   //     if (exists) {
    //   //       // this._filesToDelete.add(dirEntryPath);
    //   //       console.log(`:>> Adding ${dirEntryPath}`);

    //   //       this._dirsToDelete.add(dirEntryPath)

    //   //       return of<void>();
    //   //     } else {
    //   //       return throwError(new FileDoesNotExistException(dirEntryPath));
    //   //     }
    //   //   }),
    //   // );
    // }

    // console.log(`this._backend, this._record :>> `, this._backend, this._record)
    // this._record.delete(dirEntry.path)
  }

  // override delete(path: Path): Observable<void> {
  //   if (this._exists(path)) {
  //     if (this._filesToCreate.has(path)) {
  //       this._filesToCreate.delete(path);
  //     } else if (this._filesToOverwrite.has(path)) {
  //       this._filesToOverwrite.delete(path);
  //       this._filesToDelete.add(path);
  //     } else {
  //       const maybeOrigin = this._filesToRenameRevert.get(path);
  //       if (maybeOrigin) {
  //         this._filesToRenameRevert.delete(path);
  //         this._filesToRename.delete(maybeOrigin);
  //         this._filesToDelete.add(maybeOrigin);
  //       } else {
  //         return throwError(
  //           new UnknownException(`This should never happen. Path: ${JSON.stringify(path)}.`),
  //         );
  //       }
  //     }

  //     return super.delete(path);
  //   } else {
  //     return this._back.exists(path).pipe(
  //       switchMap((exists) => {
  //         if (exists) {
  //           this._filesToDelete.add(path);

  //           return of<void>();
  //         } else {
  //           return throwError(new FileDoesNotExistException(path));
  //         }
  //       }),
  //     );
  //   }
  // }

  // override reset(): void {
  //   console.log(`:>> SCHEMATICRESETTABLECORDHOST CALLED`);

  //   // this._cache.clear();
  //   // this._watchers.clear();
  // }

  /**
   * Commit the changes recorded to a Host. It is assumed that the host does have the same structure
   * as the host that was used for backend (could be the same host).
   * @param host The host to create/delete/rename/overwrite files to.
   * @param force Whether to skip existence checks when creating/overwriting. This is
   *   faster but might lead to incorrect states. Because Hosts natively don't support creation
   *   versus overwriting (it's only writing), we check for existence before completing a request.
   * @returns An observable that completes when done, or error if an error occured.
   */
  override commit(host: Host, force = false): Observable<void> {
    // Really commit everything to the actual host.
    return observableFrom(this.records()).pipe(
      concatMap((record) => {
        switch (record.kind) {
          case 'delete':
            return host.delete(record.path);
          case 'rename':
            return host.rename(record.from, record.to);
          case 'create':
            return host.exists(record.path).pipe(
              switchMap((exists) => {
                if (exists && !force) {
                  return throwError(new FileAlreadyExistException(record.path));
                } else {
                  return host.write(record.path, record.content);
                }
              }),
            );
          case 'overwrite':
            return host.exists(record.path).pipe(
              switchMap((exists) => {
                if (!exists && !force) {
                  return throwError(new FileDoesNotExistException(record.path));
                } else {
                  return host.write(record.path, record.content);
                }
              }),
            );
          case 'deleteDir':
            console.log(`host :>> `, host)
            return host.exists(record.path).pipe(
              switchMap((exists) => {

                if (!exists && !force) {
                  return throwError(new FileDoesNotExistException(record.path));
                } else {
                  return of<void>()
                  // return host.delete(record.path);
                }
              }),
            );
          // default:
          //   throwError(new FileDoesNotExistException(record.path));
        }
      }),
      reduce(() => {}),
    );
  }

  // @ts-ignore
  override records(): ResettableCordHostRecord[] {
    // console.log(`this._dirsToDelete.values() :>> `, this._dirsToDelete.values())

    const ret = [
      ...[...this._filesToDelete.values()].map(
        (path): CordHostDelete =>
          ({
            kind: 'delete',
            path,
          }),
      ),
      ...[...this._filesToRename.entries()].map(
        ([from, to]): CordHostRename =>
          ({
            kind: 'rename',
            from,
            to,
          }),
      ),
      ...[...this._filesToCreate.values()].map(
        (path): CordHostCreate =>
          ({
            kind: 'create',
            path,
            content: this._read(path),
          }),
      ),
      ...[...this._filesToOverwrite.values()].map(
        (path): CordHostOverwrite =>
          ({
            kind: 'overwrite',
            path,
            content: this._read(path),
          }),
      ),
      ...[...this._dirsToDelete.values()].map(
        (path): ResettableCordHostDeleteDir =>
          ({
            kind: 'deleteDir',
            path,
          }),
      ),
    ];
    return ret
  }

  override delete(filePath: Path) {
    // if (filePath === '/__TMP_repo1/package.json') {
    //   // console.log(`filePath, this :>> `, filePath, this)
    //   console.log(`filePath, this._exists(filePath), this._filesToCreate, this._filesToOverwrite, this._filesToDelete, this._fileToRename, this._filesToRenameRevert, this._dirsToRename :>> `, filePath, this._exists(filePath), this._filesToCreate, this._filesToOverwrite, this._filesToDelete, this._fileToRename, this._filesToRenameRevert, this._dirsToRename)
    // }

    if (this._exists(filePath)) {
      if (this._filesToCreate.has(filePath)) {
        this._filesToCreate.delete(filePath);
      } else if (this._filesToOverwrite.has(filePath)) {
        this._filesToOverwrite.delete(filePath);
        this._filesToDelete.add(filePath);
      } else {
        const maybeOrigin = this._filesToRenameRevert.get(filePath);
        if (maybeOrigin) {
          this._filesToRenameRevert.delete(filePath);
          this._filesToRename.delete(maybeOrigin);
          this._filesToDelete.add(maybeOrigin);
        } else {
          // console.log(`this._filesToCreate :>> `, this._filesToCreate)
          // console.log(`:>> this._exists === true; we may well think that files exist as our cache is preserved yet we're clearing the _filesXXX ${filePath}`);

          return of<void>()

          // return throwError(
          //   new UnknownException(`This should never happen. Path: ${JSON.stringify(filePath)}.`),
          // );
        }
      }

      // return of<void>()
      return new Observable<void>((obs) => {
        this._delete(filePath);
        obs.next();
        obs.complete();
      });
      // return super.delete(filePath);
    } else {
      return this._back.exists(filePath).pipe(
        switchMap((exists) => {
          if (exists) {
            this._filesToDelete.add(filePath);

            return of<void>();
          } else {
            return of<void>() // we trust when doing a .rmDir()
            // return throwError(new FileDoesNotExistException(filePath));
          }
        }),
      );
    }
  }

  protected override _delete(path: Path): void {
    const NormalizedSep = '/' as Path;

    path = this._toAbsolute(path);
    // console.log(`path, this._isDirectory(path) :>> `, path, this._isDirectory(path))
    if (this._isDirectory(path)) {
      for (const [cachePath] of this._cache.entries()) {
        if (cachePath.startsWith(path + NormalizedSep) || cachePath === path) {
          this._cache.delete(cachePath);
        }
      }
    } else {
      this._cache.delete(path);
    }
    // @ts-ignore
    this._updateWatchers(path, 2);
  }
}



// import {
//   EMPTY,
//   Observable,
//   concat,
//   concatMap,
//   map,
//   from as observableFrom,
//   of,
//   reduce,
//   switchMap,
//   throwError,
//   toArray,
// } from 'rxjs';
// import {
//   FileAlreadyExistException,
//   FileDoesNotExistException,
//   PathIsDirectoryException,
//   UnknownException,
// } from '../../exception';
// import { Path, PathFragment } from '../path';
// import {
//   FileBuffer,
//   Host,
//   HostCapabilities,
//   HostWatchOptions,
//   ReadonlyHost,
//   Stats,
// } from './interface';
// import { SimpleMemoryHost } from './memory';

// export interface CordHostCreate {
//   kind: 'create';
//   path: Path;
//   content: FileBuffer;
// }
// export interface CordHostOverwrite {
//   kind: 'overwrite';
//   path: Path;
//   content: FileBuffer;
// }
// export interface CordHostRename {
//   kind: 'rename';
//   from: Path;
//   to: Path;
// }
// export interface CordHostDelete {
//   kind: 'delete';
//   path: Path;
// }
// export type ResettableCordHostRecord = CordHostCreate | CordHostOverwrite | CordHostRename | CordHostDelete;

// /**
//  * A Host that records changes to the underlying Host, while keeping a record of Create, Overwrite,
//  * Rename and Delete of files.
//  *
//  * This is fully compatible with Host, but will keep a staging of every changes asked. That staging
//  * follows the principle of the Tree (e.g. can create a file that already exists).
//  *
//  * Using `create()` and `overwrite()` will force those operations, but using `write` will add
//  * the create/overwrite records IIF the files does/doesn't already exist.
//  */
// export class CordHost extends SimpleMemoryHost {
//   protected _filesToCreate = new Set<Path>();
//   protected _filesToRename = new Map<Path, Path>();
//   protected _filesToRenameRevert = new Map<Path, Path>();
//   protected _filesToDelete = new Set<Path>();
//   protected _filesToOverwrite = new Set<Path>();

//   constructor(protected _back: ReadonlyHost) {
//     super();
//   }

//   get backend(): ReadonlyHost {
//     return this._back;
//   }
//   override get capabilities(): HostCapabilities {
//     // Our own host is always Synchronous, but the backend might not be.
//     return {
//       synchronous: this._back.capabilities.synchronous,
//     };
//   }

//   /**
//    * Create a copy of this host, including all actions made.
//    * @returns {CordHost} The carbon copy.
//    */
//   clone(): CordHost {
//     const dolly = new CordHost(this._back);

//     dolly._cache = new Map(this._cache);
//     dolly._filesToCreate = new Set(this._filesToCreate);
//     dolly._filesToRename = new Map(this._filesToRename);
//     dolly._filesToRenameRevert = new Map(this._filesToRenameRevert);
//     dolly._filesToDelete = new Set(this._filesToDelete);
//     dolly._filesToOverwrite = new Set(this._filesToOverwrite);

//     return dolly;
//   }

//   /**
//    * Commit the changes recorded to a Host. It is assumed that the host does have the same structure
//    * as the host that was used for backend (could be the same host).
//    * @param host The host to create/delete/rename/overwrite files to.
//    * @param force Whether to skip existence checks when creating/overwriting. This is
//    *   faster but might lead to incorrect states. Because Hosts natively don't support creation
//    *   versus overwriting (it's only writing), we check for existence before completing a request.
//    * @returns An observable that completes when done, or error if an error occured.
//    */
//   commit(host: Host, force = false): Observable<void> {
//     // Really commit everything to the actual host.
//     return observableFrom(this.records()).pipe(
//       concatMap((record) => {
//         switch (record.kind) {
//           case 'delete':
//             return host.delete(record.path);
//           case 'rename':
//             return host.rename(record.from, record.to);
//           case 'create':
//             return host.exists(record.path).pipe(
//               switchMap((exists) => {
//                 if (exists && !force) {
//                   return throwError(new FileAlreadyExistException(record.path));
//                 } else {
//                   return host.write(record.path, record.content);
//                 }
//               }),
//             );
//           case 'overwrite':
//             return host.exists(record.path).pipe(
//               switchMap((exists) => {
//                 if (!exists && !force) {
//                   return throwError(new FileDoesNotExistException(record.path));
//                 } else {
//                   return host.write(record.path, record.content);
//                 }
//               }),
//             );
//         }
//       }),
//       reduce(() => {}),
//     );
//   }

//   records(): ResettableCordHostRecord[] {
//     return [
//       ...[...this._filesToDelete.values()].map(
//         (path) =>
//           ({
//             kind: 'delete',
//             path,
//           } as ResettableCordHostRecord),
//       ),
//       ...[...this._filesToRename.entries()].map(
//         ([from, to]) =>
//           ({
//             kind: 'rename',
//             from,
//             to,
//           } as ResettableCordHostRecord),
//       ),
//       ...[...this._filesToCreate.values()].map(
//         (path) =>
//           ({
//             kind: 'create',
//             path,
//             content: this._read(path),
//           } as ResettableCordHostRecord),
//       ),
//       ...[...this._filesToOverwrite.values()].map(
//         (path) =>
//           ({
//             kind: 'overwrite',
//             path,
//             content: this._read(path),
//           } as ResettableCordHostRecord),
//       ),
//     ];
//   }

//   /**
//    * Specialized version of {@link CordHost#write} which forces the creation of a file whether it
//    * exists or not.
//    * @param {} path
//    * @param {FileBuffer} content
//    * @returns {Observable<void>}
//    */
//   create(path: Path, content: FileBuffer): Observable<void> {
//     if (super._exists(path)) {
//       throw new FileAlreadyExistException(path);
//     }

//     if (this._filesToDelete.has(path)) {
//       this._filesToDelete.delete(path);
//       this._filesToOverwrite.add(path);
//     } else {
//       this._filesToCreate.add(path);
//     }

//     return super.write(path, content);
//   }

//   overwrite(path: Path, content: FileBuffer): Observable<void> {
//     return this.isDirectory(path).pipe(
//       switchMap((isDir) => {
//         if (isDir) {
//           return throwError(new PathIsDirectoryException(path));
//         }

//         return this.exists(path);
//       }),
//       switchMap((exists) => {
//         if (!exists) {
//           return throwError(new FileDoesNotExistException(path));
//         }

//         if (!this._filesToCreate.has(path)) {
//           this._filesToOverwrite.add(path);
//         }

//         return super.write(path, content);
//       }),
//     );
//   }

//   override write(path: Path, content: FileBuffer): Observable<void> {
//     return this.exists(path).pipe(
//       switchMap((exists) => {
//         if (exists) {
//           // It exists, but might be being renamed or deleted. In that case we want to create it.
//           if (this.willRename(path) || this.willDelete(path)) {
//             return this.create(path, content);
//           } else {
//             return this.overwrite(path, content);
//           }
//         } else {
//           return this.create(path, content);
//         }
//       }),
//     );
//   }

//   override read(path: Path): Observable<FileBuffer> {
//     if (this._exists(path)) {
//       return super.read(path);
//     }

//     return this._back.read(path);
//   }

//   override delete(path: Path): Observable<void> {
//     if (this._exists(path)) {
//       if (this._filesToCreate.has(path)) {
//         this._filesToCreate.delete(path);
//       } else if (this._filesToOverwrite.has(path)) {
//         this._filesToOverwrite.delete(path);
//         this._filesToDelete.add(path);
//       } else {
//         const maybeOrigin = this._filesToRenameRevert.get(path);
//         if (maybeOrigin) {
//           this._filesToRenameRevert.delete(path);
//           this._filesToRename.delete(maybeOrigin);
//           this._filesToDelete.add(maybeOrigin);
//         } else {
//           return throwError(
//             new UnknownException(`This should never happen. Path: ${JSON.stringify(path)}.`),
//           );
//         }
//       }

//       return super.delete(path);
//     } else {
//       return this._back.exists(path).pipe(
//         switchMap((exists) => {
//           if (exists) {
//             this._filesToDelete.add(path);

//             return of<void>();
//           } else {
//             return throwError(new FileDoesNotExistException(path));
//           }
//         }),
//       );
//     }
//   }

//   override rename(from: Path, to: Path): Observable<void> {
//     return concat(this.exists(to), this.exists(from)).pipe(
//       toArray(),
//       switchMap(([existTo, existFrom]) => {
//         if (!existFrom) {
//           return throwError(new FileDoesNotExistException(from));
//         }
//         if (from === to) {
//           return EMPTY;
//         }

//         if (existTo) {
//           return throwError(new FileAlreadyExistException(to));
//         }

//         // If we're renaming a file that's been created, shortcircuit to creating the `to` path.
//         if (this._filesToCreate.has(from)) {
//           this._filesToCreate.delete(from);
//           this._filesToCreate.add(to);

//           return super.rename(from, to);
//         }
//         if (this._filesToOverwrite.has(from)) {
//           this._filesToOverwrite.delete(from);

//           // Recursively call this function. This is so we don't repeat the bottom logic. This
//           // if will be by-passed because we just deleted the `from` path from files to overwrite.
//           return concat(
//             this.rename(from, to),
//             new Observable<never>((x) => {
//               this._filesToOverwrite.add(to);
//               x.complete();
//             }),
//           );
//         }
//         if (this._filesToDelete.has(to)) {
//           this._filesToDelete.delete(to);
//           this._filesToDelete.add(from);
//           this._filesToOverwrite.add(to);

//           // We need to delete the original and write the new one.
//           return this.read(from).pipe(map((content) => this._write(to, content)));
//         }

//         const maybeTo1 = this._filesToRenameRevert.get(from);
//         if (maybeTo1) {
//           // We already renamed to this file (A => from), let's rename the former to the new
//           // path (A => to).
//           this._filesToRename.delete(maybeTo1);
//           this._filesToRenameRevert.delete(from);
//           from = maybeTo1;
//         }

//         this._filesToRename.set(from, to);
//         this._filesToRenameRevert.set(to, from);

//         // If the file is part of our data, just rename it internally.
//         if (this._exists(from)) {
//           return super.rename(from, to);
//         } else {
//           // Create a file with the same content.
//           return this._back.read(from).pipe(switchMap((content) => super.write(to, content)));
//         }
//       }),
//     );
//   }

//   override list(path: Path): Observable<PathFragment[]> {
//     return concat(super.list(path), this._back.list(path)).pipe(
//       reduce((list: Set<PathFragment>, curr: PathFragment[]) => {
//         curr.forEach((elem) => list.add(elem));

//         return list;
//       }, new Set<PathFragment>()),
//       map((set) => [...set]),
//     );
//   }

//   override exists(path: Path): Observable<boolean> {
//     return this._exists(path)
//       ? of(true)
//       : this.willDelete(path) || this.willRename(path)
//       ? of(false)
//       : this._back.exists(path);
//   }
//   override isDirectory(path: Path): Observable<boolean> {
//     return this._exists(path) ? super.isDirectory(path) : this._back.isDirectory(path);
//   }
//   override isFile(path: Path): Observable<boolean> {
//     return this._exists(path)
//       ? super.isFile(path)
//       : this.willDelete(path) || this.willRename(path)
//       ? of(false)
//       : this._back.isFile(path);
//   }

//   override stat(path: Path): Observable<Stats | null> | null {
//     return this._exists(path)
//       ? super.stat(path)
//       : this.willDelete(path) || this.willRename(path)
//       ? of(null)
//       : this._back.stat(path);
//   }

//   override watch(path: Path, options?: HostWatchOptions) {
//     // Watching not supported.
//     return null;
//   }

//   willCreate(path: Path) {
//     return this._filesToCreate.has(path);
//   }
//   willOverwrite(path: Path) {
//     return this._filesToOverwrite.has(path);
//   }
//   willDelete(path: Path) {
//     return this._filesToDelete.has(path);
//   }
//   willRename(path: Path) {
//     return this._filesToRename.has(path);
//   }
//   willRenameTo(path: Path, to: Path) {
//     return this._filesToRename.get(path) === to;
//   }
// }
