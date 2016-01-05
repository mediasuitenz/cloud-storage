'use strict'

const pkgcloud = require('pkgcloud')
const Readable = require('stream').Readable;

module.exports = config => {
  const client = pkgcloud.storage.createClient(config)

  return {
    upload: (name, data) => {
      return new Promise((resolve, reject) => {
        let writeStream = client.upload({
          container: config.container,
          remote: name
        })

        let stream = new Readable;
        stream._read = () => {
          stream.push(data)
          stream.push(null)
        }

        stream.pipe(writeStream)
        stream.on('error', err => reject(err))
        writeStream.on('success', resolve())
        writeStream.on('error', err => reject(err))
      })
    },
    download: (name) => {
      return new Promise((resolve, reject) => {
        let stream = client.download({
          container: 'tmp-for-all-files',
          remote: name
        })

        let data = new Buffer('')
        stream.on('data', chunk => data = Buffer.concat([data, chunk]))
        stream.on('end', () => resolve(data))
        stream.on('error', err => reject(err))
      })
    }
  }
}
