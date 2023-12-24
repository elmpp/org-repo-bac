import { BacError } from '@business-as-code/error'
import { DoExecOptions, DoExecOptionsLite, doExec } from './exec-utils'
import { Project } from '../validation/common'
import { AddressPathAbsolute, addr } from '@business-as-code/address'
import { Context, Result } from '../__types__'

type ModeUnion = 'allStopOnError' | 'all' | 'any'

export type PmapMapper<NewElement, Element> = (
  element: Element,
  index: number
  // ) => Promise<PmapElementResult<NewElement, Element>>
) => Promise<
  | PmapElementResultFulfilled<NewElement, Element>
  | PmapElementResultRejected<NewElement, Element>
  | PmapElementResultSkipped<Element>
>
// ) => Promise<PmapElementInput<NewElement>>
// ) => Promise<PmapElementResultFulfilled<NewElement, Element> | PMapElementResultSkipped<Element>>
// ) => Promise<NewElement | PMapElementResultSkipped<Element>>

// type Element = Project
// type NewElement = Awaited<ReturnType<typeof doExec>>

/**
 Like Promise.all but with concurrency limiting.

  - success/error are returned cononically - see {@linkcode #pmapElementResult }
  - regardless of mode, the error message of the failing promise will be captured
  - when terminated early, return elements will be filled with reserved Symbol() values
  - supports different modes. Promises will always resolve

 {@linkInspiration https://tinyurl.com/y7om4zfu | p-map}
 */
export const doMapExec = async (
  options: {
    projects: Iterable<Project>
    command: string
    execOptions: DoExecOptionsLite & { context: Context }
    mapOptions?: { concurrency: number; mode: ModeUnion }
  }
  // // iterable: Iterable<Element>,
  // // // mapper: PmapMapper<NewElement, Element>,
  // // options: Parameters<typeof doExec>
  // {concurrency = Infinity, mode = 'allStopOnError'}: {concurrency?: number; mode?: ModeUnion} = {}
): Promise<
  Result<
    PmapElementResult<Awaited<ReturnType<typeof doExec>>, Project>[],
    { error: BacError }
  >
> => {
  return new Promise((resolve) => {
    // if (typeof mapper !== 'function') {
    //   throw new TypeError('Mapper function is required')
    // }

    const {
      projects,
      command,
      execOptions,
      mapOptions: { concurrency = Infinity, mode = 'allStopOnError' } = {}
    } = options

    if (
      !(
        (Number.isSafeInteger(concurrency) || concurrency === Infinity) &&
        concurrency >= 1
      )
    ) {
      throw new TypeError(
        `Expected \`concurrency\` to be an integer from 1 and up or \`Infinity\`, got \`${concurrency}\` (${typeof concurrency})`
      )
    }

    const result: PmapElementResult<
      Awaited<ReturnType<typeof doExec>>,
      Project
    >[] = []
    // const errors = []
    const iterator = projects[Symbol.iterator]()
    /**
     Flag to prevent further iteration. `finishedValue` settable at same time and will be assigned
     to current and any currently-parallelised iterations.
     The `finishedValue` denotes the result of the Run so must be assigned correctly when stopping
     */
    // let isFinished = false
    let finishedValue: PmapElementResultSkipped<Project>
    let isIterableDone = false
    let resolvingCount = 0
    let currentIndex = 0

    const next = () => {
      const nextItem = iterator.next()
      const index = currentIndex
      currentIndex++

      // console.log(`nextItem, index :>> `, nextItem, index)

      if (nextItem.done) {
        isIterableDone = true

        if (resolvingCount === 0) {
          // setImmediate(() => resolve(result)) // all pmap callbacks seem to be awaited with event loop wait
          setTimeout(() => resolve(result), 1000)
          // resolve(result)
          // if (!stopOnError && errors.length !== 0) {
          // 	reject(new AggregateError(errors))
          // } else {
          // 	resolve(result)
          // }
        }

        return
      }

      resolvingCount++
      ;(async () => {
        if (finishedValue) {
          result[index] = doMapExec.stop(
            finishedValue.value,
            nextItem as any,
            finishedValue.reason
          ) // pad out the response array with our symbol after explicit stop/error
        } else {
          const project = await nextItem.value

          // deepClone fixes previous results being mutated
          // result[index] = deepClone(await pmapElementResult<NewElement, Element>(
          // 	mapper(element, index), // we want to pull a promise here
          // 	element
          // ))
          // result[index] = await mapper(element, index)
          result[index] = await doExec({
            options: {
              ...execOptions,
              cwd: addr.parsePath(project.root) as AddressPathAbsolute
              // logLevel: 'debug',
            },
            command
          })
          // result[index] = await pmapElementResult<NewElement, Element>(
          // 	mapper(element, index), // we want to pull a promise here
          // 	element
          // )

          // console.debug(`index :>> `, index)
          // console.debug(`element :>> `, require('util').inspect(element, {showHidden: false, depth: undefined, colors: true}))
          // console.debug(`result[index] :>> `, require('util').inspect(result, {showHidden: false, depth: undefined, colors: true}))

          if (result[index].result === 'skipped') {
            // no special early finishing
          }

          // an error occurred
          if (result[index].result === 'rejected') {
            if (mode === 'allStopOnError') {
              // isFinished = true
              finishedValue = {
                value: 1,
                reason: `A rejected process was encountered with mode '${mode}'`,
                key: project,
                result: 'skipped'
              }
            }
          }

          if (result[index].result === 'fulfilled') {
            if (mode === 'any') {
              // isFinished = true
              finishedValue = {
                value: 0,
                reason: `A completed process was encountered with mode '${mode}'`,
                key: project,
                result: 'skipped'
              }
            }
          }
        }

        resolvingCount--
        next()
      })()
      // ;(async () => {
      //   if (finishedValue) {

      //     result[index] = pmap.stop(finishedValue, nextItem) // pad out the response array with our symbol after explicit stop/error
      //   }
      //   else {
      //     const element = await nextItem.value

      //     result[index] = await pmapElementResult<NewElement, Element>(mapper(element, index), element)
      //     if (result[index].result === 'skipped') {
      // 			// isFinished = true                                                          // allow special early return in subsequent loops
      // 			finishedValue = result[index].value as PMapElementResultSkipped['value']   // allow catching earlier on
      // 		}

      //     // an error occurred
      //     if (result[index].result === 'rejected') {
      //       if (mode === 'allStopOnError') {
      // 				// isFinished = true
      // 				finishedValue = {
      // 					value: 1,
      // 					reason: `A rejected process was encountered with mode '${mode}'`
      // 				}
      //       }
      //     }

      //     if (result[index].result === 'fulfilled') {
      //       if (mode === 'any') {
      // 				// isFinished = true
      // 				finishedValue = {
      // 					value: 0,
      // 					reason: `A completed process was encountered with mode '${mode}'`
      // 				}
      //       }
      //     }
      //   }

      //   resolvingCount--
      //   next()
      // })()
    }

    // for (let i = 0; i < Math.min(concurrency, iterableLength); i++) {
    for (let i = 0; i < concurrency; i++) {
      next()

      if (isIterableDone) {
        break
      }
    }
  })
    .then((resultStack) => {
      return {
        success: true,
        res: resultStack
      }
    })
    .catch((e) => {
      return {
        success: false,
        res: { error: BacError.fromError(e as Error) }
      }
    })
}

/**
 Same as p-reflect but with skip
  - https://tinyurl.com/yb3wg97a
 */
export type PmapElementResultSkipped<Element> = {
  result: 'skipped'
  key: Element
  value: number
  /** Allows explanation of stoppage */
  reason: string
  // value: {
  // 	/** the exitCode. Can be 0...n */
  // }
}
export type PmapElementResultRejected<NewElement, Element> = {
  result: 'rejected'
  key: Element
  value: NewElement
  error: BacError
  // error: MntErrorWrapper<{outputs: Outputs; stackName: Mnt.MapUtil.StackKeys}>
  /** Allows explanation of error */
  reason: string
  // value: {
  // }
}
export type PmapElementResultFulfilled<NewElement, Element> = {
  result: 'fulfilled'
  key: Element
  value: NewElement
  reason: string
  // value: {
  // }
}
export type PmapElementResult<NewElement, Element> =
  | PmapElementResultFulfilled<NewElement, Element>
  | PmapElementResultRejected<NewElement, Element>
  | PmapElementResultSkipped<Element>

// export type PmapElementInput<NewElement> = {
// 	// result: 'fulfilled' | 'skipped' | 'rejected'
// 	// value: Element | number
// 	result: 'skipped'
// 	// value: {
// 		value: number // cannot reconstruct a NewElement here
// 		reason: string
// 	// }
// } | {
// 	result: 'fulfilled'
// 	// value: {
// 		value: NewElement
// 		reason: string
// 	// }
// } | PmapElementInputRejected
// export type PmapElementInputRejected = {
// 	result: 'rejected'
// 	// value: {
// 		value: {
// 			error: MntErrorWrapper<{outputs: Outputs, stackName: Mnt.MapUtil.StackKeys}>
// 			// error: Error
// 			// outputs: {

// 			// },
// 		}
// 		reason: string
// 	// }
// }

// const pmapElementResult = async <NewElement, Element>(promise: Promise<PmapElementInput<NewElement>>, key: Element): Promise<PmapElementResult<NewElement, Element>>  => {
// // const pmapElementResult = async <NewElement, Element>(promise: Promise<Element | PMapElementResultSkipped<Element>>, key: Element): Promise<PmapElementResult<NewElement, Element>>  => {

//   try {
// 		const unwrapped = await promise
//     // if ((value as PMapElementResultSkipped<Element>)?.result === 'skipped') return value as PMapElementResultSkipped<Element>

// 		// return {
//     //   result: 'fulfilled',
// 		// 	key,
// 		// 	value: {
// 		// 		value: value as Element,
// 		// 		reason: `Process completed`,
// 		// 	},
// 		// }

// 		const unwrappedResult = unwrapped.result // newer TS version pls..
// 		switch (unwrappedResult) {
// 			case 'rejected':
// 				return identity<PMapElementResultRejected<NewElement, Element>>({
// 					result: 'rejected',
// 					reason: unwrapped.reason ?? 'Process failed',
// 					value: unwrapped.value,
// 					key,
// 				})
// 			case 'fulfilled':
// 				return identity<PmapElementResultFulfilled<NewElement, Element>>({
// 					result: 'fulfilled',
// 					reason: unwrapped.reason ?? 'Process completed',
// 					value: unwrapped.value,
// 					key,
// 				})
// 			case 'skipped':
// 				return identity<PMapElementResultSkipped<Element>>({
// 					result: 'skipped',
// 					reason: unwrapped.reason ?? 'Process skipped',
// 					value: unwrapped.value,
// 					key,
// 				})
// 			default:
// 				assertUnreachable(unwrappedResult)
// 		}

// 		// const fulfilledResult: PmapElementResultFulfilled<NewElement, Element> = {
// 		// 	result: unwrapped.result,
// 		// 	reason: 'Process completed',
// 		// 	value: unwrapped.value,
// 		// 	key,
// 		// }

// 		// return fulfilledResult
// 	// } catch (rejectionResult /** PhaseResult */) {  // this error should be an Element as we throw
// 	/**
// 		We handle (only unexpected) process errors in ProjectScheduler#processMap. Therefore, errors here are super-unexpected and
// 		really mean a bug inside pmap/
// 	 */
// 	} catch (error) {

// 		if (!assertIsMntWrappedError<{outputs: Outputs, stackName: Mnt.MapUtil.StackKeys}>(error)) {
// 			throw new Error(`Only Errors may be thrown within pmap. This is intended for unexpected scenarios and will results in 'rejected' results. For expected 'rejection' results, please return a RejectionInput object`)
// 		}

// 		// console.log(`rejectionResult :>> `, rejectionResult, typeof rejectionResult)
// 		// console.log(`rejectionResult :>> `, require('util').inspect(rejectionResult, {showHidden: false, depth: undefined, colors: true}))

// 		// if (!assertIsProjectLevelState(rejectionResult)) {
// 		// 	const trace = createTrace()

// 		// 	throw new Error(`Only instances of PhaseResult may be thrown during pmap. Ensure error handling is sufficient`)
// 		// }

// 		return {
//       result: 'rejected',
// 			key,
// 			reason: `Pmap encountered an unhandled exception. To signal a failing state, return a structure satifying 'PmapElementInputRejected'.`,
// 			// reason: `Process was rejected`,
// 			value: {
// 				error: error,
// 				// errorOutput: error.message,
// 			},
// 		}

// 		// throw new Error(`Pmap encountered an unhandled exception. To signal a failing state, return a structure satifying 'PmapElementInputRejected'`)
// 	}
// }
// denotes elements that have been explicitly skipped
doMapExec.stop = <Element>(
  value: PmapElementResultSkipped<Element>['value'],
  key: Element,
  reason?: string
): PmapElementResultSkipped<Element> => ({
  result: 'skipped',
  key,
  value,
  reason: reason ?? 'Process was skipped'
})

// export const asFulfilled = <NewElement, Element>(
//   el: PmapElementResult<NewElement, Element> | undefined
// ): PmapElementResultFulfilled<NewElement, Element> | undefined => {
//   if (el?.result === 'fulfilled') return el
// }

// const identity = <T extends any>(value: T) => value

// export function assertIsPhaseResult(obj: any): asserts obj is PhaseResult {

// }
