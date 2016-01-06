'use strict'

/* global describe, it, beforeEach, afterEach */

const expect = require('chai').expect
const storage = require('../index')
const fs = require('fs')
const cp = require('child_process')

describe('module integration tests', () => {
  describe('uploading a file', () => {
    beforeEach(() => {
      cp.execSync(`rm -rf ${__dirname}/files`)
      cp.execSync(`mkdir ${__dirname}/files`)
    })

    afterEach(() => {
      cp.execSync(`rm -rf ${__dirname}/files`)
    })
    it('should upload using filesystem adapter', (done) => {
      // given
      let config = {
        adapter: {
          provider: 'filesystem',
          path: `${__dirname}/files`
        }
      }
      let client = storage(config)

      // when
      let upload = client.upload('my-file.txt', new Buffer('asdasdasd'))

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
    it('download using filesystem adapter', done => {
      // given
      let config = {
        adapter: {
          provider: 'filesystem',
          path: `${__dirname}/files`
        }
      }
      let client = storage(config)

      // when
      let download = client.download('my-file.txt')

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
})
