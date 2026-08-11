# cloud-storage

Upload and download files from various providers.
The goal of this module is to provide a simple file
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
    container: '', // s3 bucket
  },
}
```

#### configuration options

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
storage(config)
  .upload('my-file.png', data)
  .then(() => {
    // do something
  })
  .catch((err) => {
    // handle any errors
  })
```

### download a file

```js
storage(config)
  .download('my-file.png')
  .then((fileStream) => {
    // do something with fileStream
    // eg. in an express route -> fileStream.pipe(res)
  })
  .catch((err) => {
    // handle error
    // eg. in express you might do
    //   res.type('application/json')
    //   res.status(500).send({ errors: err })
  })
```

#### download options

By default, the download promise will resolve with a stream object. If preferred, you can instead get back a full buffer of the file like so:

```js
let promise = storage(config).download('my-file.png', {
  type: 'buffer',
})
```

### Image Processing

Version 0.3.0 adds basic image processing, this feature currently adds thumbnail generation and limiting the size of saved images. See following example:

```js
const options = {
  ContentType: 'image/png', // important only works when specified

  maxSize: 1200, // maximum size in pixels for x and y

  thumbnails: [
    // array of image sizes to be generated
    {
      label: '_small', // will be appended to filename: my-file_small.png
      height: 200, // image size to generate, specifying only width or height will maintain aspect ratio
      isThumb: true, // identifier flag for thumbnail, should only be set once
    },
    {
      label: '_medium',
      height: 600,
    },
  ],
}
storage(config)
  .upload('my-file.png', data, options)
  .then((response) => {
    // response will be an array with an element for each size, see below
  })
  .catch((err) => {
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

## Testing

```sh
npm test
```

The amazon adapter tests talk to a real S3 API, because the failures they guard against happen inside the AWS SDK rather than in this package. They are skipped unless `S3_TEST_ENDPOINT` is set, so point it at a local S3 mimic to run them:

```sh
docker run --rm -p 4566:4566 localstack/localstack
aws --endpoint-url http://localhost:4566 s3 mb s3://cloud-storage-test

S3_TEST_ENDPOINT=http://localhost:4566 npm test
```

`S3_TEST_BUCKET`, `S3_TEST_REGION`, `S3_TEST_KEY_ID` and `S3_TEST_KEY` override the bucket, region and credentials used.
