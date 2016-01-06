'use strict'

module.exports.create = config => {
  return {
    get (name) {
      return new Promise((resolve, reject) => {
        reject()
      })
    },
    put (name, data) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }
}
