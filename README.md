
## Generator command
 - p moon g package ./packages/bac-pkg-cli --defaults -- --package_type 'library' --name '@business-as-code/cli'

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

### Risks
 1. Jira kinda [owns this space already](https://tinyurl.com/2maj9agc). Need to lean into the monorepo tooling perhaps moreso