import { Path } from "@angular-devkit/core";
import {
  DeleteFileAction,
  DryRunCreateEvent,
  DryRunDeleteEvent,
  DryRunErrorEvent,
  DryRunRenameEvent,
  DryRunSink,
  DryRunUpdateEvent,
  UnknownActionException,
} from "@angular-devkit/schematics";
import { concat, EMPTY, Observable, of as observableOf, Subject } from "rxjs";
import { ignoreElements, map } from "rxjs/operators";
import {
  ResettableAction,
  ResettableDeleteDirAction,
} from "./schematics-resettable-host-tree";

// export interface DryRunErrorEvent {
//   kind: 'error';
//   description: 'alreadyExist' | 'doesNotExist';
//   path: string;
// }
// export interface DryRunDeleteEvent {
//   kind: 'delete';
//   path: string;
// }
// export interface DryRunCreateEvent {
//   kind: 'create';
//   path: string;
//   content: Buffer;
// }
// export interface DryRunUpdateEvent {
//   kind: 'update';
//   path: string;
//   content: Buffer;
// }
// export interface DryRunRenameEvent {
//   kind: 'rename';
//   path: string;
//   to: string;
// }

export interface ResettableDryRunDeleteDirEvent {
  kind: "deleteDir";
  path: string;
}
export interface ResettableDryRunFlushEvent {
  kind: "flush";
  path: "/";
}

export type ResettableDryRunEvent =
  | DryRunErrorEvent
  | DryRunDeleteEvent
  | DryRunCreateEvent
  | DryRunUpdateEvent
  | DryRunRenameEvent
  | ResettableDryRunDeleteDirEvent
  | ResettableDryRunFlushEvent;

export class SchematicResettableDryRunSink extends DryRunSink {
  protected _dirsToDelete = new Set<Path>();

  // protected _filesToDelete = new Set<Path>();
  // protected _filesToRename = new Set<[Path, Path]>();
  // protected _filesToCreate = new Map<Path, UpdateBufferBase>();
  // protected _filesToUpdate = new Map<Path, UpdateBufferBase>();

  // @ts-ignore
  protected override _subject = new Subject<ResettableDryRunEvent>();
  // protected _fileDoesNotExistExceptionSet = new Set<string>();
  // protected _fileAlreadyExistExceptionSet = new Set<string>();

  // @ts-ignore
  override readonly reporter: Observable<ResettableDryRunEvent> =
    this._subject.asObservable();

  protected _deleteDir(path: Path): Observable<void> {
    this._dirsToDelete.add(path);

    // if (this._filesToCreate.has(path)) {
    //   this._filesToCreate.delete(path);
    //   this._filesToUpdate.delete(path);
    // } else {
    //   this._filesToDelete.add(path);
    // }

    return EMPTY;
  }

  // /**
  //  * @param {host} dir The host to use to output. This should be scoped.
  //  * @param {boolean} force Whether to force overwriting files that already exist.
  //  */
  // constructor(host: virtualFs.Host, force?: boolean);

  // constructor(host: virtualFs.Host | string, force = false) {
  //   super(
  //     typeof host == 'string'
  //       ? new virtualFs.ScopedHost(new NodeJsSyncHost(), normalize(host))
  //       : host,
  //     force,
  //   );
  // }

  // protected override _fileAlreadyExistException(path: string): void {
  //   this._fileAlreadyExistExceptionSet.add(path);
  // }
  // protected override _fileDoesNotExistException(path: string): void {
  //   this._fileDoesNotExistExceptionSet.add(path);
  // }

  override validateSingleAction(action: ResettableAction): Observable<void> {
    switch (action.kind) {
      case "o":
        return this._validateOverwriteAction(action);
      case "c":
        return this._validateCreateAction(action);
      case "r":
        return this._validateRenameAction(action);
      case "d":
        return this._validateDeleteAction(action);
      case "t":
        return this._validateDeleteDirAction(action);
      default:
        throw new UnknownActionException(action);
    }
  }

  override commitSingleAction(action: ResettableAction): Observable<void> {
    return concat(
      this.validateSingleAction(action),
      new Observable<void>((observer) => {
        let committed: Observable<void> | null = null;
        switch (action.kind) {
          case "o":
            committed = this._overwriteFile(action.path, action.content);
            break;
          case "c":
            committed = this._createFile(action.path, action.content);
            break;
          case "r":
            committed = this._renameFile(action.path, action.to);
            break;
          case "d":
            committed = this._deleteFile(action.path);
            break;
          case "t":
            committed = this._deleteDir(action.path);
            break;
        }

        if (committed) {
          committed.subscribe(observer);
        } else {
          observer.complete();
        }
      })
    ).pipe(ignoreElements());
  }

  protected _dirDoesNotExistException(path: string): void {
    throw new Error(
      `Resettable directory does not exist when removing '${path}'`
    );
  }

  protected _validateDeleteDirAction(
    action: ResettableDeleteDirAction
  ): Observable<void> {
    // console.log(`action :>> `, action)
    return this._validateDirExists(action.path).pipe(
      map((b) => {
        if (!b) {
          this._dirDoesNotExistException(action.path);
        }
      })
    );
  }

  protected override _validateDeleteAction(action: DeleteFileAction): Observable<void> {
    return this._validateFileExists(action.path).pipe(
      map((b) => {
        if (!b) {
          this._fileDoesNotExistException(action.path);
        }
      }),
    );
  }
  protected override _validateFileExists(p: Path): Observable<boolean> {
    if (this._filesToCreate.has(p) || this._filesToUpdate.has(p)) {
      return observableOf(true);
    }

    if (this._filesToDelete.has(p)) {
      return observableOf(false);
    }

    for (const [from, to] of this._filesToRename.values()) {
      switch (p) {
        case from:
          return observableOf(false);
        case to:
          return observableOf(true);
      }
    }
    return this._host.exists(p);
  }

  protected _validateDirExists(p: Path): Observable<boolean> {
    return observableOf(true);

    // if (this._filesToCreate.has(p) || this._filesToUpdate.has(p)) {
    //   return of(true);
    // }

    // if (this._dirsToDelete.has(p)) {
    //   return of(false);
    // }

    // for (const [from, to] of this._filesToRename.values()) {
    //   switch (p) {
    //     case from:
    //       return of(false);
    //     case to:
    //       return of(true);
    //   }
    // }

    // return this._host.exists(p);
  }

  override _done() {
    this._fileAlreadyExistExceptionSet.forEach((path) => {
      this._subject.next({
        kind: "error",
        description: "alreadyExist",
        path,
      });
    });
    this._fileDoesNotExistExceptionSet.forEach((path) => {
      this._subject.next({
        kind: "error",
        description: "doesNotExist",
        path,
      });
    });

    this._filesToDelete.forEach((path) => {
      // Check if this is a renaming.
      for (const [from] of this._filesToRename) {
        if (from == path) {
          // The event is sent later on.
          return;
        }
      }

      this._subject.next({ kind: "delete", path });
    });
    this._filesToRename.forEach(([path, to]) => {
      this._subject.next({ kind: "rename", path, to });
    });
    this._filesToCreate.forEach((content, path) => {
      // Check if this is a renaming.
      for (const [, to] of this._filesToRename) {
        if (to == path) {
          // The event is sent later on.
          return;
        }
      }
      if (
        this._fileAlreadyExistExceptionSet.has(path) ||
        this._fileDoesNotExistExceptionSet.has(path)
      ) {
        return;
      }

      this._subject.next({ kind: "create", path, content: content.generate() });
    });
    this._filesToUpdate.forEach((content, path) => {
      this._subject.next({ kind: "update", path, content: content.generate() });
    });
    /** must be last!! */
    this._dirsToDelete.forEach((path) => {
      this._subject.next({ kind: "deleteDir", path });
    });

    this._subject.complete();

    return observableOf<void>(undefined);
  }
}
