import { addr, AddressPackageIdent } from "@business-as-code/address";
import { describe, expect, it } from 'bun:test';
import { expectTypeOf } from "expect-type";
import { ValueOf } from "../../__types__";
import { objectMapAndFilter, objectMapAndFilterPromise } from "../object-utils";


const mockNormalStateObject = {
  workrootPackageManager: {
    workrootPackageManagerYarn2Pnp: {
      enableColors: true,
      nodeLinker: 'pnp',
      npmRegistry: 'http://npm.org',
    },
  },
  workrootMeta: {
    workrootMetaPackage: {
      ident: addr.parsePackage('@monotonous/blah') as AddressPackageIdent,
    },
  },
  additionalPropertyToEnsureNotTreatedAsStackLevelState: {
    blah: 'meh',
  },
} as const



describe('objectMapAndFilter', () => {
  describe('standard Record inputs', () => {
    it('maintains types on standard objects when returning same type', async () => {
      const resourceState = objectMapAndFilter(mockNormalStateObject, (val, key, idx) => {
        expectTypeOf(key).toEqualTypeOf<'workrootMeta' | 'workrootPackageManager' | 'additionalPropertyToEnsureNotTreatedAsStackLevelState'>()
        if (key === 'workrootPackageManager') {
          // key is in lockstep with val
          expectTypeOf(key).toEqualTypeOf<'workrootPackageManager'>()
          // expectTypeOf(val).toEqualTypeOf(typeof mockStateObject.workrootPackageManager)
          // expect(val.workrootPackageManagerYarn2Pnp.nodeLinker === 'pnp').toEqual(true) // types are maintained
          expect(key === 'workrootPackageManager').toEqual(true)
          expect(idx === 0).toEqual(true)
        }

        return val
      })

      expectTypeOf(
        resourceState.workrootPackageManager.workrootPackageManagerYarn2Pnp.enableColors
      ).toEqualTypeOf<true>() // no change

      expectTypeOf(resourceState).toEqualTypeOf(mockNormalStateObject) // no change when returning same type
    })
    it('ts santity check with keys/valueof', async () => {
      function mapper<Obj extends Record<string, any>, Key extends keyof Obj, Val extends Obj[Key]>(
        obj: Obj,
        key: Key,
        val: Val
      ) {
        if (key === 'a') {
        }
        if (key == 'b') {
        }
      }
      // @ts-expect-error: val incorrect
      mapper({a: {b: 'b'}} as const, 'a', {b: 'incorrect'})
    })
    it('maintains types on standard objects when returning different types', async () => {
      const resourceState = objectMapAndFilter(mockNormalStateObject, (val, key, idx) => {
        return {
          workrootPackageManagerYarn2Pnp: {
            enableColors: '-',
            nodeLinker: '-',
            npmRegistry: '-',
          },
        }
      })

      expectTypeOf(
        resourceState.workrootPackageManager.workrootPackageManagerYarn2Pnp.enableColors
      ).toEqualTypeOf<string>() // resourceState picks up the returnType of the iteratee
      expectTypeOf<typeof resourceState>().not.toEqualTypeOf<typeof mockNormalStateObject>() // shows that it picks up iteratee return when mapping standard states
    })
    it('maintains types on standard objects when returning different types including functions', async () => {
      const noop = (anArg: string) => { return true as any; }
      const resourceState = objectMapAndFilter(mockNormalStateObject, (val, key, idx) => {
        return noop
      })

      expectTypeOf<
        ValueOf<typeof resourceState>
      >().toEqualTypeOf(noop) // resourceState picks up the returnType of the iteratee

      expectTypeOf<typeof resourceState>().not.toEqualTypeOf<typeof mockNormalStateObject>() // shows that it picks up iteratee return when mapping standard states
    })
    it('maintains types on standard objects when skipping', async () => {
      const resourceState = objectMapAndFilter(mockNormalStateObject, (val, key, idx) => {

        return objectMapAndFilter.skip
      })

      expectTypeOf(
        resourceState?.workrootPackageManager?.workrootPackageManagerYarn2Pnp.enableColors
      ).toEqualTypeOf<true>() // resourceState picks up the returnType of the iteratee but partial

      expectTypeOf<typeof resourceState>().toEqualTypeOf<typeof mockNormalStateObject>() // atm, we don't apply Partial<>
    })
  })
})

describe('objectMapAndFilterPromise', () => {


  describe('standard Record inputs', () => {
    it('maintains types on standard objects when returning same type', async () => {
      const resourceState = await objectMapAndFilterPromise(mockNormalStateObject, async (val, key, idx) => {
        expectTypeOf(key).toEqualTypeOf<'workrootMeta' | 'workrootPackageManager' | 'additionalPropertyToEnsureNotTreatedAsStackLevelState'>()
        if (key === 'workrootPackageManager') {
          // key is in lockstep with val
          expectTypeOf(key).toEqualTypeOf<'workrootPackageManager'>()
          // expectTypeOf(val).toEqualTypeOf(typeof mockStateObject.workrootPackageManager)
          // expect(val.workrootPackageManagerYarn2Pnp.nodeLinker === 'pnp').toEqual(true) // types are maintained
          expect(key === 'workrootPackageManager').toEqual(true)
          expect(idx === 0).toEqual(true)
        }

        return val
      })

      expectTypeOf(
        resourceState.workrootPackageManager.workrootPackageManagerYarn2Pnp.enableColors
      ).toEqualTypeOf<true>() // no change

      expectTypeOf(resourceState).toEqualTypeOf(mockNormalStateObject) // no change when returning same type
    })
    it('ts santity check with keys/valueof', async () => {
      function mapper<Obj extends Record<string, any>, Key extends keyof Obj, Val extends Obj[Key]>(
        obj: Obj,
        key: Key,
        val: Val
      ) {
        if (key === 'a') {
        }
        if (key == 'b') {
        }
      }
      // @ts-expect-error: val incorrect
      mapper({a: {b: 'b'}} as const, 'a', {b: 'incorrect'})
    })
    it('maintains types on standard objects when returning different types', async () => {
      const resourceState = await objectMapAndFilterPromise(mockNormalStateObject, async (val, key, idx) => {
        return {
          workrootPackageManagerYarn2Pnp: {
            enableColors: '-',
            nodeLinker: '-',
            npmRegistry: '-',
          },
        }
      })

      expectTypeOf(
        resourceState.workrootPackageManager.workrootPackageManagerYarn2Pnp.enableColors
      ).toEqualTypeOf<string>() // resourceState picks up the returnType of the iteratee
      expectTypeOf<typeof resourceState>().not.toEqualTypeOf<typeof mockNormalStateObject>() // shows that it picks up iteratee return when mapping standard states
    })
    it('maintains types on standard objects when returning different types including functions', async () => {
      const noop = (anArg: string) => { return true as any; }
      const resourceState = await objectMapAndFilterPromise(mockNormalStateObject, async (val, key, idx) => {
        return noop
      })

      expectTypeOf<
        ValueOf<typeof resourceState>
      >().toEqualTypeOf(noop) // resourceState picks up the returnType of the iteratee

      expectTypeOf<typeof resourceState>().not.toEqualTypeOf<typeof mockNormalStateObject>() // shows that it picks up iteratee return when mapping standard states
    })
    it('maintains types on standard objects when skipping', async () => {
      const resourceState = await objectMapAndFilterPromise(mockNormalStateObject, async (val, key, idx) => {

        return objectMapAndFilterPromise.skip
      })

      expectTypeOf(
        resourceState?.workrootPackageManager?.workrootPackageManagerYarn2Pnp.enableColors
      ).toEqualTypeOf<true | undefined>() // resourceState picks up the returnType of the iteratee but partial

      expectTypeOf<typeof resourceState>().not.toEqualTypeOf<typeof mockNormalStateObject>() // shows that it picks up iteratee return when mapping standard states
    })
  })
})