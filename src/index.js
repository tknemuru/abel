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
const testSimulator = require('@s/test-purchase-simulator')
const futureDownloader = require('@ac/future-race-page-downloader')
const futureScraper = require('@ac/future-race-scraper')
const futureRegister = require('@ac/future-race-register')
const futureSimulator = require('@s/future-purchase-simulator')
const databaseUrlExtractor = require('@ac/race-database-url-extractor')
const resultScraper = require('@ac/result-race-scraper')
const horseHistCreator = require('@an/horse-race-history-creator')
const additionalResultCreator = require('@an/race-result-additional-creator')
const additionalInfoCreator = require('@an/race-info-additional-creator')
const learningInputCreator = require('@an/learning-input-creator')
const learningConfig = require('@an/configs/learning-config')
const testConfig = require('@an/configs/test-config')
const predictionConfig = require('@an/configs/prediction-config')
const predAdjuster = require('@an/prediction-result-adjuster')
const simAnalyzer = require('@an/simulation-result-analyzer')

switch (options.target) {
  case 'init-db':
    dbInit.init()
    break
  case 'create-param':
    creator.create()
    break
  case 'future-download':
    (async () => {
      try {
        await futureDownloader.download({
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'future-scrape':
    (async () => {
      try {
        await futureScraper.scrape()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'future-register':
    futureRegister.register()
    break
  case 'future-simulate':
    futureSimulator.simulate({
      tan: {
        minScore: 170
      },
      fuku: {
        minScore: 9999
      },
      waku: {
        minScore: 9999
      },
      uren: {
        minScore: 9999
      },
      wide: {
        minScore: 9999
      },
      sanfuku: {
        minScore: 9999
      }
    })
    break
  case 'extract-database-url':
    (async () => {
      try {
        await databaseUrlExtractor.extract({
          // endDate: '202001'
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'extract-result-race-url':
    (async () => {
      try {
        await require('@ac/race-database-downloader').extract({
          // endDate: '202001'
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'download-result-race':
    (async () => {
      try {
        await require('@ac/result-race-page-downloader').download({
          // endDate: '202001'
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'result-scrape':
    resultScraper.scrape()
    break
  case 'result-register':
    require('@ac/result-race-register').register()
    break
  case 'gen-race-sql':
    require('@ac/race-sql-generator').generate()
    break
  case 'test-simulate':
    testSimulator.simulate()
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
    learningInputCreator.create(learningConfig)
    break
  case 'pred-pre':
    learningInputCreator.create(predictionConfig)
    break
  case 'test-pre':
    learningInputCreator.create(testConfig)
    break
  case 'pred-adjust':
    predAdjuster.adjust()
    break
  case 'sim-analyze':
    simAnalyzer.analyze()
    break
  default:
    throw new Error('unexpected target.')
}
