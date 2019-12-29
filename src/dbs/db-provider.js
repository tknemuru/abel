'use strict'

/**
 * @module データベースオブジェクトを提供します。
 */
module.exports = {
  /**
   * @description データベースオブジェクト
   */
  _db: null,

  /**
   * @description データベースオブジェクトの初期化を行います。
   * @returns {void}
   */
  init () {
    const sqlite3 = require('sqlite3')
    module.exports._db = new sqlite3.Database('db/race.db')
  },

  /**
   * @description データベースオブジェクトを取得します。
   */
  get () {
    if (!module.exports._db) {
      module.exports.init()
    }
    return module.exports._db
  }
}
