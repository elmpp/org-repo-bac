import { AddressPathAbsolute, addr } from '@business-as-code/address'
import {
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
  execUtils as _execUtils
} from '@business-as-code/core'
import { doExec } from '@business-as-code/core/utils/exec-utils'
import { BacError, MessageName } from '@business-as-code/error'
import { ok } from 'assert'

/**
 Creates a bundled executable. Stored into the cli/bin folder
 docs - https://tinyurl.com/ytcbwtc4
 */
export default class BunBundleBuild extends BaseCommand<typeof BunBundleBuild> {
  static override description = 'Creates a bundled bun executable'

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`
  ]

  static override flags = {
    workspacePath: Oclif.Flags.directory({
      exists: true,
      description: 'Workspace name',
      required: false
    })
    // query: Oclif.Flags.string({
    //   description: "Query to select snapshotted projects",
    //   required: false,
    //   default: "projectType=library || projectType=application",
    // }),
    // message: Oclif.Flags.string({
    //   description: "Message for the changeset",
    //   required: true,
    // }),
    // registry: Oclif.Flags.string({
    //   description: "Specify a package manager registry to load the Bac cli",
    //   required: false,
    //   default: "http://localhost:4873",
    // }),
    // tag: Oclif.Flags.string({
    //   description: "Add a tag to the published package",
    //   required: false,
    //   // default: "http://localhost:4873",
    // }),
  }

  static override args = {
    // path: Oclif.Args.string({
    //   description: "Absolute/Relative path",
    //   required: false,
    // }),
  }

  async execute(context: ContextCommand<typeof BunBundleBuild>) {
    if (context.detectedPackageManager !== 'packageManagerBun') {
      throw new BacError(
        MessageName.UNNAMED,
        `Cannot bun build workspace without bun runtime. Detected: '${context.detectedPackageManager}'`
      )
    }

    // const moonService = await context.serviceFactory('moon', {context, workingPath: '.'})
    // const bunService = await context.serviceFactory('release', {context, workingPath: '.'})

    // await context.lifecycles.runWorkspace

    // const moonQuery = `projectType=library || projectType=application`

    const cliEntrypointPath = addr.pathUtils.join(
      context.workspacePath,
      addr.parsePath(`packages/pkg-cli/src/bin/run.ts`)
    ) as AddressPathAbsolute
    const cliOutFolderPath = addr.pathUtils.join(
      context.workspacePath,
      addr.parsePath(`packages/pkg-cli/src/bin`)
    ) as AddressPathAbsolute
    const cliOutPath = addr.pathUtils.join(
      context.workspacePath,
      addr.parsePath(`packages/pkg-cli/src/bin/run.js`)
    ) as AddressPathAbsolute

    // await doExec({
    //   command: `bun build --env-file=.env.local --compile packages/pkg-cli/src/bin/run.ts --outfile ../tmp/test-bun/mycli`,
    // })

    context.logger.debug(
      `Building bun executable using entrypoint: '${cliEntrypointPath.original}'`
    )

    await Bun.build({
      entrypoints: [cliEntrypointPath.original],
      // outdir: "./public",
      // outdir: "./public",
      outdir: cliOutFolderPath.original,
      // outdir: cliOutPath.original,
      target: 'bun',
      define: {
        // "process.env.DISCORD_CLIENT_ID": JSON.stringify(process.env.DISCORD_CLIENT_ID),
        // "process.env.DISCORD_API_ENDPOINT": JSON.stringify(process.env.DISCORD_API_ENDPOINT),
        // "process.env.WEBSITE_BASE_URL": JSON.stringify(process.env.WEBSITE_BASE_URL),
      }
    })

    context.logger.info(`Built bun executable to: '${cliOutPath.original}'`)

    return {
      success: true as const,
      res: undefined
    }

    // await context.lifecycles.runProject.executeRunProject({
    //   common: {
    //     context,
    //     workspacePath: context.workspacePath,
    //     workingPath: '.',
    //   },
    //   options: [
    //     {

    //     }
    //   ]
    // })

    // const projects = await moonService.findProjectsJson({query: moonQuery})
    // let projects: any
    // try {
    //   projects = await moonService.findProjectsJson({query: moonQuery})
    // }
    // catch (err) {
    //   console.error(`err :>> `, err)
    // }

    // // find the versions of the releasable projects

    // console.log(`projects :>> `, projects)
    // return

    // return bunService.snapshot({
    //   query: moonQuery,
    //   message: context.cliOptions.flags.message,
    //   registry: context.cliOptions.flags.registry,
    //   tag: context.cliOptions.flags.tag,
    // })
  }
}
