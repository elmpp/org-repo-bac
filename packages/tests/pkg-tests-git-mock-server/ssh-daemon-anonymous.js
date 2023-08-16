#!/usr/bin/env node
const cmdName = 'git-ssh-anonymous-mock-server'
const target = require.resolve('./ssh-server-anonymous.js')
require('./daemon.js')(cmdName, target)
