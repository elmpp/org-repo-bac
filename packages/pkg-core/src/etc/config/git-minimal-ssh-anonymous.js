// @ts-check
/**
 * @typedef {import('@business-as-code/cli').Config} Config
 * @type {Config}
 */
const config = {
  projectSource: [{
    provider: 'git',
    options: {
      address: 'http://localhost:2224/repo1.git',
    },
  }],
}


module.exports.config = config
