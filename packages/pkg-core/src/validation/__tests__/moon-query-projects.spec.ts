import { addr } from "@business-as-code/address"
import { xfs } from "@business-as-code/fslib"
import { moonQueryProjects } from "../moon-query-projects"
import { describe, it, jest, expect } from "bun:test";

/**
 projectGraph here refers to the output files of moon at `.moon/cache/state/projectGraph.json`

 Bac will parse the outputs of `moon query projects`. Find that in ./query-projects.spec.ts
 */
describe('moon-query-projects', () => {
  describe.skip('older moon versions fail validation now since 1.8.3', () => {
    describe('1.5.1', () => {
      it('validates a single-project moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.5.1/language=typescript.json')).address)
        // console.log(`projectGraphJson :>> `, projectGraphJson)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
      it('validates a full moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.5.1/language=typescript-full.json')).address)
        // console.log(`projectGraphJson :>> `, projectGraphJson)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
    })
    describe('1.6.0', () => {
      it('validates a single-project moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.6.0/language=typescript.json')).address)
        // console.log(`projectGraphJson :>> `, projectGraphJson)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
      it('validates a full moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.6.0/language=typescript-full.json')).address)
        // console.log(`projectGraphJson :>> `, projectGraphJson)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
    })
    describe('1.8.3', () => {
      it('validates a single-project moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.8.3/language=typescript.json')).address)
        // console.log(`projectGraphJson :>> `, projectGraphJson)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
      it('validates a full moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.8.3/language=typescript-full.json')).address)
        // console.log(`projectGraphJson :>> `, projectGraphJson)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
    })
    describe('1.9.3', () => {
      it('validates a single-project moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.9.3/language=typescript.json')).address)
        // console.log(`projectGraphJson :>> `, projectGraphJson)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
      it('validates a full moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.9.3/language=typescript-full.json')).address)
        // console.log(`projectGraphJson :>> `, projectGraphJson)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
    })
    describe('1.10.1', () => {
      it('validates a single-project moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.10.1/language=typescript.json')).address)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
      it('validates a full moon projectGraph.json file', async () => {
        const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.10.1/language=typescript-full.json')).address)
        expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
      })
    })
  })
  describe('1.18.3', () => {
    it('validates a single-project moon projectGraph.json file', async () => {
      const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.18.3/language=typescript.json')).address)
      expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
    })
    it('validates a full moon projectGraph.json file', async () => {
      const projectGraphJson = await xfs.readJsonPromise(addr.pathUtils.resolve(addr.parsePath(__dirname), addr.parsePath('./etc/query/projects/v1.18.3/language=typescript-full.json')).address)
      expect(moonQueryProjects.parse(projectGraphJson)).toBeTruthy()
    })
  })

})
