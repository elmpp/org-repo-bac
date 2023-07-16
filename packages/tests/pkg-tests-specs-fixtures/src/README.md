
integration tests grouped by stage
 - stage0 - ensures test-env is running ok
 - stage1 - only stage that creates content that may be copied from
 - stage2 - tests that use this cli checkout (i.e. `pnpm link`)
 - stage3 - tests that use cli from local registry
