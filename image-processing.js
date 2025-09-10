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

module.exports = async (client, inputArgs, cache) => {
  const name = inputArgs.name
  const data = inputArgs.data
  const options = inputArgs.options
  const setMeta = (info) => {
    options.meta = info
  }
  const origOptions = {
    width: options.maxSize,
    height: options.maxSize,
    withoutEnlargement: true,
    fit: 'inside',
  }
  let originalData, fullsize

  if (inputArgs.data instanceof stream.Stream) {
    originalData = new stream.PassThrough()
    data.pipe(originalData)
    fullsize = await originalData.pipe(sharp().resize(origOptions).on('info', setMeta)).toBuffer()
  } else {
    originalData = data
    fullsize = await sharp(originalData).resize(origOptions).on('info', setMeta).toBuffer()
  }

  const originalUpload = client.upload(name, fullsize, options).then(() => cache.put(name, data))
  const uploads = [originalUpload]

  // add check for mimetype before trying to do image processing

  if (options.thumbnails && Array.isArray(options.thumbnails)) {
    const thumbnailPromises = options.thumbnails.map(async (thumbOptions) => {
      const thumbname = renameThumb(name, thumbOptions)
      const addMeta = (meta) => {
        versionOptions.meta = meta
      }
      const versionOptions = JSON.parse(JSON.stringify(options))
      const resizeOptions = {
        width: thumbOptions.width,
        height: thumbOptions.height,
      }
      versionOptions.isThumb = thumbOptions.isThumb
      let resizedData

      if (data instanceof stream.Stream) {
        const dataCopy = new stream.PassThrough()
        data.pipe(dataCopy)
        resizedData = await dataCopy.pipe(sharp().resize(resizeOptions).on('info', addMeta)).toBuffer()
      } else {
        resizedData = await sharp(data).resize(resizeOptions).on('info', addMeta).toBuffer()
      }

      return client.upload(thumbname, resizedData, versionOptions).then(() => cache.put(thumbname, resizedData))
    })
    uploads.push(...(await Promise.all(thumbnailPromises)))
  }

  return Promise.all(uploads)
}
