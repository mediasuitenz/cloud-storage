'use strict'

/* global describe, it, beforeEach, afterEach */

const expect = require('chai').expect
const fs = require('fs')
const cp = require('child_process')
const rewire = require('rewire')
let adapter = rewire('../adapter-amazon')

const AWS = {
  S3: function () {
    this.upload = (params, cb) => {
      fs.writeFileSync(`${__dirname}/files/${params.Key}`, params.Body)
      cb(null, 'success')
    }
    this.getObject = (params, cb) => {
      cb(null, fs.createReadStream(`${__dirname}/files/${params.Key}`))
    }
    this.getSignedUrl = (operation, params, cb) => {
      cb(null, 'http://sub.domain.tld/path/to/file')
    }
  }
}

adapter.__set__('AWS', AWS)

describe('amazon adapter', () => {
  describe('uploading a file', () => {
    beforeEach(() => {
      cp.execSync(`rm -rf ${__dirname}/files`)
      cp.execSync(`mkdir ${__dirname}/files`)
    })

    afterEach(() => {
      cp.execSync(`rm -rf ${__dirname}/files`)
    })
    it('upload should successfully upload a file', (done) => {
      // given
      let config = { provider: 'amazon', container: `${__dirname}/files` }
      let client = adapter(config)

      // when
      let upload = client.upload('my-file.txt', new Buffer('asdasdasd'), {})

      // then
      upload.then(() => {
        let file = fs.readFileSync(`${__dirname}/files/my-file.txt`, 'utf8')
        expect(file).to.equal('asdasdasd')
        done()
      }).catch(() => {
        expect(false).to.be.ok
        done()
      })
    })
  })
  describe('downloading a file', () => {
    beforeEach(() => {
      cp.execSync(`rm -rf ${__dirname}/files`)
      cp.execSync(`mkdir ${__dirname}/files`)
      cp.execSync(`echo "asdasdasd" > ${__dirname}/files/my-file.txt`)
    })

    afterEach(() => {
      cp.execSync(`rm -rf ${__dirname}/files`)
    })

    it('download should successfully download a file', (done) => {
      // given
      let config = { provider: 'amazon', container: 'dummy' }
      let client = adapter(config)

      // when
      let download = client.download('my-file.txt', {})

      // then
      download.then(fileStream => {
        let data = ''
        fileStream.on('data', chunk => data += chunk)
        fileStream.on('end', () => {
          expect(data).to.equal('asdasdasd\n')
          done()
        })
      }).catch(() => {
        expect(false).to.be.ok
        done()
      })
    })
  })

  describe('getting a signed url', () => {
    it('should return a promise that resolves to a url', (done) => {
      // given
      let config = { provider: 'amazon', container: 'dummy' }
      let client = adapter(config)

      // when
      let url = client.getUrl('my-file.txt', {})

      // then
      url.then(url => {
        expect(url).to.equal('http://sub.domain.tld/path/to/file')
        done()
      }).catch(() => {
        expect(false).to.be.ok
        done()
      })
    })
  })
})
