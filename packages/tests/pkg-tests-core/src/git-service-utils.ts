/** util tasks to help with the huuuuuge api surface area of nodeGit */

import { Services } from "@business-as-code/core";

export async function addAllCommit(service: Services['git']): Promise<> {

  await service.init({ bare: false });
  const repo = await service.getRepository()
  const nodeGit = await service.getNodeGit()

  const index = await repo.refreshIndex()
  await index.addAll()
  await index.write()

  const oid = await index.writeTree();

  const parent = await repo.getHeadCommit();
  const author = nodeGit.Signature.now("Scott Chacon",
    "schacon@gmail.com");
  const committer = nodeGit.Signature.now("Scott A Chacon",
    "scott@github.com");

  const commitId = await repo.createCommit("HEAD", author, committer, "message", oid, [parent]);

}