// @ts-check
/**
 * @typedef {import('@business-as-code/cli').Config} Config
 * @type {Config}
 */
const config = {
  projectSource: [{
    provider: 'git',
    options: {
      address: 'http://localhost:8174/repo1.git',
    },
  }, {
    provider: 'git',
    options: {
      address: 'http://localhost:8174/repo2.git',
    },
  }],
}

module.exports.config = config;
