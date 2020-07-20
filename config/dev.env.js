'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const argv = JSON.parse(process.env.npm_config_argv)
let MAP = argv.cooked.splice(2)[0] || 'offline'

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  MAP: '"' + MAP + '"'
})
