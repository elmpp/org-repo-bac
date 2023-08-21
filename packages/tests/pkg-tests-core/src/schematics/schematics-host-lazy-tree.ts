import { virtualFs } from "@angular-devkit/core";
import { FileEntry, HostTree } from "@angular-devkit/schematics";
import { concat as concatObservables, from as observableFrom } from "rxjs";
import { LazyFileEntry, SimpleFileEntry } from "@angular-devkit/schematics/src/tree/entry";
import { first } from "rxjs/operators";

export class HostCreateLazyTree extends HostTree {
  constructor(protected host: virtualFs.Host) {
    super();

    // @ts-ignore
    this._record = new virtualFs.CordHost(new virtualFs.SafeReadonlyHost(host));
    // this._record = new virtualFs.SafeReadonlyHost(host);
    // @ts-ignore
    // this._recordSync = new virtualFs.SyncDelegateHost(host);
    this._recordSync = new virtualFs.SyncDelegateHost(this._record)

    // const tempHost = new HostTree(host);
    // tempHost.visit((path) => {
    //     const content = tempHost.read(path);
    //     if (content) {
    //         this.create(path, content);
    //     }
    // });
  }

  override get(path: string): FileEntry {
    // console.log(`path get :>> `, path);
    const p = this._normalizePath(path);
    // @ts-ignore
    // if (this.host.isDirectory(p)) {
    // // if (this._recordSync.isDirectory(p)) {
    //   throw new PathIsDirectoryException(p);
    // }

    // use this.host for checking as we've skipped upfront loading
    // const exists = await this.host.exists(p).pipe(first()).toPromise()
    // const exists = this._recordSync.exists(p)
    // if (exists) {
    //   // console.log(`:>> path not found ${p}`);
    //   return null;
    // }

    // return new SimpleFileEntry(p, Buffer.from(this._recordSync.read(p)));
    return new LazyFileEntry(p, () => this._recordSync.exists(p) ? Buffer.from(this._recordSync.read(p)) : null);
  }
  // override readText(path: string): string {
  //   console.log(`path readText :>> `, path)
  //   const data = this.read(path);
  //   if (data === null) {
  //     throw new FileDoesNotExistException(path);
  //   }

  //   const decoder = new TextDecoder('utf-8', { fatal: true });

  //   try {
  //     // With the `fatal` option enabled, invalid data will throw a TypeError
  //     return decoder.decode(data);
  //   } catch (e) {
  //     if (e instanceof TypeError) {
  //       throw new Error(`Failed to decode "${path}" as UTF-8 text.`);
  //     }
  //     throw e;
  //   }
  // }
  // override read(path: string): Buffer | null {
  //   console.log(`path read :>> `, path)
  //   const entry = this.get(path);

  //   return entry ? entry.content : null;
  // }

  // override visit() {

  // }
}
