'use strict'

const fs = require('fs')
const path = require('path')
const Readable = require('stream').Readable

module.exports = config => {
  // use config for setup here
  let storagePath = config.path
  let normalizedPath = path.normalize(`${storagePath}/`)

  return {
    upload (name, data, options) {
      options = options || {}

      return new Promise((resolve, reject) => {
        let writeStream = fs.createWriteStream(`${normalizedPath}${name}`)

        let stream = new Readable()
        stream._read = () => {
          stream.push(data)
          stream.push(null)
        }

        stream.pipe(writeStream)
        stream.on('error', err => reject(err))
        writeStream.on('success', () => resolve())
        writeStream.on('error', err => reject(err))
      })
    },
    download (name, options) {
      return new Promise((resolve, reject) => {
        let stream = fs.readFileStream(`${normalizedPath}${name}`)

        switch (options.type) {
          case 'buffer':
            let data = new Buffer('')
            stream.on('data', chunk => data = Buffer.concat([data, chunk]))
            stream.on('end', () => resolve(data))
            stream.on('error', err => reject(err))
            break
          default:
            resolve(stream)
        }
      })
    }
  }
}
