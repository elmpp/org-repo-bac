import { describe, it } from 'bun:test'
import { expectTypeOf } from 'expect-type'
import { z } from 'zod'
import {
  providerOptionsSchemaBuilder,
  providerReturnOptionsSchemaBuilderArray,
  providerReturnOptionsSchemaBuilderSingular
} from '../utils'

describe('validation utils', () => {
  it('providerOptionsSchemaBuilder', () => {
    const optionsSchema = providerOptionsSchemaBuilder('configureWorkspace')

    type SchemaType = z.infer<typeof optionsSchema>

    expectTypeOf<SchemaType>().toMatchTypeOf<{
      provider: 'git'
      options: unknown
    }>()

    console.log(`optionsSchema :>> `, optionsSchema)
  })

  it('returnOptionsArraySchemaBuilder', () => {
    const optionsSchema =
      providerReturnOptionsSchemaBuilderArray('configureWorkspace')

    type SchemaType = z.infer<typeof optionsSchema>

    expectTypeOf<SchemaType>().toMatchTypeOf<
      Array<{
        provider: 'git'
        options: {
          address: string
          // success: boolean,
        }
      }>
    >()

    console.log(`optionsSchema :>> `, optionsSchema)
  })
  it('returnOptionsSingularSchemaBuilder', () => {
    const optionsSchema =
      providerReturnOptionsSchemaBuilderSingular('configureWorkspace')

    type SchemaType = z.infer<typeof optionsSchema>

    expectTypeOf<SchemaType>().toMatchTypeOf<{
      provider: 'git'
      options: {
        // success: boolean,
        address: string
      }
    }>()

    console.log(`optionsSchema :>> `, optionsSchema)
  })
})
