// import { createMockContext } from '@monotonous/tests-core'
import { URL, URLSearchParams } from "url";
import {
  Address,
  assertIsAddressPackage,
  assertIsAddressPath,
  assertIsAddressUrl,
} from "../address";
import { AddressDescriptor, AddressHandler, AddressType } from "../__types__";

// import {createMockContext} from '@monotonous/tests-core'
import { PortablePath } from "@business-as-code/fslib";
// import { constants } from "@business-as-code/core";

type TestMapEntry<AddName extends keyof AddressType> =
  AddressDescriptor<AddName> & {
    arch: NodeJS.Platform;
    pathType?: "portable" | "native";
    normalize?: boolean;
    // matchAddress?: string
  };

export type UnwrapPromise<T> = T extends PromiseLike<infer U>
  ? UnwrapPromise<U>
  : T;

// export const buildRecipe = <FSName extends Mnt.MapUtil.StackKeys>(recipe: RecipeStateInputScalar<FSName>): RecipeStateInput<FSName> => {
//   return recipe
// }

declare module "../__types__" {
  interface AddressType {
    // schemedUrl: {
    //   scheme: string,
    // }
    bespokeUrl: [
      {
        bespokePartProp: string;
        url: URL;
      },
      "url",
      string
    ];
  }
}
const bespokeHandler: AddressHandler<"bespokeUrl"> = {
  name: "bespokeUrl",
  group: "url",
  parse({ address }) {
    try {
      const url = new URL(address);
      return {
        address: address,
        addressNormalized: address,
        original: address,
        originalNormalized: address,
        parts: {
          bespokePartProp: "whatever",
          url,
        },
        type: "bespokeUrl",
      };
    } catch {}
  },
  format({ address }) {
    return "FORMATTED";
  },
};

const buildEntry = <AddName extends keyof AddressType>(
  entry: TestMapEntry<AddName>
) => entry;
const runEntry = (testEntry: TestMapEntry<keyof AddressType>) => {
  // if (entry.address !== 'root#namespace=/') return

  const addr = Address.initialise({ parseParams: {} });

  const { arch, pathType = "native", ...entry } = testEntry;

  Object.defineProperty(process, `platform`, {
    configurable: true,
    value: arch,
  });

  let parsed: any;
  parsed = addr.parse({
    address: `${entry.group}:${entry.original}` as PortablePath,
    arch,
    pathType,
    options: {},
  });
  expect(parsed).toEqual(entry);

  switch (testEntry.group) {
    case "path":
      expect(assertIsAddressPath(parsed)).toBeTruthy();
      expect(assertIsAddressUrl(parsed)).toBeFalsy();
      expect(assertIsAddressPackage(parsed)).toBeFalsy();
      break;
    case "url":
      expect(assertIsAddressPath(parsed)).toBeFalsy();
      expect(assertIsAddressUrl(parsed)).toBeTruthy();
      expect(assertIsAddressPackage(parsed)).toBeFalsy();
      break;
    case "package":
      expect(assertIsAddressPath(parsed)).toBeFalsy();
      expect(assertIsAddressUrl(parsed)).toBeFalsy();
      expect(assertIsAddressPackage(parsed)).toBeTruthy();
      break;
  }
};

describe("path", () => {
  it("portablePathWindowsAbsolute - C:\\Users\\user\\proj", () => {
    runEntry(
      buildEntry<"portablePathWindowsAbsolute">({
        original: "C:\\Users\\user\\proj",
        originalNormalized: "C:\\Users\\user\\proj" as PortablePath,
        address: "/C:/Users/user/proj" as PortablePath,
        addressNormalized: "/C:/Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsAbsolute",
        parts: { suffix: undefined },
        arch: "win32",
        pathType: "portable",
      })
    );
  });

  it("portablePathWindowsAbsolute - C:\\Users\\user\\proj\\*", () => {
    runEntry(
      buildEntry<"portablePathWindowsAbsolute">({
        original: "C:\\Users\\user\\proj\\*",
        originalNormalized: "C:\\Users\\user\\proj" as PortablePath,
        address: "/C:/Users/user/proj/*" as PortablePath,
        addressNormalized: "/C:/Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsAbsolute",
        parts: { suffix: "/*" },
        arch: "win32",
        pathType: "portable",
      })
    );
  });

  it("portablePathWindowsAbsolute - /C:/Users/user/proj", () => {
    runEntry(
      buildEntry<"portablePathWindowsAbsolute">({
        original: "/C:/Users/user/proj",
        originalNormalized: "/C:/Users/user/proj" as PortablePath,
        address: "/C:/Users/user/proj" as PortablePath,
        addressNormalized: "/C:/Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsAbsolute",
        parts: { suffix: undefined },
        arch: "win32",
        pathType: "native", // triggers addr.parsePath() which does not remove portable posix for prop 'original' (i.e. native path)
      })
    );
  });

  it("portablePathWindowsAbsolute - /C:/Users/user/proj", () => {
    runEntry(
      buildEntry<"portablePathWindowsAbsolute">({
        original: "/C:/Users/user/proj",
        originalNormalized: "/C:/Users/user/proj" as PortablePath,
        address: "/C:/Users/user/proj" as PortablePath,
        addressNormalized: "/C:/Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsAbsolute",
        parts: { suffix: undefined },
        arch: "win32",
      })
    );
  });

  it("portablePathWindowsAbsolute - /C:/Users/user/proj/*", () => {
    runEntry(
      buildEntry<"portablePathWindowsAbsolute">({
        original: "/C:/Users/user/proj/*",
        originalNormalized: "/C:/Users/user/proj" as PortablePath,
        address: "/C:/Users/user/proj/*" as PortablePath,
        addressNormalized: "/C:/Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsAbsolute",
        parts: { suffix: "/*" },
        arch: "win32",
      })
    );
  });

  it("portablePathWindowsAbsolute - /C:/Users/user/proj/", () => {
    runEntry(
      buildEntry<"portablePathWindowsAbsolute">({
        original: "/C:/Users/user/proj/",
        originalNormalized: "/C:/Users/user/proj" as PortablePath,
        address: "/C:/Users/user/proj/" as PortablePath,
        addressNormalized: "/C:/Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsAbsolute",
        parts: { suffix: undefined },
        arch: "win32",
      })
    );
  });

  it("portablePathWindowsRelative - ..\\Users\\user/proj", () => {
    runEntry(
      buildEntry<"portablePathWindowsRelative">({
        original: "..\\Users\\user/proj",
        originalNormalized: "..\\Users\\user\\proj" as PortablePath,
        address: "../Users/user/proj" as PortablePath,
        addressNormalized: "../Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsRelative",
        arch: "win32",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathWindowsRelative - .\\Users\\user/proj", () => {
    runEntry(
      buildEntry<"portablePathWindowsRelative">({
        original: ".\\Users\\user/proj",
        originalNormalized: "Users\\user\\proj" as PortablePath,
        address: "./Users/user/proj" as PortablePath,
        addressNormalized: "Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsRelative",
        arch: "win32",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathWindowsRelative - .\\Users\\user/proj/*", () => {
    runEntry(
      buildEntry<"portablePathWindowsRelative">({
        original: ".\\Users\\user/proj/*",
        originalNormalized: "Users\\user\\proj" as PortablePath,
        address: "./Users/user/proj/*" as PortablePath,
        addressNormalized: "Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsRelative",
        arch: "win32",
        parts: { suffix: "/*" },
      })
    );
  });

  it("portablePathWindowsRelative - .\\Users\\user/proj/", () => {
    runEntry(
      buildEntry<"portablePathWindowsRelative">({
        original: ".\\Users\\user/proj/",
        originalNormalized: "Users\\user\\proj" as PortablePath,
        address: "./Users/user/proj/" as PortablePath,
        addressNormalized: "Users/user/proj" as PortablePath,
        group: "path",
        type: "portablePathWindowsRelative",
        arch: "win32",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathFilename - .ext", () => {
    runEntry(
      buildEntry<"portablePathFilename">({
        original: ".ext",
        originalNormalized: ".ext" as PortablePath,
        address: ".ext" as PortablePath,
        addressNormalized: ".ext" as PortablePath,
        group: "path",
        type: "portablePathFilename",
        arch: "win32",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathFilename - .ext/*", () => {
    runEntry(
      buildEntry<"portablePathFilename">({
        original: ".ext/*",
        originalNormalized: ".ext" as PortablePath,
        address: ".ext/*" as PortablePath,
        addressNormalized: ".ext" as PortablePath,
        group: "path",
        type: "portablePathFilename",
        arch: "win32",
        parts: { suffix: "/*" },
      })
    );
  });

  it("portablePathPosixAbsolute - /Users/repositories/workspace-multiple-commits.git", () => {
    runEntry(
      buildEntry<"portablePathPosixAbsolute">({
        original: "/Users/repositories/workspace-multiple-commits.git",
        originalNormalized:
          "/Users/repositories/workspace-multiple-commits.git" as PortablePath,
        address:
          "/Users/repositories/workspace-multiple-commits.git" as PortablePath,
        addressNormalized:
          "/Users/repositories/workspace-multiple-commits.git" as PortablePath,
        group: "path",
        type: "portablePathPosixAbsolute",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixAbsolute - /Users/repositories/workspace-multiple-commits", () => {
    runEntry(
      buildEntry<"portablePathPosixAbsolute">({
        original: "/Users/repositories/workspace-multiple-commits",
        originalNormalized:
          "/Users/repositories/workspace-multiple-commits" as PortablePath,
        address:
          "/Users/repositories/workspace-multiple-commits" as PortablePath,
        addressNormalized:
          "/Users/repositories/workspace-multiple-commits" as PortablePath,
        group: "path",
        type: "portablePathPosixAbsolute",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixAbsolute - /Users/repositories/.workspace-multiple-commits", () => {
    runEntry(
      buildEntry<"portablePathPosixAbsolute">({
        original: "/Users/repositories/.workspace-multiple-commits",
        originalNormalized:
          "/Users/repositories/.workspace-multiple-commits" as PortablePath,
        address:
          "/Users/repositories/.workspace-multiple-commits" as PortablePath,
        addressNormalized:
          "/Users/repositories/.workspace-multiple-commits" as PortablePath,
        group: "path",
        type: "portablePathPosixAbsolute",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixAbsolute - /Users/repositories/workspace-multiple-commits.git/*", () => {
    runEntry(
      buildEntry<"portablePathPosixAbsolute">({
        original: "/Users/repositories/workspace-multiple-commits.git/*",
        originalNormalized:
          "/Users/repositories/workspace-multiple-commits.git" as PortablePath,
        address:
          "/Users/repositories/workspace-multiple-commits.git/*" as PortablePath,
        addressNormalized:
          "/Users/repositories/workspace-multiple-commits.git" as PortablePath,
        group: "path",
        type: "portablePathPosixAbsolute",
        arch: "darwin",
        parts: { suffix: "/*" },
      })
    );
  });

  it("portablePathPosixRelative - ./workspace-multiple-commits", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: "./workspace-multiple-commits",
        originalNormalized: "workspace-multiple-commits" as PortablePath,
        address: "./workspace-multiple-commits" as PortablePath,
        addressNormalized: "workspace-multiple-commits" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - ../.workspace-multiple-commits", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: "../.workspace-multiple-commits",
        originalNormalized: "../.workspace-multiple-commits" as PortablePath,
        address: "../.workspace-multiple-commits" as PortablePath,
        addressNormalized: "../.workspace-multiple-commits" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - packages/new-package", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: "packages/new-package",
        originalNormalized: "packages/new-package" as PortablePath,
        address: "packages/new-package" as PortablePath,
        addressNormalized: "packages/new-package" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - ../packages/new-package", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: "../packages/new-package",
        originalNormalized: "../packages/new-package" as PortablePath,
        address: "../packages/new-package" as PortablePath,
        addressNormalized: "../packages/new-package" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - ./packages/new-package", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: "./packages/new-package",
        originalNormalized: "packages/new-package" as PortablePath,
        address: "./packages/new-package" as PortablePath,
        addressNormalized: "packages/new-package" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - ../../packages/new-package", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: "../../packages/new-package",
        originalNormalized: "../../packages/new-package" as PortablePath,
        address: "../../packages/new-package" as PortablePath,
        addressNormalized: "../../packages/new-package" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - .././packages/new-package", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: ".././packages/new-package",
        originalNormalized: "../packages/new-package" as PortablePath,
        address: ".././packages/new-package" as PortablePath,
        addressNormalized: "../packages/new-package" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - .././packages/new-package/", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: ".././packages/new-package/",
        originalNormalized: "../packages/new-package/" as PortablePath,
        address: ".././packages/new-package/" as PortablePath,
        addressNormalized: "../packages/new-package/" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - .././packages/new-package/another/", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: ".././packages/new-package/another/",
        originalNormalized: "../packages/new-package/another/" as PortablePath,
        address: ".././packages/new-package/another/" as PortablePath,
        addressNormalized: "../packages/new-package/another/" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - packages/new-package/another/", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: "packages/new-package/another/",
        originalNormalized: "packages/new-package/another/" as PortablePath,
        address: "packages/new-package/another/" as PortablePath,
        addressNormalized: "packages/new-package/another/" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - packages/new-package/another", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: "packages/new-package/another",
        originalNormalized: "packages/new-package/another" as PortablePath,
        address: "packages/new-package/another" as PortablePath,
        addressNormalized: "packages/new-package/another" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original:
          "../../Users/matt/dev/org-repo/.yarn/__virtual__/@monotonous-mnt-plugin-essentials-virtual-9720553b9b/1/orgs/monotonous/packages/mnt-plugin-essentials/src/index.ts",
        originalNormalized:
          "../../Users/matt/dev/org-repo/.yarn/__virtual__/@monotonous-mnt-plugin-essentials-virtual-9720553b9b/1/orgs/monotonous/packages/mnt-plugin-essentials/src/index.ts" as PortablePath,
        address:
          "../../Users/matt/dev/org-repo/.yarn/__virtual__/@monotonous-mnt-plugin-essentials-virtual-9720553b9b/1/orgs/monotonous/packages/mnt-plugin-essentials/src/index.ts" as PortablePath,
        addressNormalized:
          "../../Users/matt/dev/org-repo/.yarn/__virtual__/@monotonous-mnt-plugin-essentials-virtual-9720553b9b/1/orgs/monotonous/packages/mnt-plugin-essentials/src/index.ts" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: undefined },
      })
    );
  });

  it("portablePathPosixRelative - packages/new-package/another/*", () => {
    runEntry(
      buildEntry<"portablePathPosixRelative">({
        original: "packages/new-package/another/*",
        originalNormalized: "packages/new-package/another" as PortablePath,
        address: "packages/new-package/another/*" as PortablePath,
        addressNormalized: "packages/new-package/another" as PortablePath,
        group: "path",
        type: "portablePathPosixRelative",
        arch: "darwin",
        parts: { suffix: "/*" },
      })
    );
  });

  it("portablePathFilename - .workspace-multiple-commits", () => {
    runEntry(
      buildEntry<"portablePathFilename">({
        original: ".workspace-multiple-commits",
        originalNormalized: ".workspace-multiple-commits" as PortablePath,
        address: ".workspace-multiple-commits" as PortablePath,
        addressNormalized: ".workspace-multiple-commits" as PortablePath,
        group: "path",
        type: "portablePathFilename",
        arch: "darwin",
        parts: {},
      })
    );
  });

  it("portablePathFilename - workspace-multiple-commits", () => {
    runEntry(
      buildEntry<"portablePathFilename">({
        original: "workspace-multiple-commits",
        originalNormalized: "workspace-multiple-commits" as PortablePath,
        address: "workspace-multiple-commits" as PortablePath,
        addressNormalized: "workspace-multiple-commits" as PortablePath,
        group: "path",
        type: "portablePathFilename",
        arch: "darwin",
        parts: {},
      })
    );
  });

  it("portablePathFilename - workspace-multiple-commits.git", () => {
    runEntry(
      buildEntry<"portablePathFilename">({
        original: "workspace-multiple-commits.git",
        originalNormalized: "workspace-multiple-commits.git" as PortablePath,
        address: "workspace-multiple-commits.git" as PortablePath,
        addressNormalized: "workspace-multiple-commits.git" as PortablePath,
        group: "path",
        type: "portablePathFilename",
        arch: "darwin",
        parts: {},
      })
    );
  });

  it("cacheOther - cache:aNamespace/aKey", () => {
    runEntry(
      buildEntry<"cacheOther">({
        original: "cache:aNamespace/aKey",
        originalNormalized: "cache:aNamespace/aKey" as PortablePath,
        address: "cache:aNamespace/aKey" as PortablePath,
        addressNormalized: "cache:aNamespace/aKey" as PortablePath,
        group: "other",
        type: "cacheOther",
        arch: "darwin",
        parts: {
          namespace: 'aNamespace',
          key: 'aKey',
        },
      })
    );
  });
  it("cacheOther - cache:aNamespace/aKey#checksum=blah", () => {
    runEntry(
      buildEntry<"cacheOther">({
        original: "cache:aNamespace/aKey#checksum=blah",
        originalNormalized: "cache:aNamespace/aKey#checksum=blah" as PortablePath,
        address: "cache:aNamespace/aKey#checksum=blah" as PortablePath,
        addressNormalized: "cache:aNamespace/aKey#checksum=blah" as PortablePath,
        group: "other",
        type: "cacheOther",
        arch: "darwin",
        parts: {
          namespace: 'aNamespace',
          key: 'aKey',
          params: new URLSearchParams({
            checksum: "blah",
          }),
          paramsSorted: new URLSearchParams({
            checksum: "blah",
          }),
        },
      })
    );
  });
});

describe("url", () => {
  it("githubRepoUrl - https://github.com/elmpp/org-repo.git#head=master", () => {
    runEntry(
      buildEntry<"githubRepoUrl">({
        original: "https://github.com/elmpp/org-repo.git#head=master",
        originalNormalized: "https://github.com/elmpp/org-repo.git#head=master",
        address: "https://github.com/elmpp/org-repo.git#head=master",
        addressNormalized: "https://github.com/elmpp/org-repo.git#head=master",
        group: "url",
        type: "githubRepoUrl",
        parts: {
          user: "elmpp",
          org: "org-repo",
          url: new URL("https://github.com/elmpp/org-repo.git#head=master"),
          params: new URLSearchParams({
            head: "master",
          }),
          paramsSorted: new URLSearchParams({
            head: "master",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("githubRepoUrl - https://github.com/elmpp/org-repo.git#head=develop", () => {
    runEntry(
      buildEntry<"githubRepoUrl">({
        original: "https://github.com/elmpp/org-repo.git#head=develop",
        originalNormalized:
          "https://github.com/elmpp/org-repo.git#head=develop",
        address: "https://github.com/elmpp/org-repo.git#head=develop",
        addressNormalized: "https://github.com/elmpp/org-repo.git#head=develop",
        group: "url",
        type: "githubRepoUrl",
        parts: {
          user: "elmpp",
          org: "org-repo",
          url: new URL("https://github.com/elmpp/org-repo.git#head=develop"),
          params: new URLSearchParams({
            head: "develop",
          }),
          paramsSorted: new URLSearchParams({
            head: "develop",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("githubRepoUrl - https://github.com/elmpp/org-repo.git#commit=21c39617a9", () => {
    runEntry(
      buildEntry<"githubRepoUrl">({
        original: "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        originalNormalized:
          "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        address: "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        addressNormalized:
          "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        group: "url",
        type: "githubRepoUrl",
        parts: {
          user: "elmpp",
          org: "org-repo",
          url: new URL(
            "https://github.com/elmpp/org-repo.git#commit=21c39617a9"
          ),
          params: new URLSearchParams({
            commit: "21c39617a9",
          }),
          paramsSorted: new URLSearchParams({
            commit: "21c39617a9",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("githubRepoUrl - https://github.com/elmpp/org-repo.git", () => {
    runEntry(
      buildEntry<"githubRepoUrl">({
        original: "https://github.com/elmpp/org-repo.git",
        originalNormalized: "https://github.com/elmpp/org-repo.git",
        address: "https://github.com/elmpp/org-repo.git",
        addressNormalized: "https://github.com/elmpp/org-repo.git",
        group: "url",
        type: "githubRepoUrl",
        parts: {
          user: "elmpp",
          org: "org-repo",
          url: new URL("https://github.com/elmpp/org-repo.git"),
          params: new URLSearchParams({}),
          paramsSorted: new URLSearchParams({}),
        },
        arch: "darwin",
      })
    );
  });

  it("githubRepoUrl - https://github.com/elmpp/org-repo/tarball/master", () => {
    runEntry(
      buildEntry<"githubRepoUrl">({
        original: "https://github.com/elmpp/org-repo/tarball/master",
        originalNormalized: "https://github.com/elmpp/org-repo/tarball/master",
        address: "https://github.com/elmpp/org-repo.git#head=master",
        addressNormalized: "https://github.com/elmpp/org-repo.git#head=master",
        group: "url",
        type: "githubRepoUrl",
        parts: {
          user: "elmpp",
          org: "org-repo",
          url: new URL("https://github.com/elmpp/org-repo.git#head=master"),
          params: new URLSearchParams({
            head: "master",
          }),
          paramsSorted: new URLSearchParams({
            head: "master",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("githubRepoUrl - https://github.com/elmpp/org-repo/tarball/v0.24", () => {
    runEntry(
      buildEntry<"githubRepoUrl">({
        original: "https://github.com/elmpp/org-repo/tarball/v0.24",
        originalNormalized: "https://github.com/elmpp/org-repo/tarball/v0.24",
        address: "https://github.com/elmpp/org-repo.git#tag=v0.24",
        addressNormalized: "https://github.com/elmpp/org-repo.git#tag=v0.24",
        group: "url",
        type: "githubRepoUrl",
        parts: {
          user: "elmpp",
          org: "org-repo",
          url: new URL("https://github.com/elmpp/org-repo.git#tag=v0.24"),
          params: new URLSearchParams({
            tag: "v0.24",
          }),
          paramsSorted: new URLSearchParams({
            tag: "v0.24",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("githubRepoUrl - http://github.com/elmpp/org-repo/tarball/master", () => {
    runEntry(
      buildEntry<"githubRepoUrl">({
        original: "http://github.com/elmpp/org-repo/tarball/master",
        originalNormalized: "http://github.com/elmpp/org-repo/tarball/master",
        address: "https://github.com/elmpp/org-repo.git#head=master",
        addressNormalized: "https://github.com/elmpp/org-repo.git#head=master",
        group: "url",
        type: "githubRepoUrl",
        parts: {
          user: "elmpp",
          org: "org-repo",
          url: new URL("https://github.com/elmpp/org-repo.git#head=master"),
          params: new URLSearchParams({
            head: "master",
          }),
          paramsSorted: new URLSearchParams({
            head: "master",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("githubRepoUrl - git@github.com:elmpp/org-repo.git", () => {
    runEntry(
      buildEntry<"githubRepoUrl">({
        original: "git@github.com:elmpp/org-repo.git",
        originalNormalized: "git@github.com:elmpp/org-repo.git",
        address: "https://github.com/elmpp/org-repo.git",
        addressNormalized: "https://github.com/elmpp/org-repo.git",
        group: "url",
        type: "githubRepoUrl",
        parts: {
          user: "elmpp",
          org: "org-repo",
          url: new URL("https://github.com/elmpp/org-repo.git"),
          params: new URLSearchParams({}),
          paramsSorted: new URLSearchParams({}),
        },
        arch: "darwin",
      })
    );
  });

  it("githubRepoUrl - git@github.com:elmpp/org-repo.git#commit=21c39617a9", () => {
    runEntry(
      buildEntry<"githubRepoUrl">({
        original: "git@github.com:elmpp/org-repo.git#commit=21c39617a9",
        originalNormalized:
          "git@github.com:elmpp/org-repo.git#commit=21c39617a9",
        address: "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        addressNormalized:
          "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        group: "url",
        type: "githubRepoUrl",
        parts: {
          user: "elmpp",
          org: "org-repo",
          url: new URL(
            "https://github.com/elmpp/org-repo.git#commit=21c39617a9"
          ),
          params: new URLSearchParams({
            commit: "21c39617a9",
          }),
          paramsSorted: new URLSearchParams({
            commit: "21c39617a9",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("gitHttpRepoUrl - http://localhost:8174/bare-repo1.git#commit=21c39617a9", () => {
    runEntry(
      buildEntry<"gitHttpRepoUrl">({
        original: "http://localhost:8174/bare-repo1.git#commit=21c39617a9",
        originalNormalized:
          "http://localhost:8174/bare-repo1.git#commit=21c39617a9",
        address: "http://localhost:8174/bare-repo1.git#commit=21c39617a9",
        addressNormalized:
          "http://localhost:8174/bare-repo1.git#commit=21c39617a9",
        group: "url",
        type: "gitHttpRepoUrl",
        parts: {
          scheme: "http",
          host: "localhost",
          port: 8174,
          repo: "bare-repo1.git",
          url: new URL(
            "http://localhost:8174/bare-repo1.git#commit=21c39617a9"
          ),
          params: new URLSearchParams({
            commit: "21c39617a9",
          }),
          paramsSorted: new URLSearchParams({
            commit: "21c39617a9",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("gitHttpRepoUrl - http://localhost:8174/bare-repo1.git", () => {
    runEntry(
      buildEntry<"gitHttpRepoUrl">({
        original: "http://localhost:8174/bare-repo1.git",
        originalNormalized: "http://localhost:8174/bare-repo1.git",
        address: "http://localhost:8174/bare-repo1.git",
        addressNormalized: "http://localhost:8174/bare-repo1.git",
        group: "url",
        type: "gitHttpRepoUrl",
        parts: {
          scheme: "http",
          host: "localhost",
          port: 8174,
          repo: "bare-repo1.git",
          url: new URL("http://localhost:8174/bare-repo1.git"),
          params: new URLSearchParams({}),
          paramsSorted: new URLSearchParams({}),
        },
        arch: "darwin",
      })
    );
  });

  it("gitSshRepoUrl (anonymous) - ssh://localhost:2222/bare-repo1.git#commit=21c39617a9", () => {
    runEntry(
      buildEntry<"gitSshRepoUrl">({
        original:
          "ssh://localhost:2222/bare-repo1.git#commit=21c39617a9",
        originalNormalized:
          "ssh://localhost:2222/bare-repo1.git#commit=21c39617a9",
        address:
          "ssh://localhost:2222/bare-repo1.git#commit=21c39617a9",
        addressNormalized:
          "ssh://localhost:2222/bare-repo1.git#commit=21c39617a9",
        group: "url",
        type: "gitSshRepoUrl",
        parts: {
          scheme: "ssh",
          host: "localhost",
          user: undefined,
          port: 2222,
          repo: "bare-repo1.git",
          url: new URL(
            "ssh://localhost:2222/bare-repo1.git#commit=21c39617a9"
          ),
          params: new URLSearchParams({
            commit: "21c39617a9",
          }),
          paramsSorted: new URLSearchParams({
            commit: "21c39617a9",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("gitSshRepoUrl (anonymous) - ssh://localhost:2222/bare-repo1.git", () => {
    runEntry(
      buildEntry<"gitSshRepoUrl">({
        original:
          "ssh://localhost:2222/bare-repo1.git",
        originalNormalized:
          "ssh://localhost:2222/bare-repo1.git",
        address:
          "ssh://localhost:2222/bare-repo1.git",
        addressNormalized:
          "ssh://localhost:2222/bare-repo1.git",
        group: "url",
        type: "gitSshRepoUrl",
        parts: {
          scheme: "ssh",
          host: "localhost",
          user: undefined,
          port: 2222,
          repo: "bare-repo1.git",
          url: new URL(
            "ssh://localhost:2222/bare-repo1.git"
          ),
          params: new URLSearchParams({
          }),
          paramsSorted: new URLSearchParams({
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("gitSshRepoUrl - ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git#commit=21c39617a9", () => {
    runEntry(
      buildEntry<"gitSshRepoUrl">({
        original:
          "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git#commit=21c39617a9",
        originalNormalized:
          "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git#commit=21c39617a9",
        address:
          "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git#commit=21c39617a9",
        addressNormalized:
          "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git#commit=21c39617a9",
        group: "url",
        type: "gitSshRepoUrl",
        parts: {
          scheme: "ssh",
          host: "localhost",
          user: "git-ssh-mock-server",
          port: 2222,
          repo: "bare-repo1.git",
          url: new URL(
            "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git#commit=21c39617a9"
          ),
          params: new URLSearchParams({
            commit: "21c39617a9",
          }),
          paramsSorted: new URLSearchParams({
            commit: "21c39617a9",
          }),
        },
        arch: "darwin",
      })
    );
  });

  it("gitSshRepoUrl - ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git", () => {
    runEntry(
      buildEntry<"gitSshRepoUrl">({
        original: "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git",
        originalNormalized:
          "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git",
        address: "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git",
        addressNormalized:
          "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git",
        group: "url",
        type: "gitSshRepoUrl",
        parts: {
          scheme: "ssh",
          host: "localhost",
          user: "git-ssh-mock-server",
          port: 2222,
          repo: "bare-repo1.git",
          url: new URL(
            "ssh://git-ssh-mock-server@localhost:2222/bare-repo1.git"
          ),
          params: new URLSearchParams({}),
          paramsSorted: new URLSearchParams({}),
        },
        arch: "darwin",
      })
    );
  });

  it("url - http://localhost:8174", () => {
    runEntry(
      buildEntry<"url">({
        original: "http://localhost:8174",
        originalNormalized: "http://localhost:8174/",
        address: "http://localhost:8174",
        addressNormalized: "http://localhost:8174/",
        group: "url",
        type: "url",
        arch: "darwin",
        parts: {
          url: new URL("http://localhost:8174"),
          scheme: "http",
          host: "localhost",
          port: 8174,
        },
      })
    );
  });
  it("url - http://localhost:8174/", () => {
    runEntry(
      buildEntry<"url">({
        original: "http://localhost:8174/",
        originalNormalized: "http://localhost:8174/",
        address: "http://localhost:8174/",
        addressNormalized: "http://localhost:8174/",
        group: "url",
        type: "url",
        arch: "darwin",
        parts: {
          url: new URL("http://localhost:8174"),
          host: "localhost",
          scheme: "http",
          port: 8174,
        },
      })
    );
  });

  // it("url - http://bbc.com/elmpp/org-repo.git", () => {
  //   runEntry(
  //     buildEntry<"url">({
  //       original: "http://bbc.com/elmpp/org-repo.git",
  //       originalNormalized: "http://bbc.com/elmpp/org-repo.git",
  //       address: "http://bbc.com/elmpp/org-repo.git",
  //       addressNormalized: "http://bbc.com/elmpp/org-repo.git",
  //       group: "url",
  //       type: "url",
  //       arch: "darwin",
  //       parts: {
  //         url: new URL("http://bbc.com/elmpp/org-repo.git"),
  //       },
  //     })
  //   );
  // });

  // it("url - http://bbc.com/elmpp/org-repo/tarball", () => {
  //   runEntry(
  //     buildEntry<"url">({
  //       original: "http://bbc.com/elmpp/org-repo/tarball",
  //       originalNormalized: "http://bbc.com/elmpp/org-repo/tarball",
  //       address: "http://bbc.com/elmpp/org-repo/tarball",
  //       addressNormalized: "http://bbc.com/elmpp/org-repo/tarball",
  //       group: "url",
  //       type: "url",
  //       arch: "darwin",
  //       parts: {
  //         url: new URL("http://bbc.com/elmpp/org-repo/tarball"),
  //       },
  //     })
  //   );
  // });
});

describe("package", () => {
  it("paramIdentPackage - @monotonous/mnt-plugin-balls#a=b", () => {
    runEntry(
      buildEntry<"paramIdentPackage">({
        original: "@monotonous/mnt-plugin-balls#a=b",
        originalNormalized: "@monotonous/mnt-plugin-balls#a=b",
        address: "@monotonous/mnt-plugin-balls#a=b",
        addressNormalized: "@monotonous/mnt-plugin-balls#a=b",
        group: "package",
        type: "paramIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "7c14e38ebd7bd83518270d010b1292e8d582bda586c276d5d3109db9a5f33e39dce7c13a98366cb3ad0198111c4e8588de8017df6e3f90884cdd86d3f207b77e",
            scope: "monotonous",
            name: "mnt-plugin-balls",
            identString: "@monotonous/mnt-plugin-balls",
            protocol: "npm",
          },
          params: new URLSearchParams({
            a: "b",
          }),
          paramsSorted: new URLSearchParams({
            a: "b",
          }),
        },
      })
    );
  });
  it("paramIdentPackage - @monotonous/mnt-plugin-balls", () => {
    runEntry(
      buildEntry<"paramIdentPackage">({
        original: "@monotonous/mnt-plugin-balls",
        originalNormalized: "@monotonous/mnt-plugin-balls",
        address: "@monotonous/mnt-plugin-balls",
        addressNormalized: "@monotonous/mnt-plugin-balls",
        group: "package",
        type: "paramIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "7c14e38ebd7bd83518270d010b1292e8d582bda586c276d5d3109db9a5f33e39dce7c13a98366cb3ad0198111c4e8588de8017df6e3f90884cdd86d3f207b77e",
            scope: "monotonous",
            name: "mnt-plugin-balls",
            identString: "@monotonous/mnt-plugin-balls",
            protocol: "npm",
          },
        },
      })
    );
  });
  it("paramIdentPackage - mnt-plugin-balls#a=b", () => {
    runEntry(
      buildEntry<"paramIdentPackage">({
        original: "mnt-plugin-balls#a=b",
        originalNormalized: "mnt-plugin-balls#a=b",
        address: "mnt-plugin-balls#a=b",
        addressNormalized: "mnt-plugin-balls#a=b",
        group: "package",
        type: "paramIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "66e604be9c5e7bef9711ce02495400e6afde1862cb878be9aea80a6ba656d8740201794b93d3583458e0d27ac4b284b1db94c57264919178ecf346e8c90f9c91",
            name: "mnt-plugin-balls",
            identString: "mnt-plugin-balls",
            protocol: "npm",
          },
          params: new URLSearchParams({
            a: "b",
          }),
          paramsSorted: new URLSearchParams({
            a: "b",
          }),
        },
      })
    );
  });
  it("paramIdentPackage - mnt-plugin-balls", () => {
    runEntry(
      buildEntry<"paramIdentPackage">({
        original: "mnt-plugin-balls",
        originalNormalized: "mnt-plugin-balls",
        address: "mnt-plugin-balls",
        addressNormalized: "mnt-plugin-balls",
        group: "package",
        type: "paramIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "66e604be9c5e7bef9711ce02495400e6afde1862cb878be9aea80a6ba656d8740201794b93d3583458e0d27ac4b284b1db94c57264919178ecf346e8c90f9c91",
            name: "mnt-plugin-balls",
            identString: "mnt-plugin-balls",
            protocol: "npm",
          },
        },
      })
    );
  });
  it("paramIdentPackage - balls", () => {
    runEntry(
      buildEntry<"paramIdentPackage">({
        original: "balls",
        originalNormalized: "balls",
        address: "balls",
        addressNormalized: "balls",
        group: "package",
        type: "paramIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            name: "balls",
            identString: "balls",
            protocol: "npm",
          },
        },
      })
    );
  });
  it("paramIdentPackage - balls/subpath", () => {
    runEntry(
      buildEntry<"paramIdentPackage">({
        original: "balls/subpath",
        originalNormalized: "balls/subpath",
        address: "balls/subpath",
        addressNormalized: "balls/subpath",
        group: "package",
        type: "paramIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            name: "balls",
            identString: "balls",
            protocol: "npm",
            subpath: "subpath",
          },
        },
      })
    );
  });
  it("paramIdentPackage - balls/package.json", () => {
    runEntry(
      buildEntry<"paramIdentPackage">({
        original: "balls/package.json",
        originalNormalized: "balls/package.json",
        address: "balls/package.json",
        addressNormalized: "balls/package.json",
        group: "package",
        type: "paramIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            name: "balls",
            identString: "balls",
            protocol: "npm",
            subpath: "package.json",
          },
        },
      })
    );
  });
  it("paramIdentPackage - balls/subdir/package.json", () => {
    runEntry(
      buildEntry<"paramIdentPackage">({
        original: "balls/subdir/package.json",
        originalNormalized: "balls/subdir/package.json",
        address: "balls/subdir/package.json",
        addressNormalized: "balls/subdir/package.json",
        group: "package",
        type: "paramIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            name: "balls",
            identString: "balls",
            protocol: "npm",
            subpath: "subdir/package.json",
          },
        },
      })
    );
  });
  it("paramIdentPackage - balls/subdir/package.json#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramIdentPackage">({
        original: "balls/subdir/package.json#b=b&a=a",
        originalNormalized: "balls/subdir/package.json#a=a&b=b",
        address: "balls/subdir/package.json#a=a&b=b",
        addressNormalized: "balls/subdir/package.json#a=a&b=b",
        group: "package",
        type: "paramIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            name: "balls",
            identString: "balls",
            protocol: "npm",
            subpath: "subdir/package.json",
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramIdentStringifiedPackage - ___balls#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramIdentStringifiedPackage">({
        original: "___balls#b=b&a=a",
        originalNormalized: "balls#a=a&b=b",
        address: "balls#a=a&b=b",
        addressNormalized: "balls#a=a&b=b",
        group: "package",
        type: "paramIdentStringifiedPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            scope: undefined,
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            name: "balls",
            identString: "balls",
            protocol: "npm",
            // subpath: 'subdir/package.json',
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramIdentStringifiedPackage - @org___balls#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramIdentStringifiedPackage">({
        original: "@org___balls#b=b&a=a",
        originalNormalized: "@org/balls#a=a&b=b",
        address: "@org/balls#a=a&b=b",
        addressNormalized: "@org/balls#a=a&b=b",
        group: "package",
        type: "paramIdentStringifiedPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            scope: "org",
            identHash:
              "c4e908e191a712b3b3da9da9f79bff547bc1022c6dfd7715db2df00e203e29c18c47f0f4ea8bbab1b5b35bcc18da139900903e8843144d5875a5593b9c0741c5",
            name: "balls",
            identString: "@org/balls",
            protocol: "npm",
            // subpath: 'subdir/package.json',
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramIdentStringifiedPackage - @or__g___balls#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramIdentStringifiedPackage">({
        original: "@or__g___balls#b=b&a=a",
        originalNormalized: "@or__g/balls#a=a&b=b",
        address: "@or__g/balls#a=a&b=b",
        addressNormalized: "@or__g/balls#a=a&b=b",
        group: "package",
        type: "paramIdentStringifiedPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            scope: "or__g",
            identHash:
              "e0b96ddc15135afa309230ca21dec1a180290fe8f3f86e86f53b7deb3bdf24b095bc285e095fadd6a535c79a265ef382859b5528052fea91e6cd571588b86f55",
            name: "balls",
            identString: "@or__g/balls",
            protocol: "npm",
            // subpath: 'subdir/package.json',
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("scaffoldIdentPackage - root#namespace=/", () => {
    runEntry(
      buildEntry<"scaffoldIdentPackage">({
        original: "root#namespace=/",
        originalNormalized: "root#namespace=%2F",
        address: "root#namespace=/",
        addressNormalized: "root#namespace=%2F",
        group: "package",
        type: "scaffoldIdentPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "8b15a3825a289656c6cc85d269570688a8cd7fb111fb6884c3114eccb4c2a645043b052b63b37ec212f88e63ab9e93dabfedee9eea5c0f2250139009a155606c",
            name: "root",
            identString: "root",
            // protocol: 'npm',
            scope: undefined,
          },
          params: new URLSearchParams({
            namespace: "/",
          }),
          paramsSorted: new URLSearchParams({
            namespace: "/",
          }),
        },
      })
    );
  });
  it("paramDescriptorPackage - balls@v1.0.0#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramDescriptorPackage">({
        original: "balls@v1.0.0#b=b&a=a",
        originalNormalized: "balls@v1.0.0#a=a&b=b",
        address: "balls@v1.0.0#b=b&a=a",
        addressNormalized: "balls@v1.0.0#a=a&b=b",
        group: "package",
        type: "paramDescriptorPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            name: "balls",
            identString: "balls",
            range: "v1.0.0",
            protocol: "npm",
            scope: undefined,
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramDescriptorPackage - balls@1.0.0#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramDescriptorPackage">({
        original: "balls@1.0.0#b=b&a=a",
        originalNormalized: "balls@1.0.0#a=a&b=b",
        address: "balls@1.0.0#b=b&a=a",
        addressNormalized: "balls@1.0.0#a=a&b=b",
        group: "package",
        type: "paramDescriptorPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            name: "balls",
            identString: "balls",
            range: "1.0.0",
            protocol: "npm",
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramDescriptorPackage - balls@>=2#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramDescriptorPackage">({
        original: "balls@>=2#b=b&a=a",
        originalNormalized: "balls@>=2#a=a&b=b",
        address: "balls@>=2#b=b&a=a",
        addressNormalized: "balls@>=2#a=a&b=b",
        group: "package",
        type: "paramDescriptorPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            name: "balls",
            identString: "balls",
            range: ">=2",
            protocol: "npm",
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramDescriptorPackage - @org/balls@v1.0.0#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramDescriptorPackage">({
        original: "@org/balls@v1.0.0#b=b&a=a",
        originalNormalized: "@org/balls@v1.0.0#a=a&b=b",
        address: "@org/balls@v1.0.0#b=b&a=a",
        addressNormalized: "@org/balls@v1.0.0#a=a&b=b",
        group: "package",
        type: "paramDescriptorPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "c4e908e191a712b3b3da9da9f79bff547bc1022c6dfd7715db2df00e203e29c18c47f0f4ea8bbab1b5b35bcc18da139900903e8843144d5875a5593b9c0741c5",
            scope: "org",
            name: "balls",
            identString: "@org/balls",
            range: "v1.0.0",
            protocol: "npm",
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramDescriptorPackage - @org/balls@>=2#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramDescriptorPackage">({
        original: "@org/balls@>=2#b=b&a=a",
        originalNormalized: "@org/balls@>=2#a=a&b=b",
        address: "@org/balls@>=2#b=b&a=a",
        addressNormalized: "@org/balls@>=2#a=a&b=b",
        group: "package",
        type: "paramDescriptorPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "c4e908e191a712b3b3da9da9f79bff547bc1022c6dfd7715db2df00e203e29c18c47f0f4ea8bbab1b5b35bcc18da139900903e8843144d5875a5593b9c0741c5",
            scope: "org",
            name: "balls",
            identString: "@org/balls",
            range: ">=2",
            protocol: "npm",
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramDescriptorStringifiedPackage - @org___balls@>=2#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramDescriptorStringifiedPackage">({
        original: "@org___balls@>=2#b=b&a=a",
        originalNormalized: "@org___balls@>=2#b=b&a=a",
        address: "@org/balls@>=2#b=b&a=a",
        addressNormalized: "@org/balls@>=2#a=a&b=b",
        group: "package",
        type: "paramDescriptorStringifiedPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "c4e908e191a712b3b3da9da9f79bff547bc1022c6dfd7715db2df00e203e29c18c47f0f4ea8bbab1b5b35bcc18da139900903e8843144d5875a5593b9c0741c5",
            scope: "org",
            name: "balls",
            identString: "@org/balls",
            range: ">=2",
            protocol: "npm",
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramDescriptorStringifiedPackage - @or__g___balls@>=2#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramDescriptorStringifiedPackage">({
        original: "@or__g___balls@>=2#b=b&a=a",
        originalNormalized: "@or__g___balls@>=2#b=b&a=a",
        address: "@or__g/balls@>=2#b=b&a=a",
        addressNormalized: "@or__g/balls@>=2#a=a&b=b",
        group: "package",
        type: "paramDescriptorStringifiedPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "e0b96ddc15135afa309230ca21dec1a180290fe8f3f86e86f53b7deb3bdf24b095bc285e095fadd6a535c79a265ef382859b5528052fea91e6cd571588b86f55",
            scope: "or__g",
            name: "balls",
            identString: "@or__g/balls",
            range: ">=2",
            protocol: "npm",
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramDescriptorStringifiedPackage - @or_g___balls@>=2#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramDescriptorStringifiedPackage">({
        original: "@or_g___balls@>=2#b=b&a=a",
        originalNormalized: "@or_g___balls@>=2#b=b&a=a",
        address: "@or_g/balls@>=2#b=b&a=a",
        addressNormalized: "@or_g/balls@>=2#a=a&b=b",
        group: "package",
        type: "paramDescriptorStringifiedPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "9ed19bb4d15672abba663444d6bfdda7f27867de5b6be730e7b9b7532b08359ba6d4191b442e0ad21d347036144e465afe83b373363a4ee528f6bdf9f2769679",
            scope: "or_g",
            name: "balls",
            identString: "@or_g/balls",
            range: ">=2",
            protocol: "npm",
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
  it("paramDescriptorStringifiedPackage - ___balls@>=2#b=b&a=a", () => {
    runEntry(
      buildEntry<"paramDescriptorStringifiedPackage">({
        original: "___balls@>=2#b=b&a=a",
        originalNormalized: "___balls@>=2#b=b&a=a",
        address: "balls@>=2#b=b&a=a",
        addressNormalized: "balls@>=2#a=a&b=b",
        group: "package",
        type: "paramDescriptorStringifiedPackage",
        arch: "darwin",
        parts: {
          descriptor: {
            identHash:
              "aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a",
            scope: undefined,
            name: "balls",
            identString: "balls",
            range: ">=2",
            protocol: "npm",
          },
          params: new URLSearchParams({
            b: "b",
            a: "a",
          }),
          paramsSorted: new URLSearchParams({
            a: "a",
            b: "b",
          }),
        },
      })
    );
  });
});

describe("Address posix", () => {
  // const buildEntry = <AddName extends keyof AddressType>(entry: TestMapEntry<AddName>) => entry

  let addr: Address;
  beforeEach(async () => {
    addr = Address.initialise({ parseParams: {} });
  });

  describe("group accessors", () => {
    it("path", () => {
      expect(
        addr.parsePath("/Users/repositories/workspace-multiple-commits")
      ).toEqual({
        original: "/Users/repositories/workspace-multiple-commits",
        originalNormalized: "/Users/repositories/workspace-multiple-commits",
        address:
          "/Users/repositories/workspace-multiple-commits" as PortablePath,
        addressNormalized:
          "/Users/repositories/workspace-multiple-commits" as PortablePath,
        group: "path",
        type: "portablePathPosixAbsolute",
        parts: {
          suffix: undefined,
        },
      });

      expect(() =>
        addr.parsePackage("/Users/repositories/workspace-multiple-commits")
      ).toThrowError(
        /Address: unable to parse '\/Users\/repositories\/workspace-multiple-commits'/
      );
    });
    it("url", () => {
      expect(
        addr.parseUrl("https://github.com/elmpp/org-repo.git#commit=21c39617a9")
      ).toEqual({
        original: "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        originalNormalized:
          "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        address:
          "https://github.com/elmpp/org-repo.git#commit=21c39617a9" as PortablePath,
        addressNormalized:
          "https://github.com/elmpp/org-repo.git#commit=21c39617a9" as PortablePath,
        type: "githubRepoUrl",
        group: "url",
        parts: {
          org: "org-repo",
          user: "elmpp",
          url: new URL(
            "https://github.com/elmpp/org-repo.git#commit=21c39617a9"
          ),
          params: new URLSearchParams({
            commit: "21c39617a9",
          }),
          paramsSorted: new URLSearchParams({
            commit: "21c39617a9",
          }),
        },
      });

      expect(() =>
        addr.parsePath("http://bbc.com/elmpp/org-repo/tarball")
      ).toThrowError(
        /Address: unable to parse 'http:\/\/bbc.com\/elmpp\/org-repo\/tarball'/
      );
    });
    it("package", () => {
      expect(addr.parsePackage("mnt-plugin-balls")).toEqual({
        original: "mnt-plugin-balls",
        originalNormalized: "mnt-plugin-balls",
        address: "mnt-plugin-balls",
        addressNormalized: "mnt-plugin-balls",
        group: "package",
        type: "paramIdentPackage",
        parts: {
          descriptor: {
            identHash:
              "66e604be9c5e7bef9711ce02495400e6afde1862cb878be9aea80a6ba656d8740201794b93d3583458e0d27ac4b284b1db94c57264919178ecf346e8c90f9c91",
            name: "mnt-plugin-balls",
            identString: "mnt-plugin-balls",
            protocol: "npm",
          },
        },
      });

      expect(() => addr.parsePath("@monotonous/mnt-plugin-balls")).toThrowError(
        /Address: unable to parse '@monotonous\/mnt-plugin-balls'/
      );
    });
  });

  describe("specific parsing validation", () => {
    describe("path", () => {
      it("parsePath fails when expected", () => {
        const res = addr.parsePath("/clearly\\guff$$$::path", {
          strict: false,
        });
        expect(res).toBeFalsy();
      });
      it(`cacheOther only accepts a checksum param`, () => {
        expect(() =>
          addr.parseAsType(
            "cache:aNamespace/aKey#invalidParam=blah",
            "cacheOther",
            { strict: true }
          )
        ).toThrowError(
          /Address: unknown params has been supplied with cache address inside 'cache-other-handler'. Allowed params are 'checksum'./
        );
      });
      // it.only('long nm path', () => {
      //   // const res = addr.parsePath(`${constants.TMP_ROOT}/stage1/tests/creates_a_skeleton_workspace_without_configPath_using_skeleton_config/node_modules/.pnpm/@business-as-code+core@0.0.0-latest-20230812065455_@types+node@14.18.54/node_modules/@business-as-code/core/dist/utils`, {
      //   });
      //   expect(res).toBeTruthy();
      // })
    });
    describe("url", () => {});
    describe("package", () => {
      it(`scaffoldIdentPackage requires a 'namespace' param`, () => {
        expect(() =>
          addr.parseAsType(
            "@monotonous/mnt-plugin-balls",
            "scaffoldIdentPackage",
            { strict: true }
          )
        ).toThrowError(
          /Address: a namespace param is required when defining package paths with 'scaffold-ident-package-handler'. e.g. my-package#namespace=my-scaffold-folder. Address: '@monotonous\/mnt-plugin-balls'/
        );
      });
      // it(`templateIdentPackage requires a 'namespace' param`, () => {
      //   expect(() => addr.parseAsType('@monotonous/mnt-plugin-balls', 'templateIdentPackage', {strict: true})).toThrowError(/Address: a namespace param is required when defining package paths with 'template-ident-package-handler'. e.g. my-package#namespace=my-template-folder. Address: '@monotonous\/mnt-plugin-balls'/)
      // })
      it(`parseAsType throws error with default strict`, () => {
        expect(() =>
          addr.parseAsType(
            "this-is-a-path-filename-not-a-scaffoldIdentPackage",
            "scaffoldIdentPackage",
            {}
          )
        ).toThrowError(
          `Address: unable to parse 'this-is-a-path-filename-not-a-scaffoldIdentPackage' as group/type: '-/scaffoldIdentPackage'. Error: 'Address: unable to parse 'this-is-a-path-filename-not-a-scaffoldIdentPackage' as group/type: '-/scaffoldIdentPackage'`
        );
      });
    });
  });

  // the api we want to make common across the groups
  describe("common api", () => {
    describe("format", () => {
      it("path: default handler", () => {
        Object.defineProperty(process, `platform`, {
          configurable: true,
          value: "win32",
        });
        const ret = addr.parsePath("C:\\Users\\user\\proj");

        expect(addr.format(ret)).toEqual(`C:\\Users\\user\\proj`); // shows original
      });
      it("url: default handler", () => {
        const ret = addr.parseUrl("http://www.bbc.com?b=b&a=a");

        expect(addr.format(ret)).toEqual(`http://www.bbc.com/?a=a&b=b`); // applied normalization
      });
      it("url: handler format", () => {
        addr.registerHandler(
          bespokeHandler as AddressHandler<keyof AddressType>
        );
        const ret = addr.parseUrl("http://www.bbc.com");

        expect(addr.format(ret)).toEqual(`FORMATTED`);
      });
      it("package: default handler", () => {
        const ret = addr.parsePackage("@monotonous/mnt-plugin-mine#b=b&a=a");

        expect(addr.format(ret)).toEqual(`@monotonous/mnt-plugin-mine#a=a&b=b`); // applied normalization
      });
    });
  });
  describe("handlers", () => {
    it("adding a handler to a group makes it firstly considered", () => {
      addr.registerHandler(bespokeHandler as AddressHandler<keyof AddressType>);
      expect(
        addr.parse({
          address:
            "url:https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        })
      ).toEqual({
        original: "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        originalNormalized:
          "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        address: "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        addressNormalized:
          "https://github.com/elmpp/org-repo.git#commit=21c39617a9",
        type: "bespokeUrl",
        group: "url",
        parts: {
          bespokePartProp: "whatever",
          url: new URL(
            "https://github.com/elmpp/org-repo.git#commit=21c39617a9"
          ),
        },
      });
    });
  });
});

//  NEED TO CLEAR OUT THE OTHER ADDRESS IMPLEMENTATION AFTER THIS
// THIS IS ALL TO ALLOW STACK REFERENCE AND REPLACE THE SCAFFOLD NAMESPACE OBJECT
