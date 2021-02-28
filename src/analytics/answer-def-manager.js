'use strict'

const config = require('@/config-manager').get()
const creator = require('@an/learning-answer-creator')
let allDefs
let abilityDefs
let rageDefs

/**
 * @description 学習の正解定義機能を提供します。
 */
module.exports = {
  /**
   * @description 全ての学習定義を取得します。
   * @returns {Array} 全ての学習定義
   */
  getAllAnswerDefs () {
    if (!allDefs) {
      init()
    }
    return allDefs
  },
  /**
   * @description 馬能力の学習定義を取得します。
   * @returns {Array} 馬能力の学習定義
   */
  getAbilityAnswerDefs () {
    if (!abilityDefs) {
      init()
    }
    return abilityDefs
  },
  /**
   * @description レースの荒れ指標の学習定義を取得します。
   * @returns {Array} レースの荒れ指標の学習定義
   */
  getRageAnswerDefs () {
    if (!rageDefs) {
      init()
    }
    return rageDefs
  }
}

/**
 * @description 定義の初期化を行います。
 * @returns {void}
 */
function init () {
  let defs = [
    {
      key: 'earning-money',
      type: 'ability',
      creator: creator.createAnswerByOrderAndEarningMoney,
      name: 'abilityMoney',
      shortName: 'abiMo'
    },
    {
      key: 'recovery-rate',
      type: 'ability',
      creator: creator.createAnswerByTopThreeRecoveryRate,
      name: 'abilityRecovery',
      shortName: 'abiRe'
    },
    // {
    //   key: 'self-odds',
    //   type: 'ability',
    //   creator: creator.createAnswerByOdds,
    //   name: 'abilityOdds',
    //   shortName: 'abiOdds'
    // },
    // {
    //   key: 'post-earning',
    //   type: 'ability',
    //   creator: creator.createAnswerByPostEarningMoney,
    //   name: 'abilityPostMoney',
    //   shortName: 'abiPostMo'
    // },
    {
      key: 'rage-odds',
      type: 'rage',
      creator: creator.createAnswerByTopThreeOdds,
      name: 'rageOdds',
      shortName: 'rageOdds'
    },
    {
      key: 'rage-order',
      type: 'rage',
      creator: creator.createAnswerByOrderPopularityDiff,
      name: 'rageOrder',
      shortName: 'rageOrder'
    }
  ]
  defs = defs.map(d => {
    d.evalName = `${d.name}Eval`
    d.shortPathKey = `${d.shortName}Path`
    const root = d.type === 'ability'
      ? config.learningAbilityDir
      : config.learningRageDir
    d.rootDir = root
    d.predPath = `${root}pred-result-${d.key}.json`
    d.answerPath = `${root}answer-${d.key}.csv`
    return d
  })
  allDefs = defs
  abilityDefs = defs.filter(d => d.type === 'ability')
  rageDefs = defs.filter(d => d.type === 'rage')
}
