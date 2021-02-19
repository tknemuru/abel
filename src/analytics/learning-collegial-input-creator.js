'use strict'

const fs = require('fs')
const csvHelper = require('@h/csv-helper')
const configManager = require('@/config-manager')
const fileHelper = require('@h/file-helper')
const learningInputCreator = require('@an/learning-input-creator')
const learningConfig = require('@an/configs/learning-config')
const predictionConfig = require('@an/configs/prediction-config')
const predictionRageConfig = require('@an/configs/prediction-rage-config')
const learningRageInputCreator = require('@an/learning-rage-input-creator')
const learningRageConfig = require('@an/configs/learning-rage-config')
const path = require('path')
const predAdjuster = require('@an/prediction-result-adjuster')
const predictor = require('@s/predictor')
const purchaseHelper = require('@h/purchase-helper')

/**
 * @module 合議制学習用情報の作成機能を提供します。
 */
module.exports = {
  /**
   * @description 学習用情報を作成します。
   * @returns {void}
   */
  async create (param) {
    const config = configManager.get()
    // 既存ファイルを削除する
    clearFile(config)

    // 予測情報作成
    if (param.mode === 'future') {
      await learningInputCreator.create(predictionConfig)
      await learningRageInputCreator.create(predictionRageConfig)
    } else {
      await learningInputCreator.create(learningConfig)
      await learningRageInputCreator.create(learningRageConfig)
    }

    // 予測実施
    await predictor.predict({
      target: 'ability'
      // waitTime: 60000
    })
    await predictor.predict({
      target: 'rage'
      // waitTime: 80000
    })
    // 予測結果整形
    predAdjuster.adjust({
      target: 'ability'
    })
    predAdjuster.adjust({
      target: 'rage'
    })
    // 予測結果を読み込む
    const predResults = purchaseHelper.readAllPredResults()
    // 学習データとして加工して書き込む
    const inputs = predResults.map(p => {
      return [
        p.abilityMoneyEval,
        p.abilityRecoveryEval,
        p.rageOddsEval,
        p.rageOrderEval,
        p.odds
      ]
    })
    const inputCsv = csvHelper.toCsv(inputs)
    fileHelper.write(inputCsv, config.inputCollegialFilePath)
    // 正解データとして加工して書き込む
    const answers = predResults.map(p => [p.recoveryRate])
    const answerCsv = csvHelper.toCsv(answers)
    fileHelper.write(answerCsv, config.answerCollegialFilePath)
    // リレーションファイルをコピー
    fileHelper.copy(config.predAbilityRelationFilePath, config.predCollegialRelationFilePath)
  }
}

/**
 * @description ファイルを削除します。
 * @param {Object} config 設定情報
 * @returns {void}
 */
function clearFile (config) {
  const files = fs.readdirSync(config.learningCollegialDir)
    .map(f => path.join(config.learningCollegialDir, f))

  // 削除
  for (const file of files) {
    if (!fileHelper.existsFile(file)) {
      continue
    }
    fs.unlinkSync(file)
  }
}
