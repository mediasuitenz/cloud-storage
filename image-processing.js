'use strict'
const stream = require('stream')
const sharp = require('sharp')

const renameThumb = (name, options) => {
  const dotIndex = name.lastIndexOf('.')
  const dotExtension = name.slice(dotIndex)
  const filename = name.slice(0, dotIndex)
  const label = options.label || `@${options.width}x${options.height}`

  return `${filename}${label}${dotExtension}`
}

const toBuffer = async (source) => {
  const chunks = []
  for await (const chunk of source) chunks.push(chunk)
  return Buffer.concat(chunks)
}

module.exports = async (client, inputArgs, cache) => {
  const name = inputArgs.name
  const options = inputArgs.options
  // Consume the source once up front: this function awaits between uploads and a
  // stream cannot be piped again once it has been drained.
  const data = inputArgs.data instanceof stream.Stream ? await toBuffer(inputArgs.data) : inputArgs.data

  // Uploads must resolve to the adapter response so callers can record the
  // key and dimensions of each version.
  const upload = (key, body, uploadOptions) =>
    client.upload(key, body, uploadOptions).then((res) => cache.put(key, body).then(() => res))

  const resize = async (resizeOptions, uploadOptions) => {
    // sharp only emits 'info' in stream mode, so read the dimensions off toBuffer.
    const { data: resized, info } = await sharp(data).resize(resizeOptions).toBuffer({ resolveWithObject: true })
    uploadOptions.meta = info
    return resized
  }

  const fullsize = await resize(
    { width: options.maxSize, height: options.maxSize, withoutEnlargement: true, fit: 'inside' },
    options,
  )

  const uploads = [upload(name, fullsize, options)]

  if (options.thumbnails && Array.isArray(options.thumbnails)) {
    const thumbnailPromises = options.thumbnails.map(async (thumbOptions) => {
      const versionOptions = JSON.parse(JSON.stringify(options))
      versionOptions.isThumb = thumbOptions.isThumb

      const resizedData = await resize({ width: thumbOptions.width, height: thumbOptions.height }, versionOptions)

      return upload(renameThumb(name, thumbOptions), resizedData, versionOptions)
    })
    uploads.push(...(await Promise.all(thumbnailPromises)))
  }

  return Promise.all(uploads)
}
