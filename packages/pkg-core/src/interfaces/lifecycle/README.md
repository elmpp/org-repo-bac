!! All lifecycles must be added to the `LifecycleMap` type inside `packages/pkg-core/src/__types__/lifecycles.ts`

See the base lifecycle classes for explanation but in summary:

 - initialise: template the raw content
 - configure: adds the config. i.e. for the workspace this is ProjectConfig
 - synchronise: uses the config, expands it and pull content
 - fetch (auxillary): pulls content down locally, with caching + checksumming etc.
 - run: allow execution of commands. Commands must extends BaseRunCommand (i.e. support Moon query syntax)