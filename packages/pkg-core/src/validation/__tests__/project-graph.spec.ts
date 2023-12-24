import { addr } from '@business-as-code/address'
import { xfs } from '@business-as-code/fslib'
import { moonProjectGraph } from '../moon-project-graph'

/**
 projectGraph here refers to the output files of moon at `.moon/cache/state/projectGraph.json`

 Bac will parse the outputs of `moon query projects`. Find that in ./query-projects.spec.ts
 */
describe('project-graph', () => {
  describe('1.4.0', () => {
    it('validates a single-project moon projectGraph.json file', async () => {
      const projectGraphJson = await xfs.readJsonPromise(
        addr.pathUtils.resolve(
          addr.parsePath(__dirname),
          addr.parsePath('./etc/project-graph/v1.4.0/projectGraph-valid.json')
        ).address
      )
      // console.log(`projectGraphJson :>> `, projectGraphJson)
      expect(moonProjectGraph.parse(projectGraphJson)).toBeTruthy()
    })
    it('validates a full moon projectGraph.json file', async () => {
      const projectGraphJson = await xfs.readJsonPromise(
        addr.pathUtils.resolve(
          addr.parsePath(__dirname),
          addr.parsePath(
            './etc/project-graph/v1.4.0/projectGraph-valid-full.json'
          )
        ).address
      )
      // console.log(`projectGraphJson :>> `, projectGraphJson)
      expect(moonProjectGraph.parse(projectGraphJson)).toBeTruthy()
    })
  })
  describe('1.5.1', () => {
    it('validates a single-project moon projectGraph.json file', async () => {
      const projectGraphJson = await xfs.readJsonPromise(
        addr.pathUtils.resolve(
          addr.parsePath(__dirname),
          addr.parsePath('./etc/project-graph/v1.5.1/projectGraph-valid.json')
        ).address
      )
      // console.log(`projectGraphJson :>> `, projectGraphJson)
      expect(moonProjectGraph.parse(projectGraphJson)).toBeTruthy()
    })
    it('validates a full moon projectGraph.json file', async () => {
      const projectGraphJson = await xfs.readJsonPromise(
        addr.pathUtils.resolve(
          addr.parsePath(__dirname),
          addr.parsePath(
            './etc/project-graph/v1.5.1/projectGraph-valid-full.json'
          )
        ).address
      )
      // console.log(`projectGraphJson :>> `, projectGraphJson)
      expect(moonProjectGraph.parse(projectGraphJson)).toBeTruthy()
    })
  })
})
