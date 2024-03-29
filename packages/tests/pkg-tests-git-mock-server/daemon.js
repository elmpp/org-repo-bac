#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const {spawn} = require('child_process')
const kill = require('tree-kill')
const minimisted = require('minimisted')

module.exports = function (cmdName, target) {
  const args = [
    target
  ]

  async function main({_: [cmd]}) {
    switch (cmd) {
      case 'start': {
        require('daemonize-process')({stdio: 'inherit'})
        let server = spawn(
          'pnpm run -w dev:run', args,
          {
            shell: true,
            stdio: 'inherit',
            windowsHide: true,
            env: process.env,
          }
        )
        fs.writeFileSync(
          path.join(process.cwd(), `${cmdName}.pid`),
          String(process.pid),
          'utf8'
        )
        process.on('exit', server.kill)
        return
      }
      case 'stop': {
        let pid
        try {
          pid = fs.readFileSync(
            path.join(process.cwd(), `${cmdName}.pid`),
            'utf8'
          );
        } catch (err) {
          console.log(`No ${cmdName}.pid file`)
          process.exit(1)
          return
        }
        pid = parseInt(pid)
        console.log('killing', pid)
        kill(pid, (err) => {
          if (err) {
            console.log(err)
            process.exit(1)
          } else {
            fs.unlinkSync(path.join(process.cwd(), `${cmdName}.pid`))
            process.exit(0)
          }
        })

        return
      }
      case 'isRunning': {
        try {
          pid = fs.readFileSync(
            path.join(process.cwd(), `${cmdName}.pid`),
            'utf8'
          );
          process.exit(0)
        } catch (err) {
          process.exit(1)
        }
      }
      default: {
        require(target)
      }
    }
  }

  minimisted(main)
}