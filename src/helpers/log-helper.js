'use strict'

const fs = require('fs')

/**
 * @description APPログファイルパス
 */
const AppLogFilePath = 'logs/app.log'

/**
 * @description ログ出力機能を提供します。
 */
module.exports = {
  /**
   * @description infoレベルでログ出力します。
   * @param {String} msg 出力メッセージ
   * @returns {void}
   */
  info (msg) {
    console.info(msg)
    fs.appendFileSync(AppLogFilePath
      , msg
      , { encoding: 'utf-8' }
    )
  }
}
