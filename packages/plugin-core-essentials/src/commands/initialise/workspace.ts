import {
  addr,
  AddressPathAbsolute,
  AddressPathRelative,
  assertIsAddressPath,
  assertIsAddressPathAbsolute,
  assertIsAddressPathRelative,
} from "@business-as-code/address";
import {
  fsUtils,
  BaseCommand,
  ContextCommand,
  Flags,
  Interfaces as _Interfaces,
  Config,
  configSchema,
} from "@business-as-code/core";
import {
  BacError,
  BacErrorWrapper,
  MessageName,
} from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

export class InitialiseWorkspace extends BaseCommand<
  typeof InitialiseWorkspace
> {
  static override description = "Creates an empty workspace";

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static override flags = {
    name: Flags.string({
      description: "Workspace name",
      required: true,
    }),
    workspacePath: Flags.string({
      description: "Workspace name",
      required: true,
    }),
    configPath: Flags.string({
      description: "Relative or absolute path to a workspace configuration",
      required: false,
    }),
    cliVersion: Flags.string({
      description: "Specify a Bac cli version",
      required: false,
      default: "latest",
    }),
    cliRegistry: Flags.string({
      description: "Specify a package manager registry to load the Bac cli",
      required: false,
      default: "https://registry.npmjs.org",
      // default: "http://localhost:4873",
    }),
    cliPath: Flags.string({
      description: "Specify a fs path to load the Bac cli (performs a link via package manager). For dev use",
      required: false,
    }),
  };

  static override args = {
    // firstArg: Args.string(
    //   {
    //     name: 'workspace',               // name of arg to show in help and reference with args[name]
    //     required: false,            // make the arg required with `required: true`
    //     description: 'output file', // help description
    //     hidden: true,               // hide this arg from help
    //     // parse: input => 'output',   // instead of the user input, return a different value
    //     default: 'world',           // default value if no arg input
    //     options: ['a', 'b'],        // only allow input to be from a discrete set
    //   }
    // ),
    // path: Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  };

  protected async getConfig(
    context: ContextCommand<typeof InitialiseWorkspace>
  ): Promise<{config: Config, path: AddressPathAbsolute}> {
    const getConfigPath = (
      runtimeConfigRelOrAbsoluteNative: string | AddressPathAbsolute | AddressPathRelative
    ): AddressPathAbsolute => {
      let configPath: AddressPathAbsolute | AddressPathRelative =
        typeof runtimeConfigRelOrAbsoluteNative === "string"
          ? addr.parsePath(runtimeConfigRelOrAbsoluteNative)
          : runtimeConfigRelOrAbsoluteNative;
      //   addr.parsePath(
      //     runtimeConfigRelOrAbsoluteNative ??
      //       path.resolve(__dirname, "./config-default.js")
      //   );
      // if (typeof configPath === 'string') {
      //   configPath = addr.parsePath(configPath)
      // }
// console.log(`configPath :>> `, configPath)
//       const cliCheckoutPath = addr.packageUtils.resolve({
//         address: addr.parsePackage(
//           `@business-as-code/cli`
//         ),
//         projectCwd: testContext.testEnvVars.checkoutPath,
//         strict: true,
//       })


      if (assertIsAddressPathRelative(configPath)) {
        configPath = addr.pathUtils.resolve(
          addr.parsePath(process.cwd()),
          configPath
        ) as AddressPathAbsolute;
      }

      if (!xfs.existsSync(configPath.address)) {
        throw new BacError(
          MessageName.OCLIF_ERROR,
          `Config path at '${configPath.original}' does not exist, supplied as '${require('util').inspect(runtimeConfigRelOrAbsoluteNative, {showHidden: false, depth: undefined, colors: true})}`
        );
      }
      return configPath;
    };

    // const cliCheckoutPath = addr.packageUtils.resolve({
    //   address: addr.parsePackage(
    //     `@business-as-code/cli`
    //   ),
    //   projectCwd: context.testEnvVars.checkoutPath, // when finding default config, we want relative to the currently running instance (including checkout)
    //   strict: true,
    // })

    const skeletonConfigPath = addr.packageUtils.resolve({
      address: addr.parsePackage(
        `@business-as-code/core/src/etc/config/skeleton.js`
      ),
      projectCwd: addr.parsePath(context.oclifConfig.root) as AddressPathAbsolute, // we should always be able to find other BAC packages from the cli (which is available via oclifConfig)
      strict: true,
    });

    const inputConfigPathWithDefault =
      context.cliOptions.flags.configPath ??
      skeletonConfigPath;
    const configPath = getConfigPath(inputConfigPathWithDefault);
    const { module } = await fsUtils.loadModule(configPath.address);

    if (!module.config) {
      throw new BacError(
        MessageName.CONFIGURATION_CONTENT_ERROR,
        `Configuration file found but does not contain expected content. Path: '${configPath.original}'`
      );
    }
    const configRaw = module.config;

    const config = configSchema.safeParse(configRaw);

    if (!config.success) {
      throw new BacErrorWrapper(
        MessageName.CONFIGURATION_INVALID_ERROR,
        `Configuration file found but has validation errors. ${config.error.message}. Path: '${configPath.original}'`,
        config.error
      );
    }

    return {
      config: config.data,
      path: configPath,
    }
  }

  async execute(context: ContextCommand<typeof InitialiseWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    let workspacePath = addr.parsePath(context.cliOptions.flags.workspacePath!);
    if (!assertIsAddressPath(workspacePath)) {
      throw new BacError(
        MessageName.FS_PATH_FORMAT_ERROR,
        `Path '${context.cliOptions.args.path.path}' cannot be parsed as a path`
      );
    }
    if (assertIsAddressPathRelative(workspacePath)) {
      workspacePath = addr.pathUtils.join(
        addr.parsePath(process.cwd()),
        workspacePath
      );
    }
    if (!assertIsAddressPathAbsolute(workspacePath)) {
      throw new BacError(
        MessageName.FS_PATH_FORMAT_ERROR,
        `Path '${workspacePath.original}' must be absolute/relative`
      );
    }

    const {config, path: configPath} = await this.getConfig(context);

    const res = await context.lifecycles.initialiseWorkspace.executeInitialiseWorkspace([{
      provider: 'core',
      options: {
        context,
        workspacePath,
        // workingPath: ".",
        options: {
          name: context.cliOptions.flags.name,
          config,
          configPath: configPath.original,
          cliVersion: context.cliOptions.flags.cliVersion,
          cliRegistry: context.cliOptions.flags.cliRegistry,
          cliPath: context.cliOptions.flags.cliPath,
          // options: {
          //   a: 'a',
          // }, // <!-- typed as any atm ¯\_(ツ)_/¯
        }
    }}]);

    return res.res; // we eschew the provider wrapping for our solitary initialWorkspace

    // if (!(await xfs.existsPromise(workspacePath.address))) {
    //   const workspacePathParent = addr.pathUtils.dirname(workspacePath);
    //   if (!(await xfs.existsPromise(workspacePathParent.address))) {
    //     throw new BacError(
    //       MessageName.FS_PATH_FORMAT_ERROR,
    //       `Parent path '${workspacePathParent.original}' must be present when creating workspace at '${workspacePath.original}'`
    //     );
    //   }
    //   await xfs.mkdirpPromise(workspacePath.address);
    // }

    // // console.log(`context.services :>> `, context.services);

    // const schematicsService = await context.serviceFactory('schematics', {context, destinationPath: context.workspacePath, workingPath: '.'})

    // const res = await schematicsService.runSchematic({
    //   address: `@business-as-code/plugin-core-essentials#namespace=initialise-workspace`,
    //   context,
    //   options: {
    //     ...context.cliOptions.flags,
    //     // name: context.cliOptions.flags.name,
    //     // // destinationPath: context.cliOptions.flags.workspacePath,
    //     // configPath: context.cliOptions.flags.configPath,

    //     // name: 'cunt',
    //     // author: 'boloerguie',

    //   },
    //   // destinationPath: workspacePath,
    //   // dryRun: false,
    //   // force: true,
    //   // workingPath: addr.pathUtils.dot,
    // });

    // if (!assertIsOk(res)) {
    //   switch (res.res.error.reportCode) {
    //     case MessageName.SCHEMATICS_ERROR:
    //       context.logger.error(res.res.error.message);
    //       break;
    //     case MessageName.SCHEMATICS_INVALID_ADDRESS:
    //       context.logger.error(res.res.error.message);
    //       break;
    //     case MessageName.SCHEMATICS_NOT_FOUND:
    //       context.logger.error(res.res.error.message);
    //       break;
    //   }
    // }

    // // if (!assertIsOk(res)) {
    // //   switch (res.res.reportCode) {
    // //     case MessageName.SCHEMATICS_ERROR:
    // //       context.logger(res.res.message, "error");
    // //       break;
    // //     case MessageName.SCHEMATICS_INVALID_ADDRESS:
    // //       context.logger(res.res.message, "error");
    // //       break;
    // //     case MessageName.SCHEMATICS_NOT_FOUND:
    // //       context.logger(res.res.message, "error");
    // //       break;
    // //   }
    // // } else {
    // //   context.logger(`Finished ok. Scaffolded into '${res.res.destinationPath.original}'`, "info");
    // // }

    // return res

    //   override async run(): Promise<void> {
    //     }

    //     // this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
    //     this.log(`Creating a new workspace at '${workspacePath.original}'`)
    //   }
  }
}
