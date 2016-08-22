# cloud-storage

Upload and download files from various providers.
The goal of this module is provide a simple file
upload and download abstraction allowing for the
possibility of switching out the provider at any
time without breaking existing code.

[![NPM](https://nodei.co/npm/cloud-storage.png?downloads=true&stars=true)](https://nodei.co/npm/@mediasuite/cloud-storage/)

[![Media Suite](http://mediasuite.co.nz/ms-badge.png)](http://mediasuite.co.nz)

[![Build Status](https://travis-ci.org/mediasuitenz/cloud-storage.svg)](https://travis-ci.org/mediasuitenz/cloud-storage)

## Installation

```
npm install @mediasuite/cloud-storage --save
```

## Usage

### require module
```js
const storage = require('@mediasuite/cloud-storage')
```

### setup configuration
```js
const config = {
  adapter: {
    provider: 'amazon',
    keyId: '', // access key id
    key: '', // secret key
    region: '', // amazon region
    container: '' // s3 bucket
  }
}
```

#### configuration options

##### pkgcloud providers

**Warning:** Currently only actively developing for filesystem and AWS, some features may not be supported for pkgcloud providers.


For pkgcloud providers see [pgkcloud storage](https://www.npmjs.com/package/pkgcloud#storage) for most options. In addition use key `container` to specify which cloud container to upload to. (For amazon this is a bucket)

##### filesystem provider
```js
{
  adapter: {
    provider: 'filesystem',
    path: '' // path on local filesystem
  }
}
```

### upload a file
```js
storage(config).upload('my-file.png', data)
  .then(() => {
    // do something
  })
  .catch(err => {
    // handle any errors
  })
```

### download a file
```js
storage(config).download('my-file.png')
  .then(fileStream => {
    // do something with fileStream
    // eg. in an express route -> fileStream.pipe(res)
  })
  .catch(err => {
    // handle error
    // eg. in express you might do
    //   res.type('application/json')
    //   res.status(500).send({ errors: err })
  })
```

#### download options

By default the download promise will resolve with a stream object. If you would
prefer, you can instead get back a full buffer of the file like so:

```js
let promise = storage(config).download('my-file.png', {
  type: 'buffer'
})
```

### Image Processing

Version 0.3.0 adds basic image processing, this feature currently adds thumbnail generation and limiting the size of saved images. See following example:
```js
const options = {
  ContentType: 'image/png', // important only works when specified

  maxSize: 1200,            // maximum size in pixels for x and y

  thumbnails: [             // array of image sizes to be generated
    {
      label: '_small',      // will be appended to filename: my-file_small.png
      height: 200,          // image size to generate, specifying only width or height will maintain aspect ratio
      isThumb: true         // identifier flag for thumbnail, should only be set once
    },
    {
      label: '_medium',
      height: 600
    }
  ]
}
storage(config).upload('my-file.png', data, options)
  .then(response => {
    // response will be an array with an element for each size, see below
  })
  .catch(err => {
    // handle any errors
  })
```

**Example Response**
```json
[
  {
    "key": "my-file.png",
    "ContentType": "image/png",
    "width": 1200,
    "height": 800
  },
  {
    "key": "my-file_small.png",
    "ContentType": "image/png",
    "width": 300,
    "height": 200,
    "isThumb": true
  },
  {
    "key": "my-file_medium.png",
    "ContentType": "image/png",
    "width": 900,
    "height": 600
  }
]
```

## Providers

**Warning:** Currently only actively developing for filesystem and AWS, some features may not be supported for pkgcloud providers.

Supports any providers supported by package cloud. See [pgkcloud storage](https://www.npmjs.com/package/pkgcloud#storage) for more details.
- amazon
- azure
- hp
- rackspace
- openstack
- google

In addition supports local filestorage
- filesystem
