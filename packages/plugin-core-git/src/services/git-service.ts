import { ServiceInitialiseOptions } from '@business-as-code/core';
import { BacError, MessageName } from '@business-as-code/error';
// import nodeGit, { Repository } from 'nodegit'
// import simpleGitFactory, {CheckRepoActions as CheckRepoActionsImport, SimpleGit, TaskOptions} from 'simple-git'
import simpleGitFactory, {CheckRepoActions as CheckRepoActionsImport, SimpleGit, TaskOptions} from 'simple-git'
import path from 'path'

declare global {
  namespace Bac {
    interface Services {
      git: {
        insType: GitService;
        clzType: typeof GitService;
      };
    }
  }
  // export interface BacServices {
  //   schematicsService: SchematicsService;
  // }
}


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
  static title = "git";

  public CheckRepoActions = CheckRepoActionsImport
  // options: Options;

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */
  protected repository: SimpleGit | undefined

  static async initialise(options: ServiceInitialiseOptions) {
    const ins = new GitService(options);

    const baseDir = GitService.getWorkingDestinationPath(options)
    const simpleGit = simpleGitFactory({baseDir});

    // ins.repository = simpleGit
    if (await simpleGit.checkIsRepo(CheckRepoActionsImport.IS_REPO_ROOT)) {
      ins.repository = simpleGit
    }
    else {
      // options.context.logger(`GitService: no existing repo found at location '${options.destinationPath.original}'`)
    }

    return ins

    // // }
    // try {
    //   ins.repository = await nodeGit.Repository.open(options.destinationPath.original)
    // }
    // catch (err) {
    // }

    // return ins;
  }

  constructor(protected options: ServiceInitialiseOptions) {
    // this.options = options;
  }

  protected static getWorkingDestinationPath(options: ServiceInitialiseOptions): string {
    return path.join(options.destinationPath.original, options.workingPath ?? '.')
  }

  getRepository(strict: false): undefined | SimpleGit
  getRepository(strict?: true): SimpleGit
  getRepository(strict = true): SimpleGit | undefined {
    if (!this.repository) {
      if (!strict) {
        return
      }
      throw new BacError(MessageName.GIT_SERVICE_REPOSITORY_UNINITIALISED, `Attempting an operation without a current initialised repository`)
    }

    return simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options)});
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
   simpleGit example - https://tinyurl.com/25o9sjbz
   nodeGit example - https://tinyurl.com/23cn82ao
   */
  async clone(url: string, options?: TaskOptions): Promise<this> {
    const simpleGit = simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options)});
    await simpleGit.clone(
      url,
      this.options.destinationPath.original,
      options,
    )
    // @todo - error handling
    this.repository = simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options)});
    return this
  }

  async init(options?: TaskOptions): Promise<this> {
    // const repository = await nodeGit.Repository.init(
    //   this.options.destinationPath.original,
    //   Number(options?.bare ?? false),
    // )
    // // @todo - error handling
    // this.repository = repository
// console.log(`GitService.getWorkingDestinationPath(this.options) :>> `, GitService.getWorkingDestinationPath(this.options))
    const simpleGit = simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options)});
    await simpleGit.init(options ?? {})
    // @todo - error handling
    this.repository = simpleGitFactory({baseDir: GitService.getWorkingDestinationPath(this.options)});
    return this
  }

  getWorkingDestinationPath(): string {
    return GitService.getWorkingDestinationPath(this.options)
  }

  static something() {}
  async somethingelse() {}
}
