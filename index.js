// module usage looks something like:
//
// storage(config).upload('my-file.png', req.body).then(cb)
//
// storage(config).download('my-file.png').then(cb)

const R = require('ramda')
const adapter = require('./adapter')

function cacheFile () {
  // implement me (return a promise)
}

module.exports = config => {
  const defaults = {
    adapter: {
      provider: 'filesystem',
      path: ''
    },
    cache: {
      ttl: ''
      enable: false
    }
  }

  config = R.merge(defaults, config)

  const client = adapter.create(config.adapter)

  return {
    upload: (name, data) => {
      return client.upload(name, data)
        .then(cacheFile)
    },
    download: name => {
      return getFromCache(name)
        .catch(() => client.download(name).then(cacheFile))
    }
  }
}
