/**
  commitlint docs - https://tinyurl.com/r8y2jdo
  nx commit example - https://tinyurl.com/2hkzjnxy
 */
// const util = require('util')
// const execPromise = util.promisify(require('node:child_process').exec)
// const {execSync} = require('child_process')
import {execSync} from 'child_process'
import type { Commit, UserConfig } from '@commitlint/types' // typescript - https://tinyurl.com/2hm4zngu


/**
 * Inspired from nx example - https://tinyurl.com/2zjsuzuj
 * Moonrepo query projects - https://tinyurl.com/2ob888at
 *
 * @param {(params: Pick<Nx.ProjectConfiguration, 'name' | 'projectType' | 'tags'>) => boolean} selector
 */
function getProjectsFromMoon(selector: (options: {name: string, projectType: string, tags: string[]}) => boolean = () => true) {

	// console.log(`:>> DDDDDDDDDDDDDDDDDDDDDD`);

	// const cwd = context?.cwd ?? process.cwd()

	type MoonProjectQueryResponse = {projects: {alias: string, type: string}[]}

	// const moonProjectQueryResponseJson = execSync('pnpm moon query projects --json', {shell: true as any, encoding: 'utf8'})
	const moonProjectQueryResponseJson = execSync('bun moon query projects --json', {shell: true as any, encoding: 'utf8'})
	// console.log(`moonProjectQueryResponseJson :>> `, moonProjectQueryResponseJson)

	let moonProjectQueryResponse: MoonProjectQueryResponse
	try {
		moonProjectQueryResponse = JSON.parse(moonProjectQueryResponseJson)
	}
	catch (err) {
			console.log(`could not parse :>> `, moonProjectQueryResponseJson)
			throw err
	}

	// console.log(`moonProjectQueryRes :>> `, moonProjectQueryResponse!)


	return moonProjectQueryResponse!.projects.filter(p => selector({
		name: p.alias,
		projectType: p.type,
		tags: [],
	}))
	// .map(p => {
	// 	console.log(`p :>> `, p)
	// 	return p
	// })
	.map(p => p.alias)
	.filter(p => p)

}

const projectsFromMoon = getProjectsFromMoon(
	({name, projectType}) => {
		return true
	}
)

console.log(`projectsFromMoon :>> `, projectsFromMoon)

const config: UserConfig = {

	parserPreset: 'conventional-changelog-conventionalcommits',
	rules: {

		// 'scope-enum-enhanced': async () => [
		// 	2,
		// 	'always',
		// 	[
		// 		...(getProjectsFromMoon(
		// 			// ctx,
		// 			({name, projectType}) => {
		// 				return true	// perhaps only check an active flag here or something
		// 			}
		// 		)),
		// 	],
		// ],
		'scope-enum': async () => [
			2,
			'always',
			[
				// ...(getProjectsFromMoon(
				// 	// ctx,
				// 	({name, projectType}) => {
				// 		return true	// perhaps only check an active flag here or something
				// 	}
				// )),
				...projectsFromMoon,
			],
		],


		// defaults from here - https://tinyurl.com/2ggbdo6c
		// 'body-leading-blank': [1, 'always'],
		// 'body-max-line-length': [2, 'always', 100],
		// 'footer-leading-blank': [1, 'always'],
		// 'footer-max-line-length': [2, 'always', 100],
		// 'footer-empty': []
		'header-max-length': [2, 'always', 100],
		'subject-case': [
			2,
			'never',
			['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
		],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'type-case': [2, 'always', 'lower-case'],
		'type-empty': [2, 'never'],
		'type-enum': [
			2,
			'always',
			[
				'build',
				'chore',
				'ci',
				'docs',
				'feat',
				'fix',
				'perf',
				'refactor',
				'revert',
				'style',
				'test',
			],
		],
	},
	plugins: [
    {
			// fixes scope not allowing @scope/name - https://tinyurl.com/2off9dd9
      rules: {
// 					'scope-enum-enhanced': (
// 						parsed: Commit,
// 						when = 'always',
// 						value: string[] = [],
// 					): [boolean, string] => {
// 						if (!parsed.scope) {
// 							return [true, '']
// 						}
// console.log(`parsed, value, when :>> `, parsed, value, when)
// 						// Only use comma sign as the separator
// 						const npmScopes = parsed.scope.split(',')

// 						if (!Array.isArray(value)) {
// 							throw new TypeError('config value should be a string array')
// 						}

// 						// Check if all scopes are valid
// 						const result =
// 							value.length === 0 || npmScopes.every((s) => value.includes(s))

// 						const negated = when === 'never'

// 						return [
// 							negated ? !result : result,
// 							`scope must${negated ? ` not` : ''} be one of [${value.join(', ')}]`,
// 						]
// 					},
					'scope-enum': (
						parsed: Commit,
						when = 'always',
						value: string[] = [],
					): [boolean, string] => {
						if (!parsed.scope) {
							return [true, '']
						}

// console.log(`parsed, value, when :>> `, parsed, value, when)

						// Only use comma sign as the separator
						const npmScopes = parsed.scope.split(',')

						if (!Array.isArray(value)) {
							throw new TypeError('config value should be a string array')
						}

						// Check if all scopes are valid
						const result =
							value.length === 0 || npmScopes.every((s) => value.includes(s))

						const negated = when === 'never'

						return [
							negated ? !result : result,
							`scope must${negated ? ` not` : ''} be one of [${value.join(', ')}]`,
						]
					},
			},
    },
  ],
	prompt: {
		questions: {
			type: {
				description: "Select the type of change that you're committing",
				enum: {
					feat: {
						description: 'A new feature',
						title: 'Features',
						emoji: '✨',
					},
					fix: {
						description: 'A bug fix',
						title: 'Bug Fixes',
						emoji: '🐛',
					},
					docs: {
						description: 'Documentation only changes',
						title: 'Documentation',
						emoji: '📚',
					},
					style: {
						description:
							'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
						title: 'Styles',
						emoji: '💎',
					},
					refactor: {
						description:
							'A code change that neither fixes a bug nor adds a feature',
						title: 'Code Refactoring',
						emoji: '📦',
					},
					perf: {
						description: 'A code change that improves performance',
						title: 'Performance Improvements',
						emoji: '🚀',
					},
					test: {
						description: 'Adding missing tests or correcting existing tests',
						title: 'Tests',
						emoji: '🚨',
					},
					build: {
						description:
							'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)',
						title: 'Builds',
						emoji: '🛠',
					},
					ci: {
						description:
							'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
						title: 'Continuous Integrations',
						emoji: '⚙️',
					},
					chore: {
						description: "Other changes that don't modify src or test files",
						title: 'Chores',
						emoji: '♻️',
					},
					revert: {
						description: 'Reverts a previous commit',
						title: 'Reverts',
						emoji: '🗑',
					},
				},
			},
			scope: {
				description:
					'What is the scope of this change (e.g. component or file name)',
				// enum: {
				// 	'@business-as-code/cli': {
				// 		description: "@business-as-code/cli",
				// 		title: '@business-as-code',
				// 		// emoji: '♻️',
				// 	},
				// 	'@business-as-code/code': {
				// 		description: "@business-as-code/cli",
				// 		title: '@business-as-code',
				// 		// emoji: '♻️',
				// 	},
				// }
				// enum: {
				// 	tefefefst: {
				// 		description: 'Adding missing tests or correcting existing tests',
				// 		title: 'Tests',
				// 		emoji: '🚨',
				// 	},
				// }
			},
			subject: {
				description:
					'Write a short, imperative tense description of the change',
			},
			body: {
				description: 'Provide a longer description of the change',
			},
			isBreaking: {
				description: 'Are there any breaking changes?',
			},
			breakingBody: {
				description:
					'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
			},
			breaking: {
				description: 'Describe the breaking changes',
			},
			isIssueAffected: {
				description: 'Does this change affect any open issues?',
			},
			issuesBody: {
				description:
					'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
			},
			issues: {
				description: 'Add issue references (e.g. "fix #123", "re #123".)',
			},
		},
	},
};


	// disabling and using defaults

  // rules: {
  //   'scope-enum': async (ctx) => [
  //     2,
  //     'always',
  //     [
  //       ...(getProjectsFromMoon(
  //         ctx,
  //         ({name, projectType}) => {
	// 					// perhaps only check an active flag here or something
	// 				}
  //       )),
  //     ],
  //   ],
  // },
  // . . .
// };

export default config