import { addr } from "@business-as-code/address";
import { UnwrapPromise } from "@business-as-code/core";
import { xfs } from "@business-as-code/fslib";
import { TestContext } from "@business-as-code/tests-core";

export async function config(
  testContext: TestContext,
  res: UnwrapPromise<ReturnType<TestContext["command"]>>,
  configFilename: string
) {
  const expectConfig = res.res.expectUtil.createConfig();

  const cliCheckoutPath = addr.packageUtils.resolve({
    address: addr.parsePackage(`@business-as-code/cli`),
    projectCwd: testContext.testEnvVars.checkoutPath,
    strict: true,
  });

  const configPath = addr.packageUtils.resolve({
    address: addr.parsePackage(
      `@business-as-code/core/src/etc/config/${configFilename}`
    ),
    projectCwd: cliCheckoutPath,
    strict: true,
  });

  await expectConfig.isValid();
  expectConfig.expectText.equals(xfs.readFileSync(configPath.address, "utf8"));
}

export async function commonFiles(
  testContext: TestContext,
  res: UnwrapPromise<ReturnType<TestContext["command"]>>
) {
  const expectFs = res.res.expectUtil.createFs();
  const expectConfig = res.res.expectUtil.createConfig();

  await expectConfig.isValid();

  res.res.expectUtil
    .createText(expectFs.readText("./BOLLOCKS.md"))
    .lineContainsString({ match: `PANTS`, occurrences: 1 }); // coming from second schematic synchronise-workspace
  res.res.expectUtil
    .createText(expectFs.readText("./package.json"))
    .lineContainsString({
      match: `"name": "my-new-workspace"`,
      occurrences: 1,
    })
    .lineContainsString({ match: `"private": true`, occurrences: 1 });
}
