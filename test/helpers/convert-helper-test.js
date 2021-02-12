/* eslint-disable no-undef */
const chai = require('chai')
const { expect } = chai
const helper = require('../../src/helpers/convert-helper')

it('convert-helper#convFinishingTime 1分以上のタイムの変換ができる', () => {
  const actual = helper.convFinishingTime('2:14.5')
  const expected = (60 * 2) + 14.5
  expect(actual).to.eql(expected)
})

it('convert-helper#convFinishingTime 1分未満のタイムの変換ができる', () => {
  const actual = helper.convFinishingTime('0:55.9')
  const expected = 55.9
  expect(actual).to.eql(expected)
})

it('convert-helper#convLength 文字列着手の変換ができる', () => {
  let actual = helper.convLength('アタマ')
  let expected = 40
  expect(actual).to.eql(expected)

  actual = helper.convLength('大')
  expected = 2640
  expect(actual).to.eql(expected)
})

it('convert-helper#convLength 数字着手の変換ができる', () => {
  // 整数
  let actual = helper.convLength('3')
  let expected = 240 * 3
  expect(actual).to.eql(expected)

  // 小数
  actual = helper.convLength('1/2')
  expected = 120
  expect(actual).to.eql(expected)

  actual = helper.convLength('1.3/4')
  expected = 240 + 180
  expect(actual).to.eql(expected)
})

it('convert-helper#convLength 空文字と+を含む文字列は-1が返却される', () => {
  let actual = helper.convLength('')
  let expected = 0
  expect(actual).to.eql(expected)

  actual = helper.convLength('1.1/4+ハナ')
  expected = 0
  expect(actual).to.eql(expected)
})

it('convert-helper#convHorseWeight 馬体重の変換ができる', () => {
  // 増減無し
  const actual = helper.convHorseWeight('470(0)')
  const expected = {
    weight: 470,
    diff: 0
  }
  expect(actual).to.eql(expected)
})

it('convert-helper#convRaceSurface 有効なレース場の変換ができる', () => {
  let actual = helper.convRaceSurface('ダ左')
  let expected = {
    surface: 1,
    direction: 2
  }
  expect(actual).to.eql(expected)

  actual = helper.convRaceSurface('芝右外')
  expected = {
    surface: 2,
    direction: 3
  }
  expect(actual).to.eql(expected)
})

it('convert-helper#convRaceSurface 対象外のレース場の変換ができる', () => {
  const expected = {
    surface: -1,
    direction: -1
  }
  let actual = helper.convRaceSurface('芝右内2周')
  expect(actual).to.eql(expected)
  actual = helper.convRaceSurface('芝直線')
  expect(actual).to.eql(expected)
  actual = helper.convRaceSurface('障芝')
  expect(actual).to.eql(expected)
})

it('convert-helper#convWeather 有効な天気の変換ができる', () => {
  let actual = helper.convWeather('小雨')
  let expected = 1
  expect(actual).to.eql(expected)

  actual = helper.convWeather('雪')
  expected = 6
  expect(actual).to.eql(expected)
})

it('convert-helper#convSurfaceState 有効な馬場状態の変換ができる', () => {
  let actual = helper.convSurfaceState('ダート : 不良')
  let expected = 4
  expect(actual).to.eql(expected)

  actual = helper.convSurfaceState('芝 : 稍重')
  expected = 3
  expect(actual).to.eql(expected)
})

it('convert-helper#convSurfaceState 対象外の馬場状態の変換ができる', () => {
  const actual = helper.convSurfaceState('芝 : 不良  ダート : 不良')
  const expected = -1
  expect(actual).to.eql(expected)
})
