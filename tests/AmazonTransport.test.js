'use strict'

const { Transport } = require('@elastic/elasticsearch')
const assert = require('assert')

const AmazonTransport = require('../src/AmazonTransport')

describe('AmazonTransport', function () {
  it('extends Transport', function () {
    assert(AmazonTransport.prototype instanceof Transport)
  })

  describe('.request()', function () {
    const transport = new AmazonTransport({
      connectionPool: {
        getConnection: () => null
      }
    })

    it('calls the callback if provided', function (done) {
      transport.request({}, {}, () => done())
    })

    it('returns a Promise if callback not provided', function (done) {
      transport.request({}, {}).catch(() => done())
    })

    it('accepts callback in place of options', function (done) {
      transport.request({}, () => done())
    })
  })
})
