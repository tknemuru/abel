'use strict'
require('module-alias/register')

const args = require('command-line-args')
const optionDefs = [
  {
    name: 'target',
    alias: 't',
    type: String
  }
]

const options = args(optionDefs)
console.log(options)

const dbInit = require('@d/db-initializer')
const creator = require('@an/eval-param-creator')
const simulator = require('@s/purchase-simulator')

switch (options.target) {
  case 'init-db':
    dbInit.init()
    break
  case 'create-param':
    creator.create()
    break
  case 'simulate':
    simulator.simulate()
    break
  default:
    throw new Error('unexpected target.')
}
