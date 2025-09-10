import storage from '../index.js'
import fs, { readFileSync } from 'fs'

const config = {
  adapter: {
    provider: 'amazon',
    region: 'ap-southeast-2', // amazon region
    container: 'mws-files-local', // s3 bucket
    endpoint: 'http://localhost:4566',
    s3ForcePathStyle: true,
  },
}

try {
  console.log('===== UPLOAD TEXT =====')
  await storage(config).upload('readme.txt', `${new Date()}`)
} catch (e) {
  console.error(e)
}

try {
  console.log('===== UPLOAD IMAGE =====')
  const data = readFileSync('sample.png')

  const options = {
    ContentType: 'image/png', // important only works when specified
    maxSize: 1200, // maximum size in pixels for x and y
    thumbnails: [
      {
        label: '_small', // will be appended to filename: my-file_small.png
        height: 200, // image size to generate, specifying only width or height will maintain aspect ratio
        isThumb: true, // identifier flag for thumbnail, should only be set once
      },
    ],
  }
  await storage(config).upload('sample.png', data, options)
} catch (e) {
  console.error(e)
}

try {
  console.log('===== UPLOAD IMAGE2 =====')
  const data = readFileSync('sample.png')

  await storage(config).upload('sample2.png', data)
} catch (e) {
  console.error(e)
}

try {
  console.log('===== DOWNLOAD =====')
  const res = await storage(config).download('readme.txt', { type: 'stream' })
  res.on('data', (d) => console.dir(d.toString()))
  res.on('end', () => console.dir('stream end'))
} catch (e) {
  console.error(e)
}

try {
  console.log('===== DOWNLOAD2 =====')
  await storage(config).download('readme.txt', { type: 'buffer' })
} catch (e) {
  console.error(e)
}

try {
  console.log('===== GETURL =====')
  await storage(config).getUrl('readme.txt')
} catch (e) {
  console.error(e)
}
