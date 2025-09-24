'use strict'

let AWS = require('aws-sdk')

module.exports = config => {
  const s3Params = {
    region: config.region,
    params: {
      Bucket: config.container
    }
  }

  if (config.keyId && config.key) {
    // If we are provided with the AWS AccessKey and SecretAccessKey
    s3Params.accessKeyId = config.keyId
    s3Params.secretAccessKey = config.key
  } else {
    // If we need to infer our identity from the environment
    AWS.config.getCredentials((err) => {
      if (err) throw err
    })
  }

  if (config.endpoint) {
    s3Params.endpoint = config.endpoint
  }

  if (config.s3ForcePathStyle) {
    s3Params.s3ForcePathStyle = config.s3ForcePathStyle
  }

  const client = new AWS.S3(s3Params)

  return {
    name: 'amazon',
    upload (name, data, options) {
      return new Promise((resolve, reject) => {
        let params = {
          Key: name,
          Body: data
        }
        Object.keys(options).forEach(key => { params[key] = options[key] })
        client.upload(params, (err, res) => {
          if (err) return reject(err)

          res.ContentType = options.ContentType
          if (/^image\/.*/.test(options.ContentType)) {
            if (options.isThumb) res.isThumb = true
            res.width = options.meta.width
            res.height = options.meta.height
          }
          return resolve(res)
        })
      })
    },
    download (name, options) {
      let params = {
        Key: name
      }
      return new Promise((resolve, reject) => {
        if (options.type === 'stream') {
          return resolve(client.getObject(params).createReadStream())
        }
        client.getObject(params, (err, res) => {
          if (err) return reject(err)

          return resolve(res)
        })
      })
    },
    getUrl (name, options) {
      options = options || {}
      let operation = options.operation || 'getObject'
      let params = options.params || {}
      params = {
        ...params,
        Key: name
      }
      return new Promise((resolve, reject) => {
        client.getSignedUrl(operation, params, (err, url) => {
          if (err) return reject(err)

          return resolve(url)
        })
      })
    }
  }
}
