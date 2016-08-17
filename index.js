'use strict'

const R = require('ramda')
const adapter = require('./adapter')
const fileCache = require('./file-cache')
const stream = require('stream')
const sharp = require('sharp')

const renameThumb = (name, options) => {
  const dotIndex = name.lastIndexOf('.')
  const dotExtension = name.slice(dotIndex)
  const filename = name.slice(0, dotIndex)
  const suffix = options.suffix || `@${options.width}x${options.height}`

  return `${filename}${suffix}${dotExtension}`
}

module.exports = config => {
  const defaults = {
    adapter: {
      provider: 'filesystem',
      path: process.cwd()
    },
    cache: {
      ttl: '',
      enable: false,
      path: ''
    }
  }

  config = R.merge(defaults, config)

  const client = adapter.create(config.adapter)
  const cache = fileCache.create(config.cache)

  return {
    upload (name, data, options) {
      options = options || {}
      const originalData = new stream.PassThrough()

      data.pipe(originalData)

      const originalUpload = client.upload(name, originalData, options).then(cache.put(name, data))
      const uploads = [originalUpload]

      // add check for mimetype before trying to do image processing

      if (options.thumbnails && Array.isArray(options.thumbnails)) {
        options.thumbnails.forEach((thumbOptions, i) => {
          const thumbname = renameThumb(name, thumbOptions)
          let resizedData

          if (data instanceof stream.Stream) {
            const dataCopy = new stream.PassThrough()
            data.pipe(dataCopy)
            resizedData = dataCopy.pipe(sharp().resize(thumbOptions.width, thumbOptions.height))
          } else {
            resizedData = sharp(data).resize(thumbOptions.width, thumbOptions.height)
          }
          const uploadPromise = client.upload(thumbname, resizedData, options).then(cache.put(thumbname, resizedData))
          uploads.push(uploadPromise)
        })
      }

      const returnValue = Promise.all(uploads)

      return (returnValue.length === 1) ? returnValue[0] : returnValue
    },
    download (name, options) {
      options = options || {}
      return cache.get(name, options)
        .catch(() => client.download(name, options).then(data => {
          return cache.put(name, data).then(() => data)
        }))
    },
    getUrl (name, options) {
      options = options || {}
      return client.getUrl(name, options)
    }
  }
}
