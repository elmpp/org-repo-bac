
integration tests grouped by stage
 - stage0 - tests that do not create nor depend on scaffolded content. Use this for standard tests (that use test-env)

 - stage1 - only stage that creates content that may be copied from
 - stage2 - ensures test-env is running ok + complex validation on the stage1 content
 <!-- - stage2 - tests that use this cli checkout (i.e. `pnpm link`)
 - stage3 - tests that use cli from local registry -->
