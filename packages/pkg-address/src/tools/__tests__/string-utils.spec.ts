import { arrayIntersection } from "../string-utils"

describe('string-utils', () => {
  it('arrayIntersection', async () => {
    expect(arrayIntersection(['blah'], ['meh'])).toEqual(expect.objectContaining({
      matched: [],
      unmatched: ['blah'],
    }))
    expect(arrayIntersection(['blah', 'hello'], ['meh', 'hello'])).toEqual(expect.objectContaining({
      matched: ['hello'],
      unmatched: ['blah'],
    }))
    expect(arrayIntersection(['hello'], ['blah', 'hello'])).toEqual(expect.objectContaining({
      matched: ['hello'],
      unmatched: [],
    }))
    expect(arrayIntersection([], ['blah', 'hello'])).toEqual(expect.objectContaining({
      matched: [],
      unmatched: [],
    }))
  })
})