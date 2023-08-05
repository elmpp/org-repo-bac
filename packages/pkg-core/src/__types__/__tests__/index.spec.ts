import { logLevelMatching } from "../index";

describe('index', () => {
  it('logLevelMatching', () => {

    expect(logLevelMatching('info', 'debug')).toBeFalsy()
    expect(logLevelMatching('debug', 'debug')).toBeTruthy()
    expect(logLevelMatching('info', 'info')).toBeTruthy()
    expect(logLevelMatching('fatal', 'fatal')).toBeTruthy()

    expect(logLevelMatching('debug', 'info')).toBeTruthy()

  })
})
