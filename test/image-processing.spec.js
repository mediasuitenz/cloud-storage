'use strict'

/* global describe, it, beforeEach */

const expect = require('chai').expect
const sharp = require('sharp')
const { Readable, PassThrough } = require('stream')
const processAndUploadImage = require('../image-processing')

// Mirrors the shape the amazon adapter returns: the upload response carries the
// key back to the caller, plus the dimensions it read off `options.meta`.
const fakeClient = (uploads) => ({
  upload: async (key, body, options) => {
    uploads.push({ key, size: body.length, contentType: options.ContentType })
    const res = { key, ContentType: options.ContentType }
    if (options.isThumb) res.isThumb = true
    res.width = options.meta && options.meta.width
    res.height = options.meta && options.meta.height
    return res
  },
})

const fakeCache = { put: () => Promise.resolve() }

// A source that has already been piped is in flowing mode, which is how
// callers hand us busboy uploads.
const flowingStream = (buffer) => Readable.from([buffer]).pipe(new PassThrough())

const imageOptions = () => ({
  ContentType: 'image/png',
  maxSize: 2400,
  thumbnails: [
    { label: 'thumb', height: 200, isThumb: true },
    { label: 'medium', height: 400 },
  ],
})

describe('image processing', () => {
  let source
  let uploads

  beforeEach(async () => {
    source = await sharp({ create: { width: 800, height: 600, channels: 3, background: '#336699' } })
      .png()
      .toBuffer()
    uploads = []
  })

  it('should resolve to the adapter response for every version', async () => {
    const results = await processAndUploadImage(
      fakeClient(uploads),
      { name: 'photo.png', data: source, options: imageOptions() },
      fakeCache,
    )

    expect(results).to.have.lengthOf(3)
    results.forEach((result) => expect(result).to.be.an('object'))
    expect(results.map((result) => result.key)).to.deep.equal(['photo.png', 'photothumb.png', 'photomedium.png'])
  })

  it('should record the dimensions of every version', async () => {
    const results = await processAndUploadImage(
      fakeClient(uploads),
      { name: 'photo.png', data: source, options: imageOptions() },
      fakeCache,
    )

    expect(results.map((result) => [result.width, result.height])).to.deep.equal([
      [800, 600],
      [267, 200],
      [533, 400],
    ])
  })

  it('should flag the thumbnail version', async () => {
    const results = await processAndUploadImage(
      fakeClient(uploads),
      { name: 'photo.png', data: source, options: imageOptions() },
      fakeCache,
    )

    expect(results.filter((result) => result.isThumb).map((result) => result.key)).to.deep.equal(['photothumb.png'])
  })

  it('should upload every version when given a stream', async () => {
    const results = await processAndUploadImage(
      fakeClient(uploads),
      { name: 'photo.png', data: flowingStream(source), options: imageOptions() },
      fakeCache,
    )

    expect(uploads.map((upload) => upload.key)).to.have.members(['photo.png', 'photothumb.png', 'photomedium.png'])
    uploads.forEach((upload) => expect(upload.size).to.be.above(0))
    expect(results.map((result) => [result.width, result.height])).to.deep.equal([
      [800, 600],
      [267, 200],
      [533, 400],
    ])
  })

  it('should produce the same versions from a stream as from a buffer', async () => {
    const fromBuffer = await processAndUploadImage(
      fakeClient([]),
      { name: 'photo.png', data: source, options: imageOptions() },
      fakeCache,
    )
    const fromStream = await processAndUploadImage(
      fakeClient([]),
      { name: 'photo.png', data: flowingStream(source), options: imageOptions() },
      fakeCache,
    )

    expect(fromStream).to.deep.equal(fromBuffer)
  })

  it('should upload only the original when no thumbnails are requested', async () => {
    const results = await processAndUploadImage(
      fakeClient(uploads),
      { name: 'photo.png', data: flowingStream(source), options: { ContentType: 'image/png' } },
      fakeCache,
    )

    expect(uploads.map((upload) => upload.key)).to.deep.equal(['photo.png'])
    expect(results).to.have.lengthOf(1)
    expect(results[0].width).to.equal(800)
  })
})
