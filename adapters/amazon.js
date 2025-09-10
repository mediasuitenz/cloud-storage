'use strict'

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

module.exports = (config) => {
  const s3Params = {
    region: config.region,
  }

  if (config.keyId && config.key) {
    s3Params.credentials = {
      accessKeyId: config.keyId,
      secretAccessKey: config.key,
    }
  }

  // You can also specify an endpoint - for using a local s3 mimic
  if (config.endpoint) {
    s3Params.endpoint = config.endpoint
  }

  if (config.s3ForcePathStyle) {
    s3Params.forcePathStyle = config.s3ForcePathStyle
  }

  const client = new S3Client(s3Params)

  return {
    name: 'amazon',
    async upload(name, data, options) {
      const allowedParams = [
        'ACL',
        'ChecksumAlgorithm',
        'ContentDisposition',
        'ContentLength',
        'Metadata',
        'ServerSideEncryption',
        'StorageClass',
      ]
      let params = {
        Key: name,
        Body: data,
        Bucket: config.container,
      }

      Object.keys(options)
        .filter((key) => allowedParams.includes(key))
        .forEach((key) => {
          params[key] = options[key]
        })

      const command = new PutObjectCommand(params)

      const res = await client.send(command)

      res.ContentType = options.ContentType

      if (/^image\/.*/.test(options.ContentType)) {
        if (options.isThumb) res.isThumb = true
        res.width = options?.meta?.width
        res.height = options?.meta?.height
      }

      return res
    },
    async download(name, options) {
      let params = {
        Key: name,
        Bucket: config.container,
      }

      const command = new GetObjectCommand(params)
      const res = await client.send(command)

      if (options.type === 'stream') {
        return res.Body
      } else {
        const chunks = []
        for await (const chunk of res.Body) chunks.push(chunk)
        return Buffer.concat(chunks)
      }
    },
    async getUrl(name, options) {
      options = options || {}
      const expiresIn = options?.expiresIn || 3600
      const commandType = options?.command
      let params = options.params || {}
      let command
      params = {
        ...params,
        Bucket: config.container,
        Key: name,
      }
      switch (commandType) {
        case 'PUT':
          command = new PutObjectCommand(params)
          break
        case 'GET':
        default:
          command = new GetObjectCommand(params)
          break
      }
      const preSignedUrl = await getSignedUrl(client, command, { expiresIn })
      return preSignedUrl
    },
  }
}
