export enum MessageName {
  UNNAMED = 0,
  PACKAGE_RESOLVE_FAIL = 1, // mention how Mnt depends upon 'root' being the name of the root package in many instances
  FS_PATH_FORMAT_ERROR = 2, // an FS path has been incorrectly encountered. Give examples of format. e.g. init-workspace#path
  // ACTION_SUCCESS = 1, // a special code that signifies completion of an action. Will be collated by the Doctor for display (remember it uses buffered reports). May not be formatted with a hyperlink
  // TEST_ENV = 3, // ignorable message that is used within tests
  // PLUGIN_INSTALLATION_UNDECLARED = 10,
  // PLUGIN_INSTALLATION_UNRESOLVED = 11,
  // EXCEPTION = 12, // code used from report.reportException. General (unhandled) purpose exception has been encountered
  // PROJECT_NOT_FOUND = 14,
  // DATASTORE_CONNECTION = 15,
  // DATASTORE_MIGRATION_RETARDATION = 16,
  // DATASTORE_QUERY = 17,
  // DATASTORE_QUERY_SLOW = 18,
  // DATASTORE_MIGRATION_EXECUTED = 19,
  // DATASTORE_MIGRATION_FIRST = 20,
  // DATASTORE_MIGRATION_UP_TO_DATE = 21,
  // DATASTORE_MIGRATION_SCHEDULED = 22,
  // PACKAGES_OUTSIDE_PACKAGE_PATHS = 23,
  // CACHE_STATE_LOGIC_FAIL = 24,
  // CACHE_STATE_UNINITIALIZED = 25,  // this is more widely used than the "uninitialised" suggests. Perhaps broaden it. Also thrown when cache entity is fetched but not found
  // CACHE_STATE_INVALID = 26,
  // PROJECT_ORPHANED_WORKTREEWORKSPACE = 27,
  // CACHE_STATE_EMPTY = 28,
  // PACKAGE_MANAGER_PARSE = 29,
  // CWD_LOGIC_ERROR = 30,   // 1) --projectCwd should always be set when outside a project cwd. 2) Non-workroot stack executed in a noProject scenario
  // EXEC_VERBOSE = 31,
  // SUPPORT_CONTEXT = 32,
  // // SUPPORT_CONTEXT = 33,
  // PACKAGE_ACTIVE_DEPENDENCY = 34,
  // PACKAGE_CONTEXT_UNINITIATED = 35,
  // PACKAGE_FS_NOT_FOUND = 35,
  // SERVICE_UNINITIATED = 37,
  // GENERAL_LOGIC_ERROR = 38,
  // TEMPLATE_COMPILE = 39,
  // EXEC_SERVICE = 40,
  // GENERAL_SERVICE_ERROR = 41,
  // ENVIRONMENT_GENERAL = 42,
  // ENVIRONMENT_GIT_BINARY = 42,
  // UNCOMMITTED_CHANGES = 43, // Run with MNT_VERBOSITY=1 to see uncommitted changes
  // COMMAND_USAGE_PACKAGE = 44, // include https://yarnpkg.com/features/protocols in the docs
  // FS_OUT_BOUNDS = 45,
  // MISMATCHED_MNT_VERSIONS = 46,
  // UNEXPECTED_EXEC_PATH = 47,
  // BOOTSTRAP_GENERAL_ERROR = 48,
  // // SUPPORT_CONTEXT = 39,
  // PATH_FORMAT_ERROR = 50,
  // PROJECT_LIB_ERROR = 51,
  // PACKAGE_SUBREPO_NO_CACHE = 52,
  // SUBREPO_SYNC_ERROR = 53,
  // SUBREPO_LOGIC_ERROR = 54,
  // // INK_UNHANDLED_ERROR = 55,
  // PACKAGE_RESOLVE_FAIL = 57, // mention how Mnt depends upon 'root' being the name of the root package in many instances
  // SERVICE_UNREGISTERED = 58,
  // SERVICE_UNINITIALISABLE = 59,
  // FORM_INVALID_CONFIG = 60,
  // UNCOMMITTED_MNT_CHANGES = 61, // Run with MNT_VERBOSITY=1 to see uncommitted changes
  // RCFILE_SETTING_CHANGE = 62,
  // TEMPLATE_PROCESS_NAMESPACE = 63,
  // DOCTOR_COMPLETE = 64, // this allows doctor to curtail process. It's not an error state and should be swallowed
  // CONFIGURATION_ERROR = 65, // catch all error for when values encountered that likely came from bad rcfile/plugin configuration. Just link to the docs somewhere.
  // QUERY_FORMAT_ERROR = 66,  // to include: parameters placeholders (:value) not supplied; query unparseable etc. Include Typeorm links https://typeorm.io/#/select-query-builder/using-parameters-to-escape-data
  // PACKAGE_REQUIRED_ERROR = 67, // command cannot continue without a package context - 1) package query supplied return nothing. Link to package-query docs. 2) Package Query returning packages other than the stackConfig tier (only supplied recipeJson may specify multiple stacks)
  // COMMAND_USAGE_CONFIGURATION = 68, // configuration failed validation - link to the docs. Make sure to mention that any environment variables with `MNT_` will contribute to this and will cause 'extraneous property' errors
  // PACKAGE_FS_RENAMED = 69,
  // PACKAGE_FS_MOVED = 70,
  // DOCTOR_REQUIRED = 71, // cannot continue without running doctor
  // CONFIGURATION_INITIALSETTINGS_BANNED = 72, // configs supplied as initialSettings that are in blacklist
  // PROJECT_CONSISTENCY_ERROR = 73, // duplicate package names and other illogical states
  // QUERY_API_UNINITIATED = 74, // Mnt.QueryApiMap has not been registered with the Datastore
  // PACKAGE_FS_UNNAMED = 75,    // Package found without (valid) name
  // PACKAGE_CONFIGURATION_INVALID = 76,   // .monotonous-package.json file invalid, should include errors
  // PLUGIN_CHANGE = 77, // Features/Stacks/Categories have been changed
  // GENERAL_FEATURE_SERVICE = 78, // Specific rules around clz/entity/service. Includes checks when Feature/Categories/Stacks aren't found in db (Attempting to load Category that does not exist. Please check the relevant Plugin has been loaded using verbose mode)
  // // STACK_RECIPE_INVALID = 80, // 1.) give examples of working recipes
  // ADDRESS_SCHEME_INVALID = 81, // 1) perhaps link to the unit tests and a short explanation of the format
  ADDRESS_FORMAT_INVALID = 2, // 1) address parsed ok but used improperly - e.g. templateNamespace params not present. 2) configuring template namespace with descriptor and not an ident
  // PLUGIN_INSTALLATION_ERROR = 83, // 1) plugin has been specified in workroot manifest with a disallowed range - should be exact (protocol = npm)
  // CLIPANION_USAGE_ERROR = 84, // 1) cli options supplied invalid but manually validated. Combine with BacError third param to trigger Clipanion usage screen. Link `noProject` context (--projectCwd)
  // PACKAGE_MANAGER_NOT_DETECTED = 85, // using dotfiles etc, the project pm was not detectable
  // PACKAGE_MANAGER_NOT_SUPPORTED = 86, // using dotfiles etc, the detected pm is either not suitable for a monorepo or the required plugin not enabled
  // // FSLIB_SRC_TRAILING_SLASH = 87, // trailing slash on source not allowed - https://tinyurl.com/yxmonswp
  // TEMPLATE_COPY_CIRCULARITY = 88, // the same copy operation has been detected. This should not be possible and may suggest a bug in monotonous
  // PREPHASE_NOT_IMPLEMENTED = 89, // for non-phased stacks, the prePhase method must be implemented
  // TEMPLATE_CONTENT_TMP_INVALID = 90, // content created in temp location via ScaffoldService has not passed validation check. This is likely a fault with the templates or bad importing?
  // PHASE_FAILURE = 91, // A phase has encountered a failing process from the container. This prevents ScaffoldService finalisation and other things. Mention best way to diagnose problems (i.e. check the doExec logging, use verbose etc)
  // PACKAGE_QUERY_FORMAT_ERROR = 92, // a packageQuery is unparseable, likely supplied as --packageQuery. Link to the examples etc
  // QUERY_STRICT_ERROR = 93, // a query was non-resultant despite the strict parameter
  // STREAM_FULL = 94, // writing to a stream has indicated that it needs to be drained - https://tinyurl.com/h4jkuva
  // REPORT_LINE_INVALID = 95, // writing to report.debug/info/warning (all except console) with invalid characters. Principally this means newlines which break the DeMerge streams
  // PROJECT_SYNC_EMPTY = 96, // Project#sync from initialised->noProject is not allowed (i.e. no workroot has been found)
  // MAIN_CLI_CWD_INVALID = 97, // paths as supplied to mainCli not resolving. This may be a user error
  // EXEC_SPAWN_ERROR = 98, // the spawned process can't be created. This is different to an error during process setup
  // RENDER_COMPONENT_ERROR = 99, // a React component has called its cb with an error
  // RENDER_COMPONENT_INVALID = 100, // Renderable React Components must implement a cb to unmount
  // PROCESS_FAILURE = 101, // an unexpected error occurred whilst running a feature process (i.e. ProjectScheduler#processMap->container). This is likely a Mnt bug and should be reported. Note that we report these immediately (to stderr) because we may have multiple processes fails per phaseResult (the usual reporting level for cli etc). Also includes not setting up the StackProcess
  // STACK_RECIPE_SUPPLIED_INVALID = 102, // if a recipe has been supplied (or hasn't in conjunction with certain --recipeMode), we'll validate this. This is separate to validation against the COERCED version of this (@see STACK_RECIPE_NOT_SETUP)
  // STACK_RECIPE_NOT_SETUP = 103, // Stacks must build up a workable recipe before invocation. Mention available `setupRecipeByXXX` methods
  // FLOW_FORM_LEVEL_VALIDATION = 104, // validation failed when validating at form level. This is probably due to runtimeState/feature config being wrong.
  // FLOW_FORM_INVALID_CONFIG = 105, // 1.) StateFieldDefinition does not have inputConfig but no value available (via config or through runtimeState)  2) Post collation-validation failure (owing to broken flowform probably?)
  // FEATURE_INVALID_RUNTIME_STATE = 106, // 1) runtimeState forms must be complete until last category. 2) Extraneous features supplied during 'initiate' other than feature ran via cli. 3) runtimeState has unknown feature
  // FEATURE_CONFIG_INVALID = 107, // 1.) must have validators for each and every field. 2) run() must be implemented and return
  // FLOW_FORM_FIELD_VALUE_INACCESSIBLE = 108, // 1.) a field has not declared a formMap, value nor runtimeState value. It's likely `value` has not been configured for static values or user has not supplied as runtimeState. Should also enforce validation at Command level for runtimeState-dependent values
  // TEMPLATE_PATH_NOT_FOUND = 109, // 1.) Possible misconfiguration of the FeatureConfig#templatePaths  2.) srcPath artifact not found - perhaps point to some examples here + Scaffold tests
  // TEMPLATE_PATH_CONFLICT = 110, // 1.) destination path exists and mode='stopIfExistent'
  // TEMPLATE_PATH_OUT_OF_BOUNDS = 111, // 1.) attempting to write to a path
  // PHASE_CONTAINER_CREATION = 112, // for some phases, we'll execute the operations within a tmp environment (ScaffoldService). If the setup here goes wrong (usually path problems) we'll raise this
  // PHASE_CONTAINER_FINALISE = 113, // for some phases, we'll execute the operations within a tmp environment (ScaffoldService). If the finalisation goes wrong (where we copy from tmp -> destinationPath), we'll raise this
  // PROJECT_UNINITIATED = 114, // 1. some services/operations can only be done after initialisation. e.g. installing plugins. 2. Trying to project.sync before initiation
  // EPHEMERAL_PLUGIN_ERROR = 115, // 1. recipe with .meta.plugins has been seen before project. Perhaps the --projectCwd is incorrect? 2. packagemanager could not be determined (perhaps project not initialised?). 3. Unparseable plugin value (mention descriptorString format with range)
  // STATE_QUERY_FORMAT_ERROR = 116, // a stateQuery is unparseable, likely supplied as --stateQuery. Link to the examples etc. For initiate phases it should reduce state to a suitable size - i.e. currently at most one category
  // GENERAL_CONFIG_INVALID = 117, // more general version of 'FEATURE_CONFIG_INVALID' applicable to feature/category/stack. 1. duplicate titles
  // STREAM_PROCESS_ERROR = 118, // a problem transmitting data between node processes. 1. Demerge has seen a line without a known prefix (probably spawn process.stdout chunking)
}