#!/usr/bin/env node
const cmdName = 'git-ssh-password-mock-server'
const target = require.resolve('./ssh-server-password.js')
require('./daemon.js')(cmdName, target)
