'use strict'

let AWS = require('aws-sdk')

module.exports = config => {
  const client = new AWS.S3({
    accessKeyId: config.keyId,
    secretAccessKey: config.key,
    region: config.region,
    params: {
      Bucket: config.container
    }
  })

  return {
    name: 'amazon',
    upload (name, data, options) {
      return new Promise((resolve, reject) => {
        let params = {
          Key: name,
          Body: data
        }
        client.upload(params, (err, res) => {
          if (err) reject(err)

          resolve(res)
        })
      })
    },
    download (name, options) {
      let params = {
        Key: name
      }
      return new Promise((resolve, reject) => {
        client.getObject(params, (err, res) => {
          if (err) reject(err)

          resolve(res)
        })
      })
    },
    getUrl (name, options) {
      options = options || {}
      let operation = options.operation || 'getObject'
      let params = {
        Key: name
      }
      return new Promise((resolve, reject) => {
        client.getSignedUrl(operation, params, (err, url) => {
          if (err) reject(err)

          resolve(url)
        })
      })
    }
  }
}
