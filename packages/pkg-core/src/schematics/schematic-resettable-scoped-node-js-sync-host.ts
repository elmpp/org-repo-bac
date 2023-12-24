import { getSystemPath, join, NormalizedRoot, Path } from '@angular-devkit/core'
import { NodeJsSyncHost } from '@angular-devkit/core/node'
import { ResolverHost } from '@angular-devkit/core/src/virtual-fs/host'
import { rmSync } from 'node:fs'
import { Observable } from 'rxjs'

export class SchematicResettableScopedNodeJsSyncHost extends ResolverHost<{}> {
  protected override _delegate: SchematicResettableNodeJsSyncHost
  constructor(protected _root: Path = NormalizedRoot) {
    const delegate = new SchematicResettableNodeJsSyncHost()
    super(delegate)
    this._delegate = delegate
  }

  deleteDir(path: Path) {
    return this._delegate.deleteDir(this._resolve(path))
  }

  protected _resolve(path: Path): Path {
    return join(this._root, path)
  }
}

/**
 * An implementation of the Virtual FS using Node as the backend, synchronously.
 */
class SchematicResettableNodeJsSyncHost extends NodeJsSyncHost {
  deleteDir(path: Path): Observable<void> {
    return new Observable<void>((obs) => {
      rmSync(getSystemPath(path), {
        force: true,
        recursive: true,
        maxRetries: 3
      })

      obs.complete()
    })
  }

  // write(path: Path, content: virtualFs.FileBuffer): Observable<void> {
  //   return new Observable((obs) => {
  //     mkdirSync(getSystemPath(dirname(path)), { recursive: true });
  //     writeFileSync(getSystemPath(path), new Uint8Array(content));
  //     obs.next();
  //     obs.complete();
  //   });
  // }

  // read(path: Path): Observable<virtualFs.FileBuffer> {
  //   return new Observable((obs) => {
  //     const buffer = readFileSync(getSystemPath(path));

  //     obs.next(new Uint8Array(buffer).buffer as virtualFs.FileBuffer);
  //     obs.complete();
  //   });
  // }

  // delete(path: Path): Observable<void> {
  //   return new Observable<void>((obs) => {
  //     rmSync(getSystemPath(path), { force: true, recursive: true, maxRetries: 3 });

  //     obs.complete();
  //   });
  // }

  // rename(from: Path, to: Path): Observable<void> {
  //   return new Observable((obs) => {
  //     const toSystemPath = getSystemPath(to);
  //     mkdirSync(pathDirname(toSystemPath), { recursive: true });
  //     renameSync(getSystemPath(from), toSystemPath);
  //     obs.next();
  //     obs.complete();
  //   });
  // }

  // list(path: Path): Observable<PathFragment[]> {
  //   return new Observable((obs) => {
  //     const names = readdirSync(getSystemPath(path));
  //     obs.next(names.map((name) => fragment(name)));
  //     obs.complete();
  //   });
  // }

  // exists(path: Path): Observable<boolean> {
  //   return new Observable((obs) => {
  //     obs.next(existsSync(getSystemPath(path)));
  //     obs.complete();
  //   });
  // }

  // isDirectory(path: Path): Observable<boolean> {
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   return this.stat(path)!.pipe(map((stat) => stat.isDirectory()));
  // }

  // isFile(path: Path): Observable<boolean> {
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   return this.stat(path)!.pipe(map((stat) => stat.isFile()));
  // }

  // // Some hosts may not support stat.
  // stat(path: Path): Observable<virtualFs.Stats<Stats>> {
  //   return new Observable((obs) => {
  //     obs.next(statSync(getSystemPath(path)));
  //     obs.complete();
  //   });
  // }

  // // Some hosts may not support watching.
  // watch(
  //   path: Path,
  //   _options?: virtualFs.HostWatchOptions,
  // ): Observable<virtualFs.HostWatchEvent> | null {
  //   return new Observable<virtualFs.HostWatchEvent>((obs) => {
  //     loadFSWatcher();
  //     const watcher = new FSWatcher({ persistent: false });
  //     watcher.add(getSystemPath(path));

  //     watcher
  //       .on('change', (path) => {
  //         obs.next({
  //           path: normalize(path),
  //           time: new Date(),
  //           type: virtualFs.HostWatchEventType.Changed,
  //         });
  //       })
  //       .on('add', (path) => {
  //         obs.next({
  //           path: normalize(path),
  //           time: new Date(),
  //           type: virtualFs.HostWatchEventType.Created,
  //         });
  //       })
  //       .on('unlink', (path) => {
  //         obs.next({
  //           path: normalize(path),
  //           time: new Date(),
  //           type: virtualFs.HostWatchEventType.Deleted,
  //         });
  //       });

  //     return () => {
  //       void watcher.close();
  //     };
  //   }).pipe(publish(), refCount());
  // }
}
