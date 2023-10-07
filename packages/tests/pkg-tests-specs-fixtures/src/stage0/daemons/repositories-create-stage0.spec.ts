import { constants, execUtils, expectIsOk } from "@business-as-code/core";
import { createPersistentTestEnv } from "@business-as-code/tests-core";
import {expect, jest, it, describe} from 'bun:test';

/** check the repositories are accessible via the daemon. See repositories-create-stage0.spec for content tests */
describe("repositories-create", () => {
  describe("http", () => {
    it("repositories available via git-http", async () => {
      const persistentTestEnv = await createPersistentTestEnv({testName: 'repositories-create:http:repositories available via git-http'});
      await persistentTestEnv.test({}, async (testContext) => {
        const assertForRepo = async (repo: string) => {
          const service = await testContext.context.serviceFactory("git", {
            context: testContext.context,
            workingPath: ".",
          });

          const gitUrl = `http://localhost:${constants.GIT_HTTP_MOCK_SERVER_PORT}/${repo}`;
          const lsRemoteRes = await service.remoteList(gitUrl);

          expectIsOk(lsRemoteRes);

          expect(lsRemoteRes.res).toMatch("refs/heads/main");
        };

        await assertForRepo("repo1.git"); // only testing the git-server side of things. 1 repo only required
      });
    });
  });
  describe("ssh", () => {
    it("repositories available via git-ssh with private key", async () => {
      const persistentTestEnv = await createPersistentTestEnv({testName: 'repositories-create:ssh:repositories available via git-ssh with private key'});
      await persistentTestEnv.test({}, async (testContext) => {

        const assertForRepo = async (repo: string) => {
          const service = await testContext.context.serviceFactory("git", {
            context: testContext.context,
            workingPath: ".",
          });

          const gitUrl = `ssh://localhost:${constants.GIT_SSH_MOCK_SERVER_PORT}/${repo}`;
          const lsRemoteRes = await execUtils.promiseAwait(
            service.remoteList(gitUrl, {
              sshStrictHostCheckingDisable: true, // actually ignored when sshPrivateKeyPath=true
              sshPrivateKeyPath:
                testContext.testEnvVars.sshPrivateKeyPath.original,
            })
          );

          expectIsOk(lsRemoteRes);

          expect(lsRemoteRes.res).toMatch("refs/heads/main");
        };

        await assertForRepo("repo1.git"); // only testing the git-server side of things. 1 repo only required
      });
    });
    it("repositories not available via git-ssh without private key added", async () => {
      const persistentTestEnv = await createPersistentTestEnv({testName: 'repositories-create:ssh:repositories not available via git-ssh without private key added'});
      await persistentTestEnv.test({}, async (testContext) => {

        const assertForRepo = async (repo: string) => {
          const service = await testContext.context.serviceFactory("git", {
            context: testContext.context,
            workingPath: ".",
          });

          const gitUrl = `ssh://localhost:${constants.GIT_SSH_MOCK_SERVER_PORT}/${repo}`;

          await expect(() =>
                  execUtils.promiseAwait(
                    service.remoteList(gitUrl, {
                      sshStrictHostCheckingDisable: true,
                      // sshPrivateKeyPath: testContext.testEnvVars.sshPrivateKeyPath.original, // should trigger an error
                    })
                  )
                ).rejects
        };

        await assertForRepo("repo1.git");
      });
    });
  });
  describe("ssh-anonymous", () => {
    it("repositories available via git-ssh without private key", async () => {
      const persistentTestEnv = await createPersistentTestEnv({testName: 'repositories-create:ssh-anonymous:repositories available via git-ssh without private key'});
      await persistentTestEnv.test({}, async (testContext) => {

        const assertForRepo = async (repo: string) => {
          const service = await testContext.context.serviceFactory("git", {
            context: testContext.context,
            workingPath: ".",
          });

          const gitUrl = `ssh://localhost:${constants.GIT_SSH_ANONYMOUS_MOCK_SERVER_PORT}/${repo}`;
          const lsRemoteRes = await service.remoteList(gitUrl, {
            sshStrictHostCheckingDisable: true,
            sshPrivateKeyPath:
              testContext.testEnvVars.sshPrivateKeyPath.original,
          });

          expectIsOk(lsRemoteRes);
          // console.log(`lsRemoteRes :>> `, lsRemoteRes)
          expect(lsRemoteRes.res).toMatch("refs/heads/main");
        };

        await assertForRepo("repo1.git"); // only testing the git-server side of things. 1 repo only required
      });
    });
  });
});
