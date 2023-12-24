import { fsUtils } from '..'

describe('fs-utils', () => {
  it('converts to fs-friendly format', () => {
    const testMap: Array<[string, string]> = [
      [`/i/am/a/file.map`, '_i_am_a_file_map']
    ]
    for (const [dirty, expected] of testMap) {
      expect(fsUtils.sanitise(dirty)).toEqual(expected)
    }
  })
})
