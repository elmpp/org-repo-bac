
integration tests grouped by stage
 - stage0 - only stage that creates content that may be copied from
 - stage1 - ensures test-env is running ok + complex validation on the stage0 content
 <!-- - stage2 - tests that use this cli checkout (i.e. `pnpm link`)
 - stage3 - tests that use cli from local registry -->
