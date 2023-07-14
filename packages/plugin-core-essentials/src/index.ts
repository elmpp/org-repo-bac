import { Plugin } from "@business-as-code/core";
// import { beforeInitialiseWorkspace } from './hooks/before-initialise-workspace'
// import { initialiseWorkspace } from './hooks/initialise-workspace'
import { MyService, YourService } from "./services";
// import {InitialiseWorkspaceLifecycle, ConfigureWorkspaceLifecycle} from './lifecycles'
import {
  InitialiseWorkspaceCoreLifecycle,
  RunWorkspaceMoonLifecycle,
  RunWorkspaceNodeLifecycle,
  RunProjectNodeLifecycle,
} from "./lifecycles";

export const plugin = {
  services: [YourService, MyService],
  lifecycles: [
    InitialiseWorkspaceCoreLifecycle,
    RunWorkspaceMoonLifecycle,
    RunWorkspaceNodeLifecycle,
    RunProjectNodeLifecycle,
    // ConfigureWorkspaceLifecycle,
  ],
  // initialise: (initialiseOptions) => {
  //   beforeInitialiseWorkspace(initialiseOptions)
  //   initialiseWorkspace(initialiseOptions)
  // },
} satisfies Plugin;
