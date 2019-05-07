'use strict'

/* global describe, it, beforeEach, afterEach */

const expect = require('chai').expect
const adapter = require('../adapters/filesystem')
const fs = require('fs')
const cp = require('child_process')

describe('filesystem adapter', () => {
  describe('uploading a file', () => {
    beforeEach(() => {
      cp.execSync(`rm -rf ${__dirname}/files`)
      cp.execSync(`mkdir ${__dirname}/files`)
    })

    afterEach(() => {
      cp.execSync(`rm -rf ${__dirname}/files`)
    })
    it('upload should successfully upload a file buffer', async () => {
      // given
      const config = { provider: 'filesystem', path: `${__dirname}/files` }
      const client = adapter(config)

      // when
      await client.upload('my-file.txt', Buffer.from('asdasdasd'), {})

      // then
      const file = fs.readFileSync(`${__dirname}/files/my-file.txt`, 'utf8')
      expect(file).to.equal('asdasdasd')
    })

    it('upload should successfully upload a file string', async () => {
      // given
      const config = { provider: 'filesystem', path: `${__dirname}/files` }
      const client = adapter(config)

      // when
      await client.upload('my-file.txt', 'asdasdasd', {})

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
    it('download should successfully download a file', (done) => {
      // given
      const config = { provider: 'filesystem', path: `${__dirname}/files` }
      const client = adapter(config)

      // when
      const download = client.download('my-file.txt', {})

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

    it('setting type option to buffer should download whole file buffer', async () => {
      // given
      const config = { provider: 'filesystem', path: `${__dirname}/files` }
      const client = adapter(config)

      // when
      const fileBuffer = await client.download('my-file.txt', { type: 'buffer' })

      // then
      expect(fileBuffer.toString()).to.equal('asdasdasd\n')
    })
  })
})
