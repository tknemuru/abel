'use strict'

/**
 * @module データベースの初期化機能を提供します。
 */
module.exports = {
  /**
   * @description データベースの初期化を行います。
   * @returns {void}
   */
  init () {
    const accessor = require('@/services/db-accessor')
    const reader = require('@/services/sql-reader')
    const sqls = []
    sqls.push(reader.read('create_race_info'))
    sqls.push(reader.read('create_race_result'))
    sqls.push(reader.read('create_feature'))
    accessor.run(sqls)
  }
}
