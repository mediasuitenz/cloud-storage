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
    it('should upload using filesystem adapter', async () => {
      // given
      const config = {
        adapter: {
          provider: 'filesystem',
          path: `${__dirname}/files`
        }
      }
      const client = storage(config)

      // when
      await client.upload('my-file.txt', Buffer.from('asdasdasd'))

      // then
      const file = fs.readFileSync(`${__dirname}/files/my-file.txt`, 'utf8')
      expect(file).to.equal('asdasdasd')
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
      const config = {
        adapter: {
          provider: 'filesystem',
          path: `${__dirname}/files`
        }
      }
      const client = storage(config)

      // when
      const download = client.download('my-file.txt')

      // then
      download.then(fileStream => {
        let data = ''
        fileStream.on('data', chunk => { data += chunk })
        fileStream.on('end', () => {
          expect(data).to.equal('asdasdasd\n')
          done()
        })
      }).catch(() => {
        expect(false).to.be.ok()
        done()
      })
    })
  })
})
