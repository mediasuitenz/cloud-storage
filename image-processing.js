'use strict'
const R = require('ramda')
const stream = require('stream')
const sharp = require('sharp')

const renameThumb = (name, options) => {
  const dotIndex = name.lastIndexOf('.')
  const dotExtension = name.slice(dotIndex)
  const filename = name.slice(0, dotIndex)
  const label = options.label || `@${options.width}x${options.height}`

  return `${filename}${label}${dotExtension}`
}

module.exports = (client, inputArgs, cache) => {
  const name = inputArgs.name
  const data = inputArgs.data
  const options = inputArgs.options
  const setMeta = info => { options.meta = info }
  let originalData, fullsize

  if ((inputArgs.data instanceof stream.Stream)) {
    originalData = new stream.PassThrough()
    data.pipe(originalData)
    fullsize = originalData.pipe(sharp().resize(options.maxSize, options.maxSize).max().withoutEnlargement().on('info', setMeta))
  } else {
    originalData = data
    fullsize = sharp(originalData).resize(options.maxSize, options.maxSize).max().withoutEnlargement().on('info', setMeta)
  }

  const originalUpload = client.upload(name, fullsize, options).then(cache.put(name, data))
  const uploads = [originalUpload]

  // add check for mimetype before trying to do image processing

  if (options.thumbnails && Array.isArray(options.thumbnails)) {
    options.thumbnails.forEach(thumbOptions => {
      const thumbname = renameThumb(name, thumbOptions)
      const addMeta = meta => { versionOptions.meta = meta }
      const versionOptions = R.clone(options)
      versionOptions.isThumb = thumbOptions.isThumb
      let resizedData

      if (data instanceof stream.Stream) {
        const dataCopy = new stream.PassThrough()
        data.pipe(dataCopy)
        resizedData = dataCopy.pipe(sharp().resize(thumbOptions.width, thumbOptions.height).on('info', addMeta))
      } else {
        resizedData = sharp(data).resize(thumbOptions.width, thumbOptions.height).on('info', addMeta)
      }

      const uploadPromise = client.upload(thumbname, resizedData, versionOptions).then(cache.put(thumbname, resizedData))
      uploads.push(uploadPromise)
    })
  }

  const returnValue = Promise.all(uploads)

  return (returnValue.length === 1) ? returnValue[0] : returnValue
}
