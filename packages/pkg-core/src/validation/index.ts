import { moonQueryProjects } from './moon-query-projects'
import * as configValidators from './config'

export type {
  Config,
} from './config'

export const validators = {
  moon: {
    queryProjects: moonQueryProjects,
  },
  config: configValidators,
}

// export * from './config'

