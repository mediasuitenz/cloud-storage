'use strict'

const pkgcloud = require('pkgcloud')
const Readable = require('stream').Readable

module.exports = config => {
  const client = pkgcloud.storage.createClient(config)

  return {
    name: 'pkgcloud',
    upload (name, data, options) {
      return new Promise((resolve, reject) => {
        let writeStream = client.upload({
          container: config.container,
          remote: name
        })

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
        let stream = client.download({
          container: 'tmp-for-all-files',
          remote: name
        })

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
