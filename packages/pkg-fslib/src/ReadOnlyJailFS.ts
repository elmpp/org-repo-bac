
import {FakeFS, NodeFS, ProxiedFS, ppath, PortablePath, NativePath}              from '@yarnpkg/fslib';

/** from Yarn - https://tinyurl.com/2foom8w5 */
// const SYNC_IMPLEMENTATIONS = [
//   `accessSync`,
//   `appendFileSync`,
//   `createReadStream`,
//   `createWriteStream`,
//   `chmodSync`,
//   `fchmodSync`,
//   `chownSync`,
//   `fchownSync`,
//   `closeSync`,
//   `copyFileSync`,
//   `linkSync`,
//   `lstatSync`,
//   `fstatSync`,
//   `lutimesSync`,
//   `mkdirSync`,
//   `openSync`,
//   `opendirSync`,
//   `readlinkSync`,
//   `readFileSync`,
//   `readdirSync`,
//   `readlinkSync`,
//   `realpathSync`,
//   `renameSync`,
//   `rmdirSync`,
//   `statSync`,
//   `symlinkSync`,
//   `truncateSync`,
//   `ftruncateSync`,
//   `unlinkSync`,
//   `unwatchFile`,
//   `utimesSync`,
//   `watch`,
//   `watchFile`,
//   `writeFileSync`,
//   `writeSync`,
// ] as const;

const READONLY_SYNC_IMPLEMENTATIONS = ([
  `readFileSync`,
  `readdirSync`,
  `readlinkSync`,
] as const)

/** from Yarn - https://tinyurl.com/2foom8w5 */
// const ASYNC_IMPLEMENTATIONS = [
//   `accessPromise`,
//   `appendFilePromise`,
//   `fchmodPromise`,
//   `chmodPromise`,
//   `fchownPromise`,
//   `chownPromise`,
//   `closePromise`,
//   `copyFilePromise`,
//   `linkPromise`,
//   `fstatPromise`,
//   `lstatPromise`,
//   `lutimesPromise`,
//   `mkdirPromise`,
//   `openPromise`,
//   `opendirPromise`,
//   `readdirPromise`,
//   `realpathPromise`,
//   `readFilePromise`,
//   `readdirPromise`,
//   `readlinkPromise`,
//   `renamePromise`,
//   `rmdirPromise`,
//   `statPromise`,
//   `symlinkPromise`,
//   `truncatePromise`,
//   `ftruncatePromise`,
//   `unlinkPromise`,
//   `utimesPromise`,
//   `writeFilePromise`,
//   `writeSync`,
// ] as const;

const READONLY_ASYNC_IMPLEMENTATIONS = ([
  `readFilePromise`,
  `readdirPromise`,
  `readlinkPromise`,
] as const)

const READONLY_IMPLEMENTATIONS = [...READONLY_SYNC_IMPLEMENTATIONS, ...READONLY_ASYNC_IMPLEMENTATIONS]


export type JailFSOptions = {
  baseFs?: FakeFS<PortablePath>;
};

const JAIL_ROOT = PortablePath.root;

export class ReadOnlyJailFS extends ProxiedFS<PortablePath, PortablePath> {
  private readonly target: PortablePath;

  protected readonly baseFs: FakeFS<PortablePath>;

  constructor(target: PortablePath, {baseFs = new NodeFS()}: JailFSOptions = {}) {
    super(ppath);

    this.target = this.pathUtils.resolve(PortablePath.root, target);

    this.baseFs = baseFs;

    return new Proxy(this, {
      get(target, prop: unknown, receiver) {
        const value = target[prop as keyof typeof target];
        if (value instanceof Function) {
          return function (...args: unknown[]) {
            if (READONLY_IMPLEMENTATIONS.includes(prop as any)) {
              throw new Error(`You have used a non-permitted FS api method. Only the following may be used: '${READONLY_IMPLEMENTATIONS.join(', ')}'`)
            }
            return value.apply(this === receiver ? target : this, args);
          };
        }
        return value;
      },
    })
  }

  getRealPath() {
    return this.pathUtils.resolve(this.baseFs.getRealPath(), this.pathUtils.relative(PortablePath.root, this.target));
  }

  getTarget() {
    return this.target;
  }

  getBaseFs() {
    return this.baseFs;
  }

  protected mapToBase(p: PortablePath): PortablePath {
    const normalized = this.pathUtils.normalize(p);

    if (this.pathUtils.isAbsolute(p))
      return this.pathUtils.resolve(this.target, this.pathUtils.relative(JAIL_ROOT, p));

    if (normalized.match(/^\.\.\/?/))
      throw new Error(`Resolving this path (${p}) would escape the jail`);

    return this.pathUtils.resolve(this.target, p);
  }

  protected mapFromBase(p: PortablePath): PortablePath {
    return this.pathUtils.resolve(JAIL_ROOT, this.pathUtils.relative(this.target, p));
  }
}

export type ReadOnlyJailFSInstance = {
  readFileSync: FakeFS<NativePath>['readFileSync'],
  readdirSync: FakeFS<NativePath>['readdirSync'],
  readlinkSync: FakeFS<NativePath>['readlinkSync'],
  readFilePromise: FakeFS<NativePath>['readFilePromise'],
  readdirPromise: FakeFS<NativePath>['readdirPromise'],
  readlinkPromise: FakeFS<NativePath>['readlinkPromise'],
}
