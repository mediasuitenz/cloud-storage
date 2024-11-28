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
  it('should dynamically loading adapter from given provider name', () => {
    let config = { provider: 'amazon' }
    let client = adapter.create(config)
    expect(client.name).to.equal('amazon')
  })
})
