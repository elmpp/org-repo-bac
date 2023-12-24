// @ts-check
/**
 * @typedef {import('@business-as-code/cli').Config} Config
 * @type {Config}
 */
const config = {
  projectSource: [
    {
      provider: 'git',
      options: {
        address: 'ssh://git-ssh-mock-server@localhost:2223/repo1.git'
      }
    },
    {
      provider: 'git',
      options: {
        address: 'ssh://git-ssh-mock-server@localhost:2223/repo2.git'
      }
    }
  ]
}

module.exports.config = config
