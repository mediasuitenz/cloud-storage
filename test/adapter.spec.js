'use strict'

/* global describe, Given, When, Then */

const expect = require('chai').expect
const adapter = require('../adapter')

describe('adapter', function () {
  describe('dynamically loading adapter from given provider name', function () {
    let config, client

    Given(() => config = { provider: 'filesystem' })
    When(() => client = adapter.create(config))
    Then(function () { expect(client.name).to.equal('filesystem') })
  })

  describe('dynamically loading pkgcloud adapter via provider name', function () {
    let config, client

    Given(() => config = { provider: 'amazon' })
    When(() => client = adapter.create(config))
    Then(function () { expect(client.name).to.equal('pkgcloud') })
  })

  describe('dynamically loading pkgcloud adapter via provider name', function () {
    let config, client

    Given(() => config = { provider: 'azure' })
    When(() => client = adapter.create(config))
    Then(function () { expect(client.name).to.equal('pkgcloud') })
  })
})
