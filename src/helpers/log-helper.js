'use strict'

const fs = require('fs')
const moment = require('moment')

/**
 * @description APPログファイルパス
 */
const AppLogFilePath = 'logs/app-$timestamp.log'

/**
 * タイムスタンプ
 */
let timestamp = ''

/**
 * @description ログ出力機能を提供します。
 */
module.exports = {
  /**
   * ログファイルの初期化を行います。
   */
  init () {
    timestamp = moment().format('YYYYMMDDhhmmss')
  },
  /**
   * @description infoレベルでログ出力します。
   * @param {String} msg 出力メッセージ
   * @returns {void}
   */
  info (msg) {
    if (!timestamp) {
      module.exports.init()
    }
    console.info(msg)
    fs.appendFileSync(AppLogFilePath.replace('$timestamp', timestamp)
      , `${msg}\n`
      , { encoding: 'utf-8' }
    )
  }
}
