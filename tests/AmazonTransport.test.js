'use strict'

const { Transport } = require('@elastic/elasticsearch')
const assert = require('assert')

const { AmazonTransport } = require('../src')

describe('AmazonTransport', function () {
  const dummyConnectionPool = {
    getConnection: () => null
  }
  it('extends Transport', function () {
    assert(AmazonTransport.prototype instanceof Transport)
  })

  it('calls the callback if provided', function (done) {
    new AmazonTransport({
      connectionPool: dummyConnectionPool
    }).request({}, {}, () => done())
  })

  it('returns a promise if callback not provided', function (done) {
    new AmazonTransport({
      connectionPool: dummyConnectionPool
    }).request({}, {}).catch(() => done())
  })

  it('accepts callback in place of options', function (done) {
    new AmazonTransport({
      connectionPool: dummyConnectionPool
    }).request({}, () => done())
  })
})
