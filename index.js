'use strict'

const R = require('ramda')
const adapter = require('./adapter')
const fileCache = require('./file-cache')

module.exports = config => {
  const defaults = {
    adapter: {
      provider: 'filesystem',
      path: __dirname
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
      return client.upload(name, data, options).then(cache.put(name, data))
    },
    download (name, options) {
      options = options || {}
      return cache.get(name, options)
        .catch(() => client.download(name).then(data => {
          return cache.put(name, data).then(() => data)
        }))
    }
  }
}
