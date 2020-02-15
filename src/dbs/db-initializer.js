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
    sqls.push(reader.read('create_race_result'))
    sqls.push(reader.read('create_race_future'))
    sqls.push(reader.read('create_horse_race_history'))
    sqls.push(reader.read('create_view_result_post_history'))
    sqls.push(reader.read('create_view_result_race_history'))
    sqls.push(reader.read('create_view_future_race_history'))
    sqls.push(reader.read('create_idx_race_result_horse_id'))
    sqls.push(reader.read('create_idx_horse_race_history_pre'))
    sqls.push(reader.read('create_idx_horse_race_history_post'))
    accessor.run(sqls)
  }
}
