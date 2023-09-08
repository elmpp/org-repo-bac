import {
  ok,
  Result,
  ServiceInitialiseCommonOptions,
} from "@business-as-code/core";
import { BacError, MessageName } from "@business-as-code/error";
// import nodeGit, { Repository } from 'nodegit'
// import simpleGitFactory, {CheckRepoActions as CheckRepoActionsImport, SimpleGit, TaskOptions} from 'simple-git'
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import simpleGitFactory, {
  CheckRepoActions as CheckRepoActionsImport,
  InitResult,
  TaskOptions as OrigTaskOptions,
  SimpleGit,
} from "simple-git";

declare global {
  namespace Bac {
    interface Services {
      git: {
        insType: GitService;
        staticType: typeof GitService;
      };
    }
  }
  // export interface BacServices {
  //   schematicsService: SchematicsService;
  // }
}

type Options = ServiceInitialiseCommonOptions & {};

type TaskOptions = Record<string, unknown> & {
  sshPrivateKeyPath?: string;
  sshStrictHostCheckingDisable?: boolean;
};

// /**
//  NodeGit GH - https://github.com/nodegit/nodegit
//  NodeGit API Docs - https://www.nodegit.org/api/
//  NodeGit Examples Folder - https://github.com/nodegit/nodegit/tree/master/examples
//  */
/**
 SimpleGit GH - https://github.com/nodegit/nodegit
 SimpleGit API Docs - https://www.simpleGit.org/api/
 SimpleGit Examples Folder - https://github.com/nodegit/nodegit/tree/master/examples
 */
export class GitService {
  static title = "git" as const;
  // title = 'git' as const

  public CheckRepoActions = CheckRepoActionsImport;
  protected options: Options;

  get ctor(): typeof GitService {
    return this.constructor as unknown as typeof GitService;
  }
  get title(): (typeof GitService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof GitService)["title"];
  }

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */
  // protected repository: SimpleGit | undefined

  static async initialise(options: Options) {
    // /** simple-git debugging - https://tinyurl.com/24ea8emz */
    // process.env.DEBUG = logLevelMatching(
    //   "debug",
    //   options.context.cliOptions.flags.logLevel,
    //   options.context.cliOptions.flags.json
    // ) && !process.env.DEBUG?.match('simple-git')
    //   ? (process.env.DEBUG ? `${process.env.DEBUG},simple-git,simple-git:*` : `simple-git,simple-git:*`)
    //   : process.env.DEBUG;

    // console.log(`process.env.DEBUG :>> `, process.env.DEBUG)

    const ins = new GitService(options);
    return ins;
  }
  // static async initialise(options: Options) {
  //   const ins = new GitService(options);

  //   const workspacePathAbsolute = GitService.getWorkingDestinationPath(options)

  //   if (!(await xfs.existsPromise(workspacePathAbsolute.address))) {
  //     options.context.logger.error(`gitService: service initialised on a non-existent path '${workspacePathAbsolute.original}'. Is this really what you desire?`)
  //     return ins
  //   }

  //   const simpleGit = simpleGitFactory({baseDir: workspacePathAbsolute.original});

  //   // ins.repository = simpleGit
  //   if (await simpleGit.checkIsRepo(CheckRepoActionsImport.IS_REPO_ROOT)) {
  //     ins.repository = simpleGit
  //   }
  //   else {
  //     // options.context.logger(`GitService: no existing repo found at location '${options.destinationPath.original}'`)
  //   }

  //   return ins

  //   // // }
  //   // try {
  //   //   ins.repository = await nodeGit.Repository.open(options.destinationPath.original)
  //   // }
  //   // catch (err) {
  //   // }

  //   // return ins;
  // }

  constructor(options: Options) {
    this.options = options;
  }

  protected static getWorkingDestinationPath(
    options: Options
  ): AddressPathAbsolute {
    return addr.pathUtils.join(
      options.workspacePath,
      addr.parsePath(options.workingPath ?? ".")
    ) as AddressPathAbsolute;
  }

  getRepository(strict: false): undefined | SimpleGit;
  getRepository(strict?: true): SimpleGit;
  getRepository(strict = true): SimpleGit | undefined {
    // if (!this.repository) {
    //   if (!strict) {
    //     return
    //   }
    //   throw new BacError(MessageName.GIT_SERVICE_REPOSITORY_UNINITIALISED, `Attempting an operation without a current initialised repository`)
    // }

    const repository = simpleGitFactory({
      baseDir: GitService.getWorkingDestinationPath(this.options).original,
    });

    if (!repository) {
      if (!strict) {
        return;
      }
      throw new BacError(
        MessageName.GIT_SERVICE_REPOSITORY_UNINITIALISED,
        `Attempting an operation without a current initialised repository`
      );
    }
    return repository;
    // return this.repository
  }

  // /**
  //  @internal for use only by git-service-helpers
  //  */
  // public async getNodeGit() {
  //   if (!this.repository) {
  //     throw new BacError(MessageName.GIT_SERVICE_REPOSITORY_UNINITIALISED, `Attempting an operation without a current initialised repository`)
  //   }
  //   return nodeGit
  // }

  /**
   simpleGit example - https://tinyurl.com/2akaywmr
   */
   async revParse(
    args: string,
    options?: TaskOptions
  ): Promise<Result<string, { error: BacError }>> {
    const simpleGit = this.create(options);
    const res = await simpleGit.revparse(
      args,
      options as OrigTaskOptions
    );
    return ok(res);
  }

  /**
   simpleGit example - https://tinyurl.com/25o9sjbz
   */
  async clone(
    url: string,
    options?: TaskOptions
  ): Promise<Result<undefined, { error: BacError }>> {
    const simpleGit = this.create(options);
    await simpleGit.clone(
      url,
      this.options.workspacePath.original,
      options as OrigTaskOptions
    );
    // @todo - error handling
    simpleGitFactory({
      baseDir: GitService.getWorkingDestinationPath(this.options).original,
    });
    return ok(undefined);
  }

  /**
   simpleGit example - https://tinyurl.com/23eteq7t
   */
  async pull(
    url: string,
    options?: TaskOptions
  ): Promise<Result<undefined, { error: BacError }>> {
    const simpleGit = this.create(options);
    await simpleGit.pull(
      url,
      this.options.workspacePath.original,
      options as OrigTaskOptions
    );
    // @todo - error handling
    // simpleGitFactory({
    //   baseDir: GitService.getWorkingDestinationPath(this.options).original,
    // });
    return ok(undefined);
  }

  /**
   simpleGit docs - https://tinyurl.com/25yjs8tx
   simpleGit example - https://tinyurl.com/24e2bgay
   */
  async remoteList(
    url: string,
    options?: TaskOptions
  ): Promise<Result<string, { error: BacError }>> {
    const simpleGit = this.create(options);
    const res = await simpleGit.listRemote([url]);
    // @todo - error handling
    // this.repository = simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options).original});
    return ok(res);
  }

  async init(
    options?: TaskOptions
  ): Promise<Result<InitResult, { error: BacError }>> {
    // const repository = await nodeGit.Repository.init(
    //   this.options.destinationPath.original,
    //   Number(options?.bare ?? false),
    // )
    // // @todo - error handling
    // this.repository = repository
    // console.log(`GitService.getWorkingDestinationPath(this.options) :>> `, GitService.getWorkingDestinationPath(this.options))
    const simpleGit = this.create(options);
    const res = await simpleGit.init((options ?? {}) as OrigTaskOptions);
    // @todo - error handling
    simpleGitFactory({
      baseDir: GitService.getWorkingDestinationPath(this.options).original,
    });
    return ok(res);
  }

  protected create(options: TaskOptions = {}) {
    const ins = simpleGitFactory({
      baseDir: GitService.getWorkingDestinationPath(this.options).original,
    });
    /**
     * ssh key authentication:
     *  - simpleGit example: https://tinyurl.com/2aaqyxnk
     *  - simpleGit auth docs: https://tinyurl.com/25lb83xa
     */
    if (options.sshPrivateKeyPath) {
      const GIT_SSH_COMMAND = `ssh -i ${options.sshPrivateKeyPath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`;

      ins.env({ GIT_SSH_COMMAND });
      this.options.context.logger.debug(
        `gitService: sshPrivateKey requested for instance. GIT_SSH_COMMAND: '${GIT_SSH_COMMAND}'`
      );
    } else if (options.sshStrictHostCheckingDisable) {
      const GIT_SSH_COMMAND = `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`;

      ins.env({ GIT_SSH_COMMAND });
      this.options.context.logger.debug(
        `gitService: sshPrivateKey requested for instance. GIT_SSH_COMMAND: '${GIT_SSH_COMMAND}'`
      );
    }
    return ins;
  }

  getWorkingDestinationPath(): AddressPathAbsolute {
    return GitService.getWorkingDestinationPath(this.options);
  }
}
