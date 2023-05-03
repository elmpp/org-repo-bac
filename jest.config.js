// const {defaults: tsjPreset} = require('ts-jest/presets')
// import wtfnode from 'wtfnode'
// require('wtfnode')

module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx', 'graphql'],
  // projects: ['./packages/*'],
  transform: {
    // ...Object.valuestsjPreset.transform.map(t => require.resolve('ts-jest')), // https://tinyurl.com/yyc4pzyb
    // Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, iteratee(val, key)] as [string, string]))
    // '^.+\\.tsx?$': require.resolve('ts-jest')
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  /** some deps are pure esmodules that swc/jest doesn't understand */
  transformIgnorePatterns: [
    '/node_modules/!(?!(execa)/)', // i.e. include execa for transformation
  ],
  // testMatch: ['**/__tests__/**/*.spec.ts?(x)', '**/__tests__/**/*.spec.js?(x)', '**/tests/**/*.spec.ts?(x)'],
  testMatch: ['**/*.spec.[t|j]s?(x)'],

  testPathIgnorePatterns: [
    '\\.(deletable.*?)$',
    '\\.(pre-.*?)$',
    '\\.(post-.*?)$',
    '\\.*.ignore.*$',
    '\\/dist\\/*',
  ],

  modulePathIgnorePatterns: [
    // '<rootDir>/packages/mnt-plugin-core-essentials/templates',
    // '<rootDir>/packages/mnt-pkg-fslib-extra/fixtures',
    // '<rootDir>/packages/tests/packages/tests-fixtures',
    '<rootDir>/.moon',
  ],

  testEnvironment: 'node',

  // setupFilesAfterEnv: [require.resolve(`./jest.setup.js`)],
  // globalSetup: require.resolve(`./jest.setup.js`), // https://tinyurl.com/2lrnm6kn
  // setupTestFrameworkScriptFile: [require.resolve(`./jest.setup.js`)],

  verbose: true,
  // globals: {
  //   ['ts-jest']: {
  //     tsconfig: './tsconfig.jest.json',
  //   },
  // },
}
