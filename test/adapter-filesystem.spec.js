'use strict'

/* global describe, it, beforeEach, afterEach */

const expect = require('chai').expect
const adapter = require('../adapter-filesystem')
const fs = require('fs')
const cp = require('child_process')

describe('adapter-filesystem', function () {
  beforeEach(() => {
    cp.execSync(`rm -rf ${__dirname}/files`)
    cp.execSync(`mkdir ${__dirname}/files`)
  })

  afterEach(() => {
    cp.execSync(`rm -rf ${__dirname}/files`)
  })

  describe('filesystem adapter', () => {
    describe('uploading a file', () => {
      it('upload should successfully upload a file buffer', (done) => {
        // given
        let config = { provider: 'filesystem', path: `${__dirname}/files` }
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

      it('upload should successfully upload a file string', (done) => {
        // given
        let config = { provider: 'filesystem', path: `${__dirname}/files` }
        let client = adapter(config)

        // when
        let upload = client.upload('my-file.txt', 'asdasdasd', {})

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
  })
  describe('downloading a file', () => {

  })
})
