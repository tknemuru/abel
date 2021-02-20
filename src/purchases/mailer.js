'use strict'

const configManager = require('@/config-manager')
const nodemailer = require('nodemailer')

/**
 * @description メール送信機能を提供します。
 */
module.exports = {
  /**
   * @description メールを送信します。
   * @returns {void}
   */
  send (param) {
    return new Promise((resolve, reject) => {
      const config = configManager.get().mail
      const transporter = nodemailer.createTransport({
        service: config.service,
        secure: true,
        auth: {
          user: config.user,
          pass: config.pass
        }
      })
      console.log('send mail start')
      transporter.sendMail({
        from: config.from,
        to: config.to,
        subject: param.subject,
        text: param.text
      }, (err, reply) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log(reply)
        resolve(reply)
      })
    })
  }
}
