'use strict'

/* global describe, it, before */

const expect = require('chai').expect
const sharp = require('sharp')
const { Readable, PassThrough } = require('stream')
const adapter = require('../adapters/amazon')
const storage = require('../index')

// These exercise the adapter against a real S3 API, because the failures they
// guard against (signing a stream body, calculating its checksum) only happen
// inside the SDK. Point S3_TEST_ENDPOINT at a local S3 mimic to run them:
//
//   S3_TEST_ENDPOINT=http://localhost:4566 S3_TEST_BUCKET=my-bucket npm test
//
const endpoint = process.env.S3_TEST_ENDPOINT
const container = process.env.S3_TEST_BUCKET || 'cloud-storage-test'

if (endpoint === undefined) {
  console.warn('S3_TEST_ENDPOINT is not set - amazon adapter tests will be skipped')
}

const config = {
  provider: 'amazon',
  region: process.env.S3_TEST_REGION || 'ap-southeast-2',
  container,
  endpoint,
  s3ForcePathStyle: true,
  keyId: process.env.S3_TEST_KEY_ID || 'test',
  key: process.env.S3_TEST_KEY || 'test',
}

// Already-piped sources are in flowing mode, which is how callers hand us
// busboy uploads and is what the SDK cannot checksum on its own.
const flowingStream = (buffer) => Readable.from([buffer]).pipe(new PassThrough())

const suite = endpoint ? describe : describe.skip

suite('amazon adapter', () => {
  let client
  let png

  before(async () => {
    client = adapter(config)
    png = await sharp({ create: { width: 400, height: 300, channels: 3, background: '#336699' } })
      .png()
      .toBuffer()
  })

  describe('uploading a file', () => {
    it('should upload a buffer', async () => {
      await client.upload('test/buffer.txt', Buffer.from('a buffer body'), { ContentType: 'text/plain' })

      const downloaded = await client.download('test/buffer.txt', { type: 'buffer' })
      expect(downloaded.toString()).to.equal('a buffer body')
    })

    it('should upload a stream of unknown length', async () => {
      await client.upload('test/stream.txt', flowingStream(Buffer.from('a streamed body')), {
        ContentType: 'text/plain',
      })

      const downloaded = await client.download('test/stream.txt', { type: 'buffer' })
      expect(downloaded.toString()).to.equal('a streamed body')
    })

    it('should return the content type it was given', async () => {
      const res = await client.upload('test/typed.txt', Buffer.from('body'), { ContentType: 'text/plain' })

      expect(res.ContentType).to.equal('text/plain')
    })
  })

  describe('uploading an image through the module', () => {
    const imageOptions = () => ({
      ContentType: 'image/png',
      maxSize: 2400,
      thumbnails: [{ label: 'thumb', height: 200, isThumb: true }],
    })

    it('should upload every version of a streamed image', async () => {
      const results = await storage({ adapter: config }).upload('test/streamed.png', flowingStream(png), imageOptions())

      expect(results).to.have.lengthOf(2)
      expect(results.map((result) => [result.width, result.height])).to.deep.equal([
        [400, 300],
        [267, 200],
      ])

      const original = await client.download('test/streamed.png', { type: 'buffer' })
      const thumbnail = await client.download('test/streamedthumb.png', { type: 'buffer' })
      expect((await sharp(original).metadata()).width).to.equal(400)
      expect((await sharp(thumbnail).metadata()).height).to.equal(200)
    })
  })

  describe('downloading a file', () => {
    it('should download as a stream when asked', async () => {
      await client.upload('test/downloadable.txt', Buffer.from('stream me'), { ContentType: 'text/plain' })

      const body = await client.download('test/downloadable.txt', { type: 'stream' })
      const chunks = []
      for await (const chunk of body) chunks.push(chunk)
      expect(Buffer.concat(chunks).toString()).to.equal('stream me')
    })
  })

  describe('getting a signed url', () => {
    it('should resolve to a url for the object', async () => {
      const url = await client.getUrl('test/buffer.txt', {})

      expect(url).to.be.a('string')
      expect(url).to.contain('test/buffer.txt')
      expect(url).to.contain('X-Amz-Signature')
    })
  })
})
