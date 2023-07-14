import { Config, configSchema } from "../config/config";

// const configStaticSourceOk = {
//   projectSource: [{
//     location: `localhost:9000`,
//     protocol: 'git',
//     active: true,
//     detectProject: {
//       language: 'typescript',
//       name: 'lib1',
//       type: 'library',
//       active: true,
//       location: `/something/else`,
//     },
//   },
//   {
//     location: `localhost:9000`,
//     protocol: 'git',
//     active: true,
//     detectProject: {
//       language: 'typescript',
//       name: 'lib2',
//       type: 'library',
//       active: true,
//       location: `/something/else`,
//       dependsOn: 'lib1',
//     },
//   }]
// } satisfies Config

// const configStaticSourceFail = {
//   projectSource: [{
//     location: `localhost:9000`,
//     protocol: 'git',
//     active: true,
//     detectProject: {
//       language: 'typescript',
//       name: 'lib1',
//       type: 'library',
//       active: true,
//     },
//   },
//   {
//     location: `localhost:9000`,
//     protocol: 'git',
//     active: true,
//     detectProject: {
//       language: 'typescript',
//       name: 'lib2',
//       type: 'library',
//       active: true,
//       dependsOn: 'lib1',
//     },
//   }]
// } satisfies Config

describe("config", () => {
  it("provider-based config validates", () => {
    const config = {
      projectSource: [
        {
          provider: "git",
          options: {
            // b: 'b',
            // context: {} as Context,
            // workingPath: '.',
            // workspacePath: addr.parsePath('.') as AddressPathAbsolute,
            // options: {
            address: 'http://localhost:8174/bare-repo1.git?commit=21c39617a9',
            // }
            // address: 'http://localhost:8174/bare-repo1.git?commit=21c39617a9'
          }
        },
      ],
    } satisfies Config;
    const res = configSchema.safeParse(config);
    expect(res.success).toBeTruthy()
  });
  it("provider-based config validates provider + options shape", () => {
    const config: Config = {
      projectSource: [
        // @ts-expect-error: provider missing
        {
          // options: {
          //   incorrect: 'objects',
          // }
        },
      ],
    }
    const res = configSchema.safeParse(config);
    expect(res.success).toBeFalsy()
  });
  it("provider-based config validates provider + options as an unknown", () => {
    const config = {
      projectSource: [
        {
          // @ts-expect-error:
          provider: "unknownproviderkey",
          options: {
            // @ts-expect-error:
            incorrect: 'objects',
          }
        },
      ],
    } satisfies Config;
    const res = configSchema.safeParse(config);
    expect(res.success).toBeTruthy() // we're just checking the shape
  });

  // it("validates with errors", () => {
  //   const config = {
  //     projectSource: [
  //       {
  //         location: `localhost:9000`,
  //         // @ts-expect-error:
  //         protocol: "NOTVALIDPROTOCOL",
  //         active: true,
  //         getProject: {
  //           language: "javascript",
  //           name: "lib1",
  //           type: "library",
  //           active: true,
  //           location: `url:git@github.com:elmpp/org-repo-bac.git`,
  //         } as any,
  //       },
  //     ],
  //   } satisfies Config;
  //   const res = configSchema.safeParse(config);
  //   expect(res.success).toBeFalsy()
  // });
});
