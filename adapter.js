'use strict'

const R = require('ramda')
const pkgcloudTypes = ['amazon', 'rackspace', 'azure', 'google', 'hp', 'openstack']

module.exports = () => {
  return {
    create(config) {
      let type = config.adapter.provider
      if (R.contains(pkgcloudTypes, type)) {
        type = 'pkgcloud'
      }
      return require(`./adapter-${type}.js`)(config.adapter)
    }
  }
}
