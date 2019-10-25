'use strict'

const { Connection } = require('@elastic/elasticsearch')
const assert = require('assert')
const AWS = require('aws-sdk')
const { URL } = require('url')

const AmazonConnection = require('../src/AmazonConnection')

describe('AmazonConnection', function () {
  it('extends Connection', function () {
    assert(AmazonConnection.prototype instanceof Connection)
  })

  describe('.awsConfig', function () {
    it('reads from options.awsConfig', function () {
      const awsConfig = { foo: 'bar' }

      const connector = new AmazonConnection({
        url: new URL('https://foo.us-east-1.es.amazonaws.com'),
        awsConfig
      })

      assert.deepStrictEqual(connector.awsConfig, awsConfig)
    })

    it('reads from AWS.config if options.awsConfig is not set', function () {
      const connector = new AmazonConnection({
        url: new URL('https://foo.us-east-1.es.amazonaws.com')
      })

      assert(connector.awsConfig === AWS.config)
    })
  })

  describe('.credentials', function () {
    it('throws an error when no credentials are present', function () {
      assert.throws(function () {
        const connector = new AmazonConnection({
          url: new URL('https://foo.us-east-1.es.amazonaws.com')
        })
        const credentials = connector.credentials // eslint-disable-line no-unused-vars
      })
    })

    it('reads from options.awsConfig.credentials', function () {
      const credentials = {
        accessKeyId: 'foo1',
        secretAccessKey: 'bar1',
        sessionToken: 'baz1'
      }

      const connector = new AmazonConnection({
        url: new URL('https://foo.us-east-1.es.amazonaws.com'),
        awsConfig: { credentials }
      })

      assert.deepStrictEqual(connector.credentials, credentials)
    })

    it('reads from AWS.config', function () {
      const credentials = {
        accessKeyId: 'foo2',
        secretAccessKey: 'bar2',
        sessionToken: 'baz2'
      }

      AWS.config.update({ credentials })

      const connector = new AmazonConnection({
        url: new URL('https://foo.us-east-1.es.amazonaws.com')
      })

      assert.deepStrictEqual(connector.credentials, credentials)
    })

    it('reads the latest credentials from AWS.config after they are changed', function () {
      const credentials = {
        accessKeyId: 'foo21',
        secretAccessKey: 'bar21',
        sessionToken: 'baz21'
      }

      AWS.config.update({ credentials })

      const connector = new AmazonConnection({
        url: new URL('https://foo.us-east-1.es.amazonaws.com')
      })

      assert.deepStrictEqual(connector.credentials, credentials)

      const credentials2 = {
        accessKeyId: 'foo22',
        secretAccessKey: 'bar22',
        sessionToken: 'baz22'
      }

      AWS.config.update({ credentials: credentials2 })

      assert.deepStrictEqual(connector.credentials, credentials2)
    })

    it('reads from the environment', function () {
      process.env.AWS_ACCESS_KEY_ID = 'foo3'
      process.env.AWS_SECRET_ACCESS_KEY = 'bar3'
      process.env.AWS_SESSION_TOKEN = 'baz3'

      const credentials = {
        accessKeyId: 'foo3',
        secretAccessKey: 'bar3',
        sessionToken: 'baz3'
      }

      AWS.config.update({ credentials: null })

      const connector = new AmazonConnection({
        url: new URL('https://foo.us-east-1.es.amazonaws.com')
      })

      assert.deepStrictEqual(connector.credentials, credentials)
    })
  })

  describe('buildRequestObject()', function () {
    const connector = new AmazonConnection({
      url: new URL('https://foo.us-east-1.es.amazonaws.com'),
      awsConfig: {
        credentials: {
          accessKeyId: 'foo',
          secretAccessKey: 'bar',
          sessionToken: 'baz'
        }
      }
    })

    it('sets the Host header without the port appended', function () {
      const req = connector.buildRequestObject({
        method: 'GET',
        path: '/_cluster/health',
        query: {},
        body: undefined,
        headers: {}
      })

      assert.strictEqual(req.headers.Host, 'foo.us-east-1.es.amazonaws.com')
    })

    it('sets the Content-Length: 0 header when there is no body', function () {
      const req = connector.buildRequestObject({
        method: 'POST',
        path: '/_cluster/health',
        query: {},
        body: '',
        headers: {}
      })

      assert.strictEqual(req.headers['Content-Length'], 0)
    })

    it('sets the Content-Length header when there is a body', function () {
      const req = connector.buildRequestObject({
        method: 'POST',
        path: '/_cluster/health',
        query: {},
        body: 'foo',
        headers: {}
      })

      assert.strictEqual(req.headers['Content-Length'], 3)
      assert.strictEqual(req.body, 'foo')
    })

    it('signs the request', function () {
      const req = connector.buildRequestObject({
        method: 'POST',
        path: '/_cluster/health',
        query: {},
        body: 'foo',
        headers: {
          Date: new Date('2019-08-16T20:51:18Z').toISOString()
        }
      })

      assert.strictEqual(req.headers['X-Amz-Date'], '20190816T205118Z')
      assert.strictEqual(req.headers.Authorization, 'AWS4-HMAC-SHA256 Credential=foo/20190816/us-east-1/es/aws4_request, SignedHeaders=content-length;content-type;date;host;x-amz-date;x-amz-security-token, Signature=5daf2e5d70fe61002e12ad3d4d8dcfcda64bb477ce764af1c30967393d83ba1f')
    })
  })
})
