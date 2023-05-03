import {assertIsBacError, assertIsBacWrappedError, BacError, BacErrorWrapper} from '../errors'
import { MessageName } from '../message-name'
// import os from 'os'

const getMockStack1 = (msg: string) => `Error: ${msg}
  at BlahService.method1  (/my-checkout/blah-service-1.tsx:184:26)
  at BlahService.method2  (/my-checkout/blah-service-2.tsx:184:26)`
  // const getMockStack2 = (msg: string) => `Error: ${msg}
  // at ChaiService.method1  (/my-checkout/chai-service-1.tsx:184:26)
  // at ChaiService.method2  (/my-checkout/chai-service-2.tsx:184:26)`

describe('errors', () => {
  describe('BacError', () => {
    it('works normally', () => {
      const err = new BacError(MessageName.UNNAMED, 'hello')

      expect(err.reportCode).toEqual(MessageName.UNNAMED)
      expect(err.message).toEqual('hello')
      expect(err.extra).toBeUndefined()
    })
    it('accepts extra', () => {
      const err = new BacError(MessageName.UNNAMED, 'hello', {extra: {a: 'a'}})

      expect(err.extra).toEqual({a: 'a'})
      expect(err.reportCode).toEqual(MessageName.UNNAMED)
      expect(err.message).toEqual('hello')
    })
    // it('allows prefixing of the message', () => {
    //   const err = new BacError(MessageName.UNNAMED, 'hello')

    //   expect(err.message).toEqual('hello')
    //   expect(err.reportCode).toEqual(MessageName.UNNAMED)

    //   BacError.prefixMessage(err, `additional. `)

    //   expect(err.message).toEqual('additional. hello')
    //   expect(err.reportCode).toEqual(MessageName.UNNAMED)
    // })
    // it('compatible with clipanion', () => {
    //   const err = new BacError(MessageName.UNNAMED, 'hello', {type: 'clipanionGeneral'})

    //   expect(err.type).toEqual('clipanionGeneral')
    //   expect(err.reportCode).toEqual(MessageName.UNNAMED)
    //   expect(err.message).toEqual('hello')
    //   expect(err.extra).toBeUndefined()
    // })

    describe('getMessageForError', () => {
      it('uses full amount', () => {
        expect(BacError.getMessageForError(new BacError(MessageName.ADDRESS_FORMAT_INVALID, 'blah'))).toMatch(new RegExp(`Error code '${MessageName.ADDRESS_FORMAT_INVALID}'.*blah`, 's'))
      })
    })

    describe('fromError', () => {
      it('bacError', async () => {
        const err = new BacError(MessageName.UNNAMED, 'hello')
        const coerced = BacError.fromError(err)

        expect(assertIsBacError(coerced)).toBeTruthy()
        expect(assertIsBacWrappedError(coerced)).toBeFalsy()

        // console.log(`Object.keys(coerced) :>> `, Object.keys(coerced))

        expect(coerced).toHaveProperty('message', 'hello')
        expect(coerced).toHaveProperty('reportCode', MessageName.UNNAMED)
      })
      it('bacError with options 1', async () => {
        const err = new BacError(MessageName.UNNAMED, 'hello')
        const coerced = BacError.fromError(err, {reportCode: MessageName.ADDRESS_FORMAT_INVALID})

        expect(coerced).toHaveProperty('message', 'hello')
        expect(coerced).toHaveProperty('reportCode', MessageName.ADDRESS_FORMAT_INVALID)
      })
      it('bacError with options 2', async () => {
        const err = new BacError(MessageName.UNNAMED, 'hello')
        const coerced = BacError.fromError(err, {extra: {a: 'a'}})

        expect(coerced).toHaveProperty('message', 'hello')
        expect(coerced).toHaveProperty('extra', {a: 'a'})
      })

      it('bacErrorWrapper', async () => {
        const err = new BacError(MessageName.UNNAMED, 'hello')
        const errWrapped = new BacErrorWrapper(MessageName.UNNAMED, 'wrapped', err)
        const coerced = BacError.fromError(errWrapped)

        expect(coerced).toHaveProperty('message', expect.stringMatching('wrapped'))
        expect(coerced).toHaveProperty('reportCode', MessageName.UNNAMED)
      })
      it('bacErrorWrapper with options 1', async () => {
        const err = new BacError(MessageName.UNNAMED, 'hello')
        const errWrapped = new BacErrorWrapper(MessageName.UNNAMED, 'wrapped', err)
        const coerced = BacError.fromError(errWrapped, {reportCode: MessageName.ADDRESS_FORMAT_INVALID})

        expect(coerced).toHaveProperty('message', expect.stringMatching('wrapped'))
        expect(coerced).toHaveProperty('reportCode', MessageName.ADDRESS_FORMAT_INVALID)
      })
      it('bacErrorWrapper with options 2', async () => {
        const err = new BacError(MessageName.UNNAMED, 'hello')
        const errWrapped = new BacErrorWrapper(MessageName.UNNAMED, 'wrapped', err)
        const coerced = BacError.fromError(errWrapped, {extra: {a: 'a'}})

        expect(coerced).toHaveProperty('message', expect.stringMatching('wrapped'))
        expect(coerced).toHaveProperty('extra', {a: 'a'})
      })
    })
  })
  describe('BacErrorWrapper', () => {
    it('works normally', () => {
      const errWrappable = new BacError(MessageName.UNNAMED, 'hello1')
      const err = new BacErrorWrapper(MessageName.UNNAMED, 'hello2', errWrappable)

      expect(err.reportCode).toEqual(MessageName.UNNAMED)
      expect(err.message).toMatch(/hello2[\s]*Wrapped error:\n[\s]*Error:\s*hello1/)
      expect(err.extra).toBeUndefined()
    })
    it.skip('normal error with stack', async () => {
      const errWrappable1 = new BacError(MessageName.UNNAMED, 'hello1')
      ;(errWrappable1 as any).stack = getMockStack1('hello1')

      console.log(`errWrappable1.stack :>> `, errWrappable1.stack)
      console.log(`errWrappable1 :>> `, require('util').inspect(errWrappable1, {showHidden: false, depth: undefined, colors: true}))

      throw errWrappable1
    })
    it('handles stacks', () => {
      const errWrappable1 = new BacError(MessageName.UNNAMED, 'hello1')
      ;(errWrappable1 as any).stack = getMockStack1('hello1')
      const err1 = new BacErrorWrapper(MessageName.UNNAMED, 'hello2', errWrappable1)

      expect(err1.reportCode).toEqual(MessageName.UNNAMED)
      expect(err1.message).toMatch(/hello2[\s]*Wrapped error:\n[\s]*Error:\s*hello1/)

      /** wrapped stack replaces upper error stack */
      expect(err1.stack).toEqual(`Error: hello2
Wrapped error:
  Error: hello1
    at BlahService.method1  (/my-checkout/blah-service-1.tsx:184:26)
    at BlahService.method2  (/my-checkout/blah-service-2.tsx:184:26)`)
      expect(err1.extra).toBeUndefined()

      // const errWrappable2 = new BacError(MessageName.UNNAMED, 'hello1')
      // ;(errWrappable2 as any).stack = getMockStack1('hello1')
      // const err2 = new BacErrorWrapper(MessageName.UNNAMED, 'hello2', errWrappable1)

      // expect(err2.reportCode).toEqual(MessageName.UNNAMED)
      // expect(err2.message).toMatch(/hello2[\s]*Wrapped error:\n[\s]*Error:\s*hello1/)
      // expect(err2.extra).toBeUndefined()
    })
    it('nestable', () => {
      const errWrappable1 = new BacError(1, 'hello1')
      ;(errWrappable1 as any).stack = getMockStack1('hello1')
      const err1 = new BacErrorWrapper(2, 'hello2', errWrappable1)

      expect(err1.reportCode).toEqual(2)
      expect(err1.message).toMatch(/hello2[\s]*Wrapped error:\n[\s]*Error:\s*hello1/)
      /** wrapped stack replaces error stack of wrapper */
      expect(err1.stack).toEqual(`Error: hello2
Wrapped error:
  Error: hello1
    at BlahService.method1  (/my-checkout/blah-service-1.tsx:184:26)
    at BlahService.method2  (/my-checkout/blah-service-2.tsx:184:26)`)
      expect(err1.extra).toBeUndefined()

      // const errWrappable2 = new BacError(MessageName.UNNAMED, 'hello1')
      // ;(errWrappable2 as any).stack = getMockStack1('hello1')
      const err2 = new BacErrorWrapper(3, 'hello3', err1)

      // console.log(`err2.stack :>> `, err2.stack)
      // console.log(`err2 :>> `, require('util').inspect(err2, {showHidden: false, depth: undefined, colors: true}))

      expect(err2.reportCode).toEqual(3)
      expect(err2.message).toMatch(/hello3[\s]*Wrapped error:\n[\s]*Error:\s*hello2[\s]*Wrapped error:\n[\s]*Error:\s*hello1/)
      expect(err2.extra).toBeUndefined()
      /** original stack remains despite nested wraps */
      expect(err2.stack).toEqual(`Error: hello3
Wrapped error:
  Error: hello2
  Wrapped error:
    Error: hello1
      at BlahService.method1  (/my-checkout/blah-service-1.tsx:184:26)
      at BlahService.method2  (/my-checkout/blah-service-2.tsx:184:26)`)
      expect(err1.extra).toBeUndefined()
    })
    it('accepts extra', () => {
      const errWrappable = new BacError(MessageName.UNNAMED, 'hello1')
      const err = new BacErrorWrapper(MessageName.UNNAMED, 'hello2', errWrappable, {extra: {a: 'a'}})

      expect(err.reportCode).toEqual(MessageName.UNNAMED)
      expect(err.extra).toEqual({a: 'a'})
      expect(err.message).toMatch(/hello2[\s]*Wrapped error:\n[\s]*Error:\s*hello1/)
    })
    // it('compatible with clipanion', () => {
    //   const errWrappable = new BacError(MessageName.UNNAMED, 'hello1')
    //   const err = new BacErrorWrapper(MessageName.UNNAMED, 'hello2', errWrappable, {extra: {a: 'a'}, type: 'clipanionGeneral'})

    //   expect(err.type).toEqual('clipanionGeneral')
    //   expect(err.reportCode).toEqual(MessageName.UNNAMED)
    //   expect(err.message).toMatch(/hello2[\s]*Wrapped error:\n[\s]*Error:\s*hello1/)
    // })
  })
})
