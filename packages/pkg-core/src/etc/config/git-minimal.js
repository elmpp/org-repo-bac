// @ts-check
/**
 * @typedef {import('@business-as-code/cli').Config} Config
 * @type {Config}
 */
const config = {
  projectSource: [{
    provider: 'git',
    options: {
      address: 'descriptor-to-some-public-example-repo',
    },
  }],
}


module.exports.config = config
