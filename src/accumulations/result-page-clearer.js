'use strict'

const fileHelper = require('@h/file-helper')
const fs = require('fs')
const path = require('path')
const config = require('@/config-manager').get()

/**
 * @module 開催結果レースページ情報の削除機能を提供します。
 */
module.exports = {
  /**
   * @description 開催結果レースページ情報の削除を行います。
   * @returns {void}
   */
  clear () {
    // レースに関するテキストファイルを削除
    fileHelper.delete(config.resultRaceListUrlFilePath)
    fileHelper.delete(config.resultRaceUrlFilePath)

    // HTML・jsonをバックアップフォルダに移動
    const htmls = fs.readdirSync(config.resultRaceHtmlDir)
      .filter(h => !fileHelper.isDirectory(path.join(config.resultRaceHtmlDir, h)))
    for (const html of htmls) {
      fileHelper.move(
        path.join(config.resultRaceHtmlDir, html),
        path.join(config.resultRaceHtmlBackupDir, html)
      )
    }
    const jsons = fs.readdirSync(config.resultRaceJsonDir)
      .filter(j => !fileHelper.isDirectory(path.join(config.resultRaceJsonDir, j)))
    for (const json of jsons) {
      fileHelper.move(
        path.join(config.resultRaceJsonDir, json),
        path.join(config.resultRaceJsonBackupDir, json)
      )
    }
  }
}
