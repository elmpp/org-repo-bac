import { Config, configSchema } from "../config";

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
  it("validates", () => {
    const config = {
      projectSource: [
        {
          location: `localhost:9000`,
          protocol: "git",
          active: true,
          detectProject: {
            stage: {
              language: "javascript",
              // name: "lib1",
              type: "library",

              // active: true,
              // location: `path:/something/else`,
            },
          } as any,
        },
      ],
    } satisfies Config;
    const res = configSchema.safeParse(config);
    expect(res.success).toBeTruthy()
  });
  it("validates with errors", () => {
    const config = {
      projectSource: [
        {
          location: `localhost:9000`,
          // @ts-expect-error:
          protocol: "NOTVALIDPROTOCOL",
          active: true,
          detectProject: {
            language: "javascript",
            name: "lib1",
            type: "library",
            active: true,
            location: `url:git@github.com:elmpp/org-repo-bac.git`,
          } as any,
        },
      ],
    } satisfies Config;
    const res = configSchema.safeParse(config);
    expect(res.success).toBeFalsy()
  });
});
