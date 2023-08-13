import { logLevelMatching } from "../index";

describe('index', () => {
  it('logLevelMatching', () => {

    expect(logLevelMatching('info', 'debug', false)).toBeFalsy()
    expect(logLevelMatching('debug', 'debug', false)).toBeTruthy()
    expect(logLevelMatching('debug', 'error', false)).toBeTruthy()
    expect(logLevelMatching('info', 'info', false)).toBeTruthy()
    expect(logLevelMatching('fatal', 'fatal', false)).toBeTruthy()

    expect(logLevelMatching('debug', 'info', false)).toBeTruthy()

    //-- --json suppresses all below error
    expect(logLevelMatching('info', 'debug', true)).toBeFalsy()
    expect(logLevelMatching('debug', 'debug', true)).toBeFalsy()
    expect(logLevelMatching('info', 'info', true)).toBeFalsy()
    expect(logLevelMatching('info', 'error', true)).toBeTruthy()
    expect(logLevelMatching('fatal', 'fatal', true)).toBeTruthy()

    expect(logLevelMatching('debug', 'info', true)).toBeFalsy()

  })
})
