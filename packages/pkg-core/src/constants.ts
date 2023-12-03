import dotenv from "dotenv-flow";


const dotenvParsed = dotenv.config({
  silent: true,
});
if (dotenvParsed.error) {
  throw new Error(`Unable to read env file`);
}
export const constants = {
  // the following will be replaced from the .env. Here for the type inferrence
  ...{
    TMP_ROOT:'',
    VERDACCIO_STORAGE_PATH:'',
    TESTS_STORAGE_PATH:'',
    CACHE_STORAGE_PATH:'',
    GIT_HTTP_MOCK_SERVER_ROOT:'',
    GIT_HTTP_MOCK_SERVER_PORT:'',
    GIT_SSH_PUBKEY_MOCK_SERVER_ROOT:'',
    GIT_SSH_PUBKEY_MOCK_SERVER_PORT:'',
    // GIT_SSH_PASSWORD_MOCK_SERVER_ROOT:'',
    // GIT_SSH_PASSWORD_MOCK_SERVER_PORT:'',
    // GIT_SSH_MOCK_SERVER_PASSWORD:'',
    GIT_SSH_ANONYMOUS_MOCK_SERVER_ROOT:'',
    GIT_SSH_ANONYMOUS_MOCK_SERVER_PORT:'',
    // used to influence other ssh servers and done internally
    // GIT_SSH_MOCK_SERVER_PUBKEY:'',
  },
  ...{

    // /** {@linkInspirationhttps://tinyurl.com/2z9go29w | Mui} */
    // COLORS: {
    //   info: '#79f3e3',
    //   warn: '#ffc107',
    //   success: '#7af379',
    //   error: '#dc3545',
    //   grey: '#EAEDF2',

    //   debug: '#f379ee',
    //   silly: '#4fc3f7',
    // } as const,

    // LAYOUT: {
    //   padding: 3,
    // },

    GLOBAL_VERSION: require('@business-as-code/cli/package.json').version,
    GLOBAL_CACHE_KEY: 1,
    ENVIRONMENT_PREFIX: `bac_`,
    // CACHE_FOLDER_FILENAME: `.monotonous`,
    // CACHE_FOLDER_LIB_FILENAME: `lib`,
    // CACHE_FOLDER_TMP_FILENAME: `tmp`,
    // DATABASE_MAIN_FILENAME: `db.sqlite`,
    WORKROOT_IDENT: `root`,
    DEFAULT_COMMITTER: "no reply <no-reply@bac.com>",
    RC_FILENAME: "bac.js",
    RC_CONFIGURED_FILENAME: "bac.json",
    RC_FOLDER: ".bac",
    RC_META_FOLDER: "meta",
    RC_CONTENT_FOLDER: "content",
    NPM_RC_FILENAME: ".npmrc",
    // DEFAULT_COMMITTER_NAME: 'no reply',
    // DEFAULT_COMMITTER_EMAIL: 'no-reply@bac.com',
    // WORKING_PACKAGE_IDENT: '@monotonous/mnt-working', // name of the gitignored /packages/mnt-working package that all projects will have added
    // PROJECT_PATHS_WORKTREE: `orgs`,
    // PROJECT_PATHS_WORKSPACES: `packages`,
    // PROJECT_PATHS_WORKTREE_WORKSPACES: `packages`,
    // RC_FILENAME: `.monotonous.json`,
    // // RC_PACKAGE_FILENAME: `.monotonous-package.json`,
    // PACKAGE_MANAGER_LOCKFILE_CHECKSUM_TMP_FILENAME: 'pm_checksum.txt',
    // TEMPLATE_FOLDER: 'templates',
    // DYNAMIC_TEMPLATE_FILENAME: 'process.js',
    // SPAWN_MEMORY_LIMIT: '4096',
    // // SPAWN_MEMORY_LIMIT: '2048',

    // MNT_WORKING_FILES: ['.monotonous', '.monotonous.json'],
    // TMP_BASE_PATH: '/tmp/mnt-tmp', // remove before live (replace with os.tmpdir)

    // CONSOLE_PAD_LEFT: `== MNT0000: ┌ `.length,
    // CONSOLE_FORMAT_DELIMITER: '\u2800', // braille character. non-spacing terminal characters - https://tinyurl.com/2dwb88y5

    // CONSOLE_MERGE_FORMATTED_DELIMITER: 'FORMATTEDFUCKNUTS',
    // CONSOLE_MERGE_UNFORMATTED_DELIMITER: 'UNFORMATTEDFUCKNUTS',
    // CONSOLE_MERGE_ERROR_DELIMITER: 'ERRORFUCKNUTS',
    // CONSOLE_MERGE_USER_DELIMITER: 'USERFUCKNUTS',
    // // CONSOLE_MERGE_UNFORMATTED_DELIMITER: '\u3164', // HANGUL FILLER. non-spacing terminal characters - https://tinyurl.com/2dwb88y5
    // // CONSOLE_MERGE_FORMATTED_DELIMITER: 'U+115F', // HANGUL CHOSEONG FILLER. non-spacing terminal characters - https://tinyurl.com/2dwb88y5
    // // CONSOLE_MERGE_ERROR_DELIMITER: '\u1160', // HANGUL JUNGSEONG FILLER character. non-spacing terminal characters - https://tinyurl.com/2dwb88y5
    // // CONSOLE_MERGE_USER_DELIMITER: '\uFFA0', // HALFWIDTH HANGUL FILLER character. non-spacing terminal characters - https://tinyurl.com/2dwb88y5

    // STREAMS_WRITABLE_HIGH_WATERMARK: 2**28, // @see constants.spec.ts
    // STREAMS_READABLE_HIGH_WATERMARK: 2**28, // @see constants.spec.ts

    // STREAMS_END_TIMEOUT: 10000, // 5000 is reliably needed during some tests

    // // when needing a concrete Mnt.MapUtil.StackKeys
  },
  ...dotenvParsed.parsed,
};

// console.log(`constants :>> `, constants, process.env)