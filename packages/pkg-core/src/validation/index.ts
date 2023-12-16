import { moonQueryProjects } from './moon-query-projects'
import * as config from './config'

export type {
  Config,
  ConfigConfigured,
} from './config'

export const validators = {
  moon: {
    queryProjects: moonQueryProjects,
  },
  config,
}

// export * from './config'

