// @ts-check
/**
 * @typedef {import('@business-as-code/core').Config} Config
 * @type {Config}
 */
const config = {
  projectSource: [{
    provider: 'git',
    options: {
      address: `http://localhost:8174/bare-repo1.git`,
      // l: 'l',
    },
    // getProject: {
    //   origin: {

    //   }
    // }
  }],
}


module.exports.config = config
