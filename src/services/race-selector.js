'use strict'

/**
 * @module レースの選択機能を提供します。
 */
module.exports = {
  /**
   * @description レースを選択します。
   * @returns {void}
   */
  async select () {
    const reader = require('@/services/sql-reader')
    const sql = reader.read('select_simulation_race')
    const accessor = require('@/services/db-accessor')
    const results = await accessor.all(sql)
    return results
  }
}
