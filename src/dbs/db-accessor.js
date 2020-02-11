'use strict'

/**
 * @module データベースへのアクセス機能を提供します。
 */
module.exports = {
  /**
   * @description SQLを実行します。
   * @param {Array, String} sqls - SQL
   * @param {Array, String} params - パラメータ
   * @returns {void}
   */
  run (sqls, params) {
    const dbProvider = require('@d/db-provider')
    const db = dbProvider.get()
    const _sqls = module.exports._toArray(sqls)
    const _params = module.exports._toArray(params)
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const results = []
        for (let i = 0; i < _sqls.length; i++) {
          // console.log(_sqls[i])
          db.run(
            _sqls[i],
            _params ? _params[i] : null,
            (err, result) => {
              if (err) {
                // console.log(_sqls[i])
                // console.log(_params[i])
                return reject(err)
              }

              results.push(result)
              if (i >= _sqls.length - 1) {
                return resolve(results)
              } else {
                return result
              }
            }
          )
        }
      })
    })
  },
  /**
   * @description SQLを実行し、結果を取得します。
   * @param {Array, String} sqls - SQL
   * @param {Array, String} params - パラメータ
   * @returns {void}
   */
  all (sqls, params) {
    const dbProvider = require('@d/db-provider')
    const db = dbProvider.get()
    const _sqls = module.exports._toArray(sqls)
    const _params = module.exports._toArray(params)
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const results = []
        for (let i = 0; i < _sqls.length; i++) {
          // console.log(_sqls[i])
          db.all(
            _sqls[i],
            _params ? _params[i] : null,
            (err, rows) => {
              if (err) return reject(err)

              results.push(rows)
              if (i >= _sqls.length - 1) {
                return resolve(_sqls.length <= 1 ? rows : results)
              } else {
                return rows
              }
            }
          )
        }
      })
    })
  },
  /**
   * @description 渡された値を配列に変換します。
   * @param {String} val - 値
   */
  _toArray (val) {
    return Array.isArray(val) ? val : [val]
  }

}
