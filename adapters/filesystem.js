'use strict'

const fs = require('fs')
const path = require('path')
const stream = require('stream')
const Readable = stream.Readable

module.exports = config => {
  // use config for setup here
  let storagePath = config.path
  let normalizedPath = path.normalize(`${storagePath}/`)

  return {
    name: 'filesystem',
    upload (name, data, options) {
      return new Promise((resolve, reject) => {
        const response = {
          key: name,
          ContentType: options.ContentType
        }

        const writeStream = fs.createWriteStream(`${normalizedPath}${name}`)
        writeStream.on('error', err => reject(err))
        writeStream.on('finish', () => {
          if (/^image\/.*/.test(options.ContentType)) {
            if (options.isThumb) response.isThumb = true
            response.width = options.meta.width
            response.height = options.meta.height
          }
          return resolve(response)
        })

        if (data instanceof stream.Stream) {
          data.pipe(writeStream)
        } else {
          let stream = new Readable()
          stream._read = () => {
            stream.push(data)
            stream.push(null)
          }
          stream.on('error', err => reject(err))
          stream.pipe(writeStream)
        }
      })
    },
    download (name, options) {
      return new Promise((resolve, reject) => {
        let stream = fs.createReadStream(`${normalizedPath}${name}`)

        switch (options.type) {
          case 'buffer':
            let data = new Buffer('')
            stream.on('data', chunk => { data = Buffer.concat([data, chunk]) })
            stream.on('end', () => resolve(data))
            stream.on('error', err => reject(err))
            break
          default:
            return resolve(stream)
        }
      })
    }
  }
}
