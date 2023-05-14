import { Plugin } from '@business-as-code/core'
import { beforeInitialiseWorkspace } from './hooks/before-initialise-workspace'
import { initialiseWorkspace } from './hooks/initialise-workspace'
import {MyService, YourService} from './services'

export const plugin = {
  services: [
    YourService,
    MyService,
  ],
  initialise: (initialiseOptions) => {
    beforeInitialiseWorkspace(initialiseOptions)
    initialiseWorkspace(initialiseOptions)
  },
} satisfies Plugin
