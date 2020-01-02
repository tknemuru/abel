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
const futureScraper = require('@ac/future-race-scraper')
const futureSimulator = require('@s/future-purchase-simulator')
const horseHistCreator = require('@an/horse-race-history-creator')
const additionalResultCreator = require('@an/race-result-additional-creator')
const additionalInfoCreator = require('@an/race-info-additional-creator')
const learningInputCreator = require('@an/learning-input-creator')

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
  case 'future-scrape':
    (async () => {
      await futureScraper.scrape()
      process.exit()
    })()
    break
  case 'future-simulate':
    futureSimulator.simulate()
    break
  case 'create-horse-hist':
    horseHistCreator.create()
    break
  case 'create-result-additional':
    additionalResultCreator.create()
    break
  case 'create-info-additional':
    additionalInfoCreator.create()
    break
  case 'learn-pre':
    learningInputCreator.create()
    break
  default:
    throw new Error('unexpected target.')
}
