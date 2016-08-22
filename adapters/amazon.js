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
        Object.keys(options).forEach(key => params[key] = options[key])
        client.upload(params, (err, res) => {
          if (err) reject(err)

          res.ContentType = options.ContentType
          if (/^image\/.*/.test(options.ContentType)) {
            if (options.isThumb) res.isThumb = true
            res.width = options.meta.width
            res.height = options.meta.height
          }
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
