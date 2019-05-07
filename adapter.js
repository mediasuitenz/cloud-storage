'use strict'

const pkgcloudTypes = ['rackspace', 'azure', 'google', 'hp', 'openstack']

module.exports.create = adapterConfig => {
  let type = adapterConfig.provider
  if (pkgcloudTypes.includes(type)) {
    type = 'pkgcloud'
  }
  return require(`./adapters/${type}.js`)(adapterConfig)
}
