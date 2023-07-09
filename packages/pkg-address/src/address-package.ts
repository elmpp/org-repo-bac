// import { constants } from '@monotonous/common'
import { BacError, MessageName } from '@business-as-code/error'
import type { Address, InitialiseOptions } from './address'
import { AddressDescriptor, AddressPackage, AddressPackageDescriptor, AddressPackageIdent, AddressPackageStringified, AddressPathAbsolute } from './__types__'

export type AddressPackageUtils = ReturnType<typeof createAddressPackage>
export type AddressPackageProtocols =
  // https://yarnpkg.com/features/protocols/#table
  'npm' | 'portal' | 'link' | 'file' | 'github' | 'workspace'


export const createAddressPackage = (addressIns: Address, parseParams: InitialiseOptions['parseParams']) => {

  function doResolve(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, strict: true, includeSubpath?: boolean}): AddressPathAbsolute
  function doResolve(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, strict?: boolean, includeSubpath?: boolean}): AddressPathAbsolute | undefined
  function doResolve(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, strict?: boolean, includeSubpath?: boolean}): AddressPathAbsolute | undefined {

    const {projectCwd, address, strict = false, includeSubpath = true} = options

    const tryResolveFromProjectCwd = (ident: string, projectCwd: string): AddressPathAbsolute | undefined => {
      try {
        const resolved = require.resolve(ident, {paths: [projectCwd]})
        return addressIns.parsePath(resolved) as AddressPathAbsolute
      } catch (err) {}
    }
    const tryResolveFromCommonAncestor = (ident: string, projectCwd: string): AddressPathAbsolute | undefined => {
      try {
        const cliPath = require.resolve('@business-as-code/cli', {paths: [projectCwd]})
        const resolved = require.resolve(ident, {paths: [cliPath]})
        return addressIns.parsePath(resolved) as AddressPathAbsolute
      } catch (err) {}
    }

    let resolved: AddressPathAbsolute | undefined

    resolved = tryResolveFromProjectCwd(address.original, projectCwd.original)
    // todo - add engine: > 15 to all package.json due to use of this operator
    resolved ??= tryResolveFromCommonAncestor(address.addressNormalized, projectCwd.original)
    resolved ??= tryResolveFromCommonAncestor(address.addressNormalized, process.argv[1])

    if (!resolved && !strict) return

    if (!resolved && strict) {
      // throw new Error(
      //   `Unable to resolve package '${address.address}'. Attempted direct resolve with context path: '${projectCwd.original}'. Attempted resolve via @monotonous/cli from context paths ['${projectCwd.original}', '${process.argv[1]}']`,
      // )
      throw new BacError(
        MessageName.PACKAGE_RESOLVE_FAIL,
        `Unable to resolve package '${address.addressNormalized}'. Attempted direct resolve with context path: '${projectCwd.original}'. Attempted resolve via @monotonous/cli from context paths ['${projectCwd.original}', '${process.argv[1]}']`,
      )
    }

    if ((address as AddressDescriptor<'paramIdentPackage'>).parts.descriptor.subpath && includeSubpath) {
      // resolved = addressIns.parsePath(`${resolved!.original}/${(address as AddressDescriptor<'paramIdentPackage'>).parts.descriptor.subpath}`) as AddressPathAbsolute
      resolved = resolved
    }

    if (resolved) {
      resolved = addressIns.parsePath(_normalizeResolved(resolved!.original)) as AddressPathAbsolute
    }

    return resolved
  }

  function _normalizeResolved(path: string): string {
    try {
      const {resolveVirtual} = require('pnpapi') // yarn2 pnpapi - https://yarnpkg.com/advanced/pnpapi#resolvevirtual
      const deVirtualized = resolveVirtual(path)
      return deVirtualized ?? path
    }
    catch (e) {}
    return path
  }

  /**
  Returns absolute path to specified external package.

  Will attempt to resolve using firstly the supplied projectCwd, otherwise attempting using `cli` as
  a path. This should cover core+user plugins

  See more here - {@linkcode dynamicRequireFromProjectCwd }

  @param options.projectCwd [AddressPathAbsolute]  The supposed root of the project from where common ancestor /cli will be resolved. Defaults to parseParams.projectCwd
  */
  function resolve(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, includeSubpath?: boolean, strict: true}): AddressPathAbsolute
  function resolve(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, includeSubpath?: boolean, strict?: boolean}): AddressPathAbsolute | undefined
  function resolve(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, includeSubpath?: boolean, strict?: boolean}): AddressPathAbsolute | undefined {

    checkGroup(options.address, addressIns)
    return doResolve(options)
  }

  /**
  Returns absolute path to specified external package.

  Will attempt to resolve using firstly the supplied projectCwd, otherwise attempting using `cli` as
  a path. This should cover core+user plugins

  See more here - {@linkcode dynamicRequireFromProjectCwd }

  @param options.projectCwd [AddressPathAbsolute]  The supposed root of the project from where common ancestor /cli will be resolved. Defaults to parseParams.projectCwd
  */
  function resolveRoot(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, strict: true}): AddressPathAbsolute
  function resolveRoot(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, strict?: boolean}): AddressPathAbsolute | undefined
  function resolveRoot(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, strict?: boolean}): AddressPathAbsolute | undefined {

    checkGroup(options.address, addressIns)
    const pkgPath = addressIns.parsePackage(`${options.address.parts.descriptor.identString}/package.json`)
    const resolved = doResolve({...options, address: pkgPath, includeSubpath: false})

    if (!resolved) return
    return addressIns.pathUtils.dirname(resolved)
  }



//   // function resolveTemplate(options: {address: AddressPackage, projectCwd: AddressPathAbsolute, includeSubpath?: boolean, namespace?: Mnt.MapUtil.FeatureKeys & string, featureName: Mnt.MapUtil.FeatureKeys , stackName: Mnt.MapUtil.StackKeys}): AddressPathAbsolute {
//   function resolveTemplate(options: {address: AddressPackageTemplateIdent, projectCwd: AddressPathAbsolute, strict: true}): AddressPathAbsolute
//   function resolveTemplate(options: {address: AddressPackageTemplateIdent, projectCwd: AddressPathAbsolute, strict?: boolean}): AddressPathAbsolute | undefined
//   function resolveTemplate(options: {address: AddressPackageTemplateIdent, projectCwd: AddressPathAbsolute, strict?: boolean}): AddressPathAbsolute | undefined {

//     const {address, projectCwd, strict} = options
//     address && checkGroup(address, addressIns)

//     let resolveBase: typeof projectCwd | undefined = projectCwd

//     resolveBase = resolveRoot({ address, projectCwd })

//     if (!resolveBase) return

//     // let path: AddressPathAbsolute | undefined
//     // path = tryPPackageRoot({ packageIdent: `${packageIdent}`, projectCwd })
//     // !path && (path = pPackageRoot({packageIdent: packageIdent, projectCwd: pPackageRoot({packageIdent: '@monotonous/cli', projectCwd})}))
//     // !path && (path = resolveRoot({ address, projectCwd }))
// // console.log(`resolveBase, namespace, addressIns.parseAsType(constants.TEMPLATE_FOLDER, 'portablePathFilename') :>> `, resolveBase, namespace, addressIns.parseAsType(constants.TEMPLATE_FOLDER, 'portablePathFilename'))
//     // if (!namespace) {
//     //   return addressIns.pathUtils.join(resolveBase, addressIns.parseAsType(constants.TEMPLATE_FOLDER, 'portablePathFilename')) as AddressPathAbsolute
//     // }

//     return addressIns.pathUtils.join(resolveBase, addressIns.parseAsType(constants.TEMPLATE_FOLDER, 'portablePathFilename'), addressIns.parsePath(address.parts.params.get('namespace')!)) as AddressPathAbsolute
//   }

  function stringify(options: {address: AddressPackage}): AddressPackageStringified {
    const {address} = options
    return `${address.parts.descriptor.scope ? `@${address.parts.descriptor.scope}` : ''}___${address.parts.descriptor.name}${(address as AddressDescriptor<'paramDescriptorStringifiedPackage'>).parts.descriptor.range ? `@${(address as AddressDescriptor<'paramDescriptorStringifiedPackage'>).parts.descriptor.range}` : ''}${address.parts.params ? `#${address.parts.params.toString()}` : ''}`
  }

  function clone(address: AddressPackage, {params, range}: {params?: URLSearchParams, range?: string}): AddressPackage {
    let nextPackageAddressString = address.parts.descriptor.identString
    if (range || (address.parts.descriptor as any).range) {
      nextPackageAddressString = `${nextPackageAddressString}@${range ?? (address.parts.descriptor as any).range}`
    }
    if (params || address.parts.params) {
      const nextParams = params ?? address.parts.params ?? new URLSearchParams
      nextParams.forEach((pVal, pKey) => {
        nextParams.set(pKey, pVal)
      })
      nextPackageAddressString = `${nextPackageAddressString}#${nextParams.toString()}`
      // return addressIns.parseAsType(`${address.parts.descriptor.identString}#${nextParams.toString()}`, address.type) as T
    }

    // console.log(`nextPackageAddressString :>> `, nextPackageAddressString)
    return addressIns.parsePackage(nextPackageAddressString)
    // return addressIns.parseAsType(nextPackageAddressString, address.type)
    // return address
  }

  function identToDescriptor(options: {address: AddressPackageIdent, range: AddressPackageDescriptor['parts']['descriptor']['range']}): AddressPackageDescriptor {
    const {address, range} = options
    // const desc = addressIns.parseAsType(address.original, 'paramDescriptorPackage')
    const desc = clone(address, {range}) as AddressPackageDescriptor
    desc.parts.descriptor.range = range
    return desc
  }

  return {
    // root: {
    //   original: '/',
    //   address: '/',
    //   group: 'path',
    //   type: 'portablePathPosixAbsolute',
    //   parts: {},
    // } as AddressDescriptor<'portablePathPosixAbsolute'>,
    // dot: {
    //   original: '.',
    //   address: '.',
    //   group: 'path' as AddressGroupUnion,
    //   type: 'portablePathPosixRelative' as AddressTypeByGroup<'path'>,
    //   parts: {},
    // } as AddressDescriptor<'portablePathPosixRelative'>,
    // get cwd(): AddressPathAbsolute {
    //   return addressIns.parsePath(process.cwd()) as AddressPathAbsolute
    // },
    // get tmpFilepath(): AddressPathAbsolute {
    //   const tmpdir = os.tmpdir()
    //   const hash = Math.ceil(Math.random() * 0x100000000)
    //     .toString(16)
    //     .padStart(8, `0`)

    //   return addressIns.parsePath(path.join(tmpdir, hash)) as AddressPathAbsolute
    // },
    // root: {
    //   original: constants.WORKROOT_IDENT,
    //   originalNormalized: constants.WORKROOT_IDENT,
    //   address: constants.WORKROOT_IDENT,
    //   addressNormalized: constants.WORKROOT_IDENT,
    //   group: 'package',
    //   type: 'paramIdentPackage',
    //   parts: {
    //     descriptor: {
    //       identHash: string
    //       scope?: string
    //       name: string
    //       identString: string
    //       protocol: AddressPackageProtocols // package manager dependent
    //       subpath?: string
    //     }
    //   },
    // } as AddressDescriptor<'paramIdentPackage'>,

    clone,
    root: addressIns.parseAsType('root', 'paramIdentPackage'),
    resolve,
    resolveRoot,
    // resolveTemplate,
    identToDescriptor,
    stringify,
  }
}

const checkGroup = (address: AddressDescriptor, addressIns: Address) => {
  if (address.group !== 'package') throw new Error(`AddressPath: non path descriptor supplied '${addressIns.format(address)}'`)
}

// export const ppath: PathUtils<PortablePath> = Object.create(path.posix) as any