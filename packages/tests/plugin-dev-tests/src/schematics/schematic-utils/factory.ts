import { strings } from '@angular-devkit/core'
import {
  apply,
  chain,
  mergeWith,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics'
import { constants, schematicUtils } from '@business-as-code/core'
import { Schema } from './schema'

export default function (options: Schema): Rule {
  return (_tree, schematicContext) => {
    const bareTemplateSource = apply(url('./repo'), [
      template({
        name: 'root-package',
        dot: '.',
        dasherize: strings.dasherize
      })
    ])

    return chain([
      mergeWith(bareTemplateSource),
      schematicUtils.flushBranchMerge(
        schematicUtils.wrapServiceAsRule({
          serviceOptions: {
            serviceName: 'git',
            cb: async ({ service }) => {
              await service.init({ '--initial-branch': 'main' })
              const repo = service.getRepository()
              await repo.add('.')
              /** commit example - https://tinyurl.com/29y5mnwm */
              await repo.commit('initial commit', {
                '--author': constants.DEFAULT_COMMITTER
              })
            },
            context: options._bacContext,
            initialiseOptions: {
              workingPath: '.'
            }
          },
          schematicContext
        }),
        {
          context: options._bacContext,
          initialiseOptions: {
            workingPath: '.'
          }
        }
      ),
      (tree: Tree, schematicContext: SchematicContext) => {
        schematicUtils.remove('./package.json', tree, schematicContext) // should be allowed to delete this file even though was created before/during an external wrap
        return tree
      },
      (tree: Tree, schematicContext: SchematicContext) => {
        schematicUtils.remove('./packages', tree, schematicContext) // should be allowed to delete this folder even though was created before/during an external wrap
        return tree
      },
      schematicUtils.debugRule({
        context: options._bacContext,
        initialiseOptions: {
          workingPath: '.'
        }
      })
    ])
  }
}
