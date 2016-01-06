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

## Providers

Supports any providers supported by package cloud. See [pgkcloud storage](https://www.npmjs.com/package/pkgcloud#storage) for more details.
- amazon
- azure
- hp
- rackspace
- openstack
- google

In addition supports local filestorage
- filesystem
