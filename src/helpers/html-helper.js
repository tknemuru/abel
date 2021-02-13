'use strict'

/**
 * @module HTMLに関する補助機能を提供します。
 */
module.exports = {
  /**
   * @description HTMLファイルからdomを生成します。
   * @param {String} fileName - ファイル名
   * @returns {Object} dom
   */
  toDom (fileName) {
    const fs = require('fs')
    const html = fs.readFileSync(fileName, { encoding: 'utf-8' })
    const jsdom = require('jsdom')
    const { JSDOM } = jsdom
    const virtualConsole = new jsdom.VirtualConsole()
    const dom = new JSDOM(html, { virtualConsole })
    return dom
  },
  /**
   * @description HTMLファイルからjQueryオブジェクトを生成します。
   * @param {String} fileName - ファイル名
   * @returns {Object} jQueryオブジェクト
   */
  toJQueryObj (fileName) {
    const fs = require('fs')
    const html = fs.readFileSync(fileName, { encoding: 'utf-8' })
    const cheerio = require('cheerio')
    const $ = cheerio.load(html)
    return $
  },
  /**
   * @description ファイルが存在するかどうか。
   * @param {String} fileName - ファイル名
   * @returns {Boolean} ファイルが存在するかどうか
   */
  existsFile (fileName) {
    try {
      const fs = require('fs')
      fs.statSync(fileName)
      return true
    } catch (err) {
      if (err.code === 'ENOENT') return false
    }
  }
}
