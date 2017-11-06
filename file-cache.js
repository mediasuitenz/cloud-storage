'use strict'

module.exports.create = config => {
  return {
    get (name) {
      return new Promise((resolve, reject) => {
        return reject(new Error('Cache is not implemented, go about your business'))
      })
    },
    put (name, data) {
      return new Promise((resolve, reject) => {
        return resolve()
      })
    }
  }
}
