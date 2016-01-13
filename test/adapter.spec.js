'use strict'

/* global describe, it */

const expect = require('chai').expect
const adapter = require('../adapter')

describe('adapter', function () {
  it('should dynamically loading adapter from given provider name', () => {
    let config = { provider: 'filesystem' }
    let client = adapter.create(config)
    expect(client.name).to.equal('filesystem')
  })

  it('should dynamically loading pkgcloud adapter via provider name', function (done) {
    this.timeout(5000)
    let config = { provider: 'rackspace' }
    let client = adapter.create(config)
    expect(client.name).to.equal('pkgcloud')
    done()
  })

  it('should dynamically loading pkgcloud adapter via provider name', () => {
    let config = { provider: 'azure' }
    let client = adapter.create(config)
    expect(client.name).to.equal('pkgcloud')
  })
})
