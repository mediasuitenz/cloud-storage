'use strict'

const R = require('ramda')
const pkgcloudTypes = ['rackspace', 'azure', 'google', 'hp', 'openstack']

module.exports.create = adapterConfig => {
  let type = adapterConfig.provider
  if (R.contains(type, pkgcloudTypes)) {
    type = 'pkgcloud'
  }
  return require(`./adapters/${type}.js`)(adapterConfig)
}
