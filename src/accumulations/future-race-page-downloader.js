'use strict'

/**
 * @module 開催予定レースのスクレイピング対象URL抽出機能を提供します。
 */
module.exports = {
  /**
   * @description ベースURL
   */
  BaseUrl: 'https://racev3.netkeiba.com',
  /**
   * @description 開催予定レースのスクレイピング対象のURLを抽出します。
   * @param {Object} param パラメータ
   * @param {Array} param.raceIds ダウンロード対象のレースIDリスト
   * @returns {void}
   */
  async download (params = {}) {
    // レースのトップページをダウンロード
    const downloader = require('@ac/page-downloader')
    const listPageFileName = await downloader.download({
      urls: [
        `${module.exports.BaseUrl}/top/index.html`
      ],
      fileNameGen: module.exports._genListFileName
    })

    // dom化
    const dom = require('@h/html-helper').toDom(listPageFileName[0])

    // レースのURLを抽出
    let urls = module.exports._extractRaceUrls(dom)

    // レースIDが指定されている場合はファイルをクリアし、対象を絞り込んでダウンロードする
    if (Array.isArray(params.raceIds)) {
      require('@ac/future-page-clearer').clear()
      urls = urls.filter(u => params.raceIds.some(id => u.includes(id)))
    }
    console.log(urls)

    // レースページをダウンロード
    await downloader.download({
      urls,
      fileNameGen: module.exports._getRaceFileName
    })
  },
  /**
   * @description 一覧ページのファイル名を生成します。
   * @returns {String} ファイル名
   */
  _genListFileName () {
    return 'resources/htmls/future-race-list/race-list.html'
  },
  /**
   * @description レースページのファイル名を生成します。
   * @param {String} url - ファイル名
   */
  _getRaceFileName (url) {
    const _url = new URL(url)
    const raceId = _url.searchParams.get('race_id')
    return `resources/htmls/future-races/${raceId}.html`
  },
  /**
   * @description レースのURLを抽出します。
   * @param {Object} dom - DOM
   * @returns {Array} レースのURLリスト
   */
  _extractRaceUrls (dom) {
    const tags = dom.window.document.querySelectorAll('.RaceList_DataItem a')
    const urls = [].slice.call(tags)
      .filter(tag => tag.href.includes('shutuba'))
      .map(tag => tag.href.replace('..', module.exports.BaseUrl))
    return urls
  }
}
