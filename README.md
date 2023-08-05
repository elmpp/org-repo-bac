
## Generator command
# # --type "application" | "library"  | "tool" | "unknown" ; --type_variant "plugin" | 'plugin-core' | 'library' | 'entrypoint'
 - p moon g package ./packages/pkg-cli --defaults -- --type 'application' --type_variant 'entrypoint' --name '@business-as-code/cli' # entrypoint application
 - p moon g package ./packages/pkg-core --defaults -- --type 'library' --type_variant 'library' --name '@business-as-code/core' # core package (not plugin)
 - p moon g package ./packages/plugin-myplugin --defaults -- --type 'library' --type_variant 'plugin' --name '@business-as-code/plugin-myplugin' # normal plugin
 - p moon g package ./packages/plugin-core-essentials --defaults -- --type 'library' --type_variant 'plugin-core' --name '@business-as-code/plugin-core-myplugin' # core plugin
 - p moon g package ./packages/plugin-dev-myplugin --defaults -- --type 'library' --type_variant 'plugin-dev' --name '@business-as-code/plugin-dev-myplugin' # private plugin loaded as dev dependency, not published

 - p multi ls # list all workspaces + deps // list all projects, using pnpm
 - p moon project-graph

 <!-- - run verdaccio: p moon run root:verdaccioKillBackground; p moon run root:verdaccioRunBackground -->
 <!-- - run verdaccio: p moon run @business-as-code/plugin-dev-essentials:verdaccioRunBackground -->
 - run verdaccio: pnpm run --filter @business-as-code/tests-verdaccio verdaccio:stopBackground && pnpm run --filter @business-as-code/tests-verdaccio verdaccio:runBackground

 - p dev:runCli bac-tests repositories-create --workspacePath ./packages/tests/pkg-tests-specs-fixtures/repositories // create repositories

 - p moon run root:publishDev // -> when failing: p moon run root:buildWatch // -> when unauthenticated: (cd packages/tests/pkg-tests-verdaccio && p run verdaccio:login)

 - pnpm ls -r --depth 1; pnpm view @business-as-code/cli --registry http://localhost:4873/; pnpm view @business-as-code/cli@bollards --registry http://localhost:4873/
 - p moon query projects 'projectType=application || projectType=library' # snapshottable projects

 PUBLISHING SNAPSHOT LOCAL
  - p dev:runCli release snapshot --message 'this is a snapshot release' --workspacePath /Users/matt/dev/org-repo-moonrepo --logLevel debug // 🌈

Oclif commands

 - p dev:runCli plugins --core  // show all packages
 - p dev:runCli  // show all commands

## Test commands

 Run tests by stage
   - p dev:runCli test test --cliSource cliLinked --stage stage2 --testFileMatch initialise-workspace --workspacePath /Users/matt/dev/org-repo-moonrepo --logLevel debug
   - p dev:runCliWatch test test --cliSource cliLinked --stage stage2 --testFileMatch initialise-workspace --workspacePath /Users/matt/dev/org-repo-moonrepo --logLevel debug // WATCH MODE

## Build commands

 <!-- - p moon run @business-as-code/plugin-dev-essentials:changesetSnapshotPublishLocal # local snapshot build -> when it doesn't build -> p moon -->

 - p moon run root:build -> not building: p tsc --build

## Bookmarks

  ### Angular

   - template source code tests - https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/src/rules/template_spec.ts#L140


## Tasks

*General*
- [x] Set up repo with Moon
- [x] Set up conventional commits !!!

*Types*
Create a schema for the config files. It should be driven by a typescript interface and be exportable to yaml - [Zod](https://tinyurl.com/2f9exqpd),
- [ ] Projects should be defined
  - [ ] projects have a type (app, library, api, documentation). projects have a language
  - [ ] projects can define their dependencies
  - [ ] Per-project config should be settable at within the repo itself/main config
  - [ ] Script to recreate the schema.json/Zod validation files
- [ ] Users and teams can be optionally populated via ldap

*Monorepo creation*
- [ ] Using the config file, create subtrees
  - [ ] Separate sync command to sync from remote (should have an active key)


*DB Ingestion*
- [ ] Create a set of tasks within /cli. This will be the cli api that is ran by moon to update the [nedb](https://tinyurl.com/2fenevs5) database
  - [ ] dep graph
  - [ ] projects (with language)
  - [ ] teams+users
  - [ ] commits
  - [ ] releases
  - [ ] sprint cadence
  - [ ] PRs
  - [ ] Rollbacks

*UI*
- [ ] Create a NextJS Tailwind Admin panel using mongodb queries. Template/demo - https://tinyurl.com/2zrddxj8/ / https://tinyurl.com/2hv8d5f9
  - [ ] dep graph with heat view
  - [ ] team graph with heat view
  - [ ] people graph with heat view
  - [ ] people graph with heat view
  - [ ] PR duration. Compared to sprint length perhaps
  - [ ] detect frameworks across the projects and show the spread of technologies. Highlight different versions etc

*Tests*
- [ ] Local Repos for monorepo creation
  - [ ] Should be able to leverage moon again for scaffolding repo content
- [ ] Need to experiment with which package manager to be used for the inner monorepo



### User Feedback
 - [ ] Need to solicit feedback on what plugins would be useful to a company
   - [ ] Either more business-oriented feedback (see Risks#1) or more god-mode stuff

### Tech Stack
 - cli/plugin management: [oclif](https://github.com/oclif/oclif)
 - plugins: [oclif plugins](https://tinyurl.com/ybnks7qa)
 - generators (yes, required): [yeoman](https://yeoman.io/authoring/integrating-yeoman.html) (it's usage is for simplicity and prompted by this - https://tinyurl.com/2ztjtsbs)

### Tech Notes
 - Need to pin `angular-devkit/core` + `angular-devkit/schematics` to an exact version ('15.2.4') - this is because we import rxjs and use it in /core. It has to match the schematics transitive dep rxjs. GH issue - https://tinyurl.com/2c4ukdle

### Risks
 1. Jira kinda [owns this space already](https://tinyurl.com/2maj9agc). Need to lean into the monorepo tooling perhaps moreso