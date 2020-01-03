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
    const accessor = require('@d/db-accessor')
    const reader = require('@d/sql-reader')
    const sqls = []
    sqls.push(reader.read('create_race_info'))
    sqls.push(reader.read('create_race_result'))
    sqls.push(reader.read('create_feature'))
    sqls.push(reader.read('create_horse_race_history'))
    sqls.push(reader.read('create_race_result_history'))
    sqls.push(reader.read('create_race_result_additional'))
    sqls.push(reader.read('create_race_info_additional'))
    sqls.push(reader.read('create_future_race_info'))
    sqls.push(reader.read('create_view_race_result_history'))
    sqls.push(reader.read('create_view_future_race_history'))
    accessor.run(sqls)
  }
}
