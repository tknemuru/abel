/* eslint-disable no-undef */
const chai = require('chai')
const { expect } = chai
const fs = require('fs')
const path = require('path')

const RUN_CONTRACT_TESTS = process.env.RUN_CONTRACT_TESTS === '1'
const LEARNINGS_DIR = path.join(__dirname, '../../resources/learnings')

describe('学習データ契約テスト', function () {
  before(function () {
    if (!RUN_CONTRACT_TESTS) {
      this.skip()
    }
  })

  describe('前提条件', function () {
    it('resources/learnings ディレクトリが存在すること', function () {
      const exists = fs.existsSync(LEARNINGS_DIR)
      expect(exists,
        'resources/learnings が存在しません。mkdir -p resources/learnings を実行してください'
      ).to.be.true
    })
  })

  describe('ファイル存在検証', function () {
    it('input.csv が存在し非空であること', function () {
      const filePath = path.join(LEARNINGS_DIR, 'input.csv')
      expect(fs.existsSync(filePath),
        'input.csv が存在しません。npm run learn-pre を実行してください'
      ).to.be.true
      const stat = fs.statSync(filePath)
      expect(stat.size,
        'input.csv が空です（0バイト）。npm run learn-pre を実行してください'
      ).to.be.greaterThan(0)
    })

    it('input-cols.json が存在し非空であること', function () {
      const filePath = path.join(LEARNINGS_DIR, 'input-cols.json')
      expect(fs.existsSync(filePath),
        'input-cols.json が存在しません。npm run learn-pre を実行してください'
      ).to.be.true
      const stat = fs.statSync(filePath)
      expect(stat.size,
        'input-cols.json が空です（0バイト）。npm run learn-pre を実行してください'
      ).to.be.greaterThan(0)
    })

    it('relation.json が存在し非空であること', function () {
      const filePath = path.join(LEARNINGS_DIR, 'relation.json')
      expect(fs.existsSync(filePath),
        'relation.json が存在しません。npm run learn-pre を実行してください'
      ).to.be.true
      const stat = fs.statSync(filePath)
      expect(stat.size,
        'relation.json が空です（0バイト）。npm run learn-pre を実行してください'
      ).to.be.greaterThan(0)
    })

    it('answer-*.csv が1つ以上存在すること', function () {
      const files = fs.readdirSync(LEARNINGS_DIR)
      const answerFiles = files.filter(f => f.startsWith('answer-') && f.endsWith('.csv'))
      expect(answerFiles.length,
        'answer-*.csv が存在しません。npm run learn-pre を実行してください'
      ).to.be.greaterThan(0)
    })
  })

  describe('input.csv 基本形式検証', function () {
    let content
    let buffer

    before(function () {
      const filePath = path.join(LEARNINGS_DIR, 'input.csv')
      if (!fs.existsSync(filePath)) {
        this.skip()
      }
      buffer = fs.readFileSync(filePath)
      content = buffer.toString('utf-8')
    })

    it('UTF-8 BOM がないこと', function () {
      const hasBOM = buffer.length >= 3 &&
        buffer[0] === 0xEF &&
        buffer[1] === 0xBB &&
        buffer[2] === 0xBF
      expect(hasBOM,
        'input.csv に UTF-8 BOM が含まれています（契約違反: BOMなしが期待）'
      ).to.be.false
    })

    it('改行コードが LF のみであること（CRLF なし）', function () {
      const hasCRLF = content.includes('\r\n')
      expect(hasCRLF,
        'input.csv に CRLF が含まれています（契約違反: LFのみが期待）'
      ).to.be.false
    })

    it('カンマ区切りであること（1行目にカンマが含まれる）', function () {
      const firstLine = content.split('\n')[0]
      expect(firstLine.includes(','),
        'input.csv の1行目にカンマがありません（CSV形式が期待）'
      ).to.be.true
    })

    it('行数が1以上であること（ゼロ件検知）', function () {
      const lines = content.split('\n').filter(line => line.trim().length > 0)
      expect(lines.length,
        'input.csv は 1 行以上のデータが必要（ゼロ件は契約違反）'
      ).to.be.greaterThan(0)
    })
  })

  describe('input-cols.json 構造検証', function () {
    let parsed

    before(function () {
      const filePath = path.join(LEARNINGS_DIR, 'input-cols.json')
      if (!fs.existsSync(filePath)) {
        this.skip()
      }
      const content = fs.readFileSync(filePath, 'utf-8')
      try {
        parsed = JSON.parse(content)
      } catch (e) {
        throw new Error(`input-cols.json の JSON パースに失敗: ${e.message}`)
      }
    })

    it('配列であること', function () {
      expect(Array.isArray(parsed),
        'input-cols.json は配列形式が期待されますが、配列ではありません'
      ).to.be.true
    })

    it('要素数が1以上であること', function () {
      expect(parsed.length,
        'input-cols.json は 1 要素以上が必要（空配列は契約違反）'
      ).to.be.greaterThan(0)
    })

    it('各要素が文字列であること', function () {
      const allStrings = parsed.every(item => typeof item === 'string')
      expect(allStrings,
        'input-cols.json の各要素は文字列が期待されます'
      ).to.be.true
    })
  })

  describe('relation.json 構造検証', function () {
    let parsed

    before(function () {
      const filePath = path.join(LEARNINGS_DIR, 'relation.json')
      if (!fs.existsSync(filePath)) {
        this.skip()
      }
      const content = fs.readFileSync(filePath, 'utf-8')
      try {
        parsed = JSON.parse(content)
      } catch (e) {
        // 複数回 learn-pre を実行すると ][  で連結された不正な JSON になる場合がある
        if (content.includes('][')) {
          throw new Error(
            'relation.json の JSON パースに失敗: ファイルが破損しています（複数のJSON配列が連結されている可能性）。' +
            'resources/learnings/ 内のファイルを削除して npm run learn-pre を再実行してください'
          )
        }
        throw new Error(`relation.json の JSON パースに失敗: ${e.message}`)
      }
    })

    it('配列であること', function () {
      expect(Array.isArray(parsed),
        'relation.json は配列形式が期待されますが、配列ではありません'
      ).to.be.true
    })

    it('要素数が1以上であること', function () {
      expect(parsed.length,
        'relation.json は 1 要素以上が必要（空配列は契約違反）'
      ).to.be.greaterThan(0)
    })

    it('各要素が raceId を持つこと', function () {
      const allHaveRaceId = parsed.every(item =>
        item.hasOwnProperty('raceId') && item.raceId !== undefined
      )
      expect(allHaveRaceId,
        'relation.json の各要素は raceId を持つ必要があります（主キー）'
      ).to.be.true
    })

    it('各要素が horseNumber を持つこと', function () {
      const allHaveHorseNumber = parsed.every(item =>
        item.hasOwnProperty('horseNumber') && item.horseNumber !== undefined
      )
      expect(allHaveHorseNumber,
        'relation.json の各要素は horseNumber を持つ必要があります（主キー）'
      ).to.be.true
    })
  })

  describe('データ整合性検証', function () {
    let inputLineCount
    let relationLength
    let answerFiles

    before(function () {
      const inputPath = path.join(LEARNINGS_DIR, 'input.csv')
      const relationPath = path.join(LEARNINGS_DIR, 'relation.json')

      if (!fs.existsSync(inputPath) || !fs.existsSync(relationPath)) {
        this.skip()
      }

      const inputContent = fs.readFileSync(inputPath, 'utf-8')
      inputLineCount = inputContent.split('\n').filter(line => line.trim().length > 0).length

      const relationContent = fs.readFileSync(relationPath, 'utf-8')
      try {
        const relation = JSON.parse(relationContent)
        relationLength = relation.length
      } catch (e) {
        // relation.json 構造検証で詳細なエラーを出すのでここではスキップ
        this.skip()
      }

      const files = fs.readdirSync(LEARNINGS_DIR)
      answerFiles = files.filter(f => f.startsWith('answer-') && f.endsWith('.csv'))
    })

    it('input.csv の行数と relation.json の要素数が一致すること', function () {
      expect(inputLineCount,
        `input.csv の行数 (${inputLineCount}) と relation.json の要素数 (${relationLength}) が一致しません`
      ).to.equal(relationLength)
    })

    it('各 answer-*.csv の行数が input.csv と一致すること', function () {
      for (const answerFile of answerFiles) {
        const answerPath = path.join(LEARNINGS_DIR, answerFile)
        const answerContent = fs.readFileSync(answerPath, 'utf-8')
        const answerLineCount = answerContent.split('\n').filter(line => line.trim().length > 0).length

        expect(answerLineCount,
          `${answerFile} の行数 (${answerLineCount}) と input.csv の行数 (${inputLineCount}) が一致しません`
        ).to.equal(inputLineCount)
      }
    })
  })
})
