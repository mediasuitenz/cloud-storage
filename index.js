'use strict'

const R = require('ramda')
const adapter = require('./adapter')
const fileCache = require('./file-cache')
const processAndUploadImage = require('./image-processing')

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

      if (!/^image\/.*/.test(options.ContentType)) {
        return client.upload(name, data, options).then(cache.put(name, data))
      } else {
        const inputArgs = {name, data, options}
        return processAndUploadImage(client, inputArgs, cache)
      }
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
