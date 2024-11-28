'use strict'

module.exports.create = adapterConfig => {
  let type = adapterConfig.provider
  return require(`./adapters/${type}.js`)(adapterConfig)
}
