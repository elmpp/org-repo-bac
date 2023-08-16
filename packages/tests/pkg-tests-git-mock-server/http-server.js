#!/usr/bin/env node
// Standalone server for use without karma!
var http = require('http')
var path = require('path')
var factory = require('./middleware')
var cors = require('./cors')
const {constants} = require('@business-as-code/core')

var config = {
  // root: path.resolve(process.cwd(), process.env.GIT_HTTP_MOCK_SERVER_ROOT || '.'),
  root: path.resolve(process.cwd(), constants.GIT_HTTP_MOCK_SERVER_ROOT),
  glob: '*',
  route: process.env.GIT_HTTP_MOCK_SERVER_ROUTE || '/'
}

var server = http.createServer(cors(factory(config)))
server.listen(process.env.GIT_HTTP_MOCK_SERVER_PORT || 8174)
