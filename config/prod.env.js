'use strict'
const argv = JSON.parse(process.env.npm_config_argv)
let MAP = argv.cooked.splice(2)[0] || 'offline'

module.exports = {
  NODE_ENV: '"production"',
  MAP: '"' + MAP + '"'
}
