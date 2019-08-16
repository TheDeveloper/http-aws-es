'use strict';

const assert = require('assert');
const AWS = require('aws-sdk');
const Host = require('elasticsearch/src/lib/host');
const HttpConnector = require('elasticsearch/src/lib/connectors/http');

const AmazonElasticsearchHttpConnector = require('../src');

describe('AmazonElasticsearchHttpConnector', function () {
  it('extends HttpConnector', function () {
    assert(AmazonElasticsearchHttpConnector.prototype instanceof HttpConnector);
  });

  describe('constructor()', function () {
    it('reads credentials from options.awsConfig.credentials', function () {
      const credentials = {
        accessKeyId: 'foo',
        secretAccessKey: 'bar',
        sessionToken: 'baz'
      };

      const connector = new AmazonElasticsearchHttpConnector(new Host(), {
        awsConfig: { credentials }
      });

      assert.deepStrictEqual(connector.credentials, credentials);
    });

    it('reads credentials from AWS.config', function () {
      const credentials = {
        accessKeyId: 'foo',
        secretAccessKey: 'bar',
        sessionToken: 'baz'
      };

      AWS.config.update({ credentials });

      const connector = new AmazonElasticsearchHttpConnector(new Host(), {});
      assert.deepStrictEqual(connector.credentials, credentials);
    });

    it('reads credentials from environment', function () {
      process.env.AWS_ACCESS_KEY_ID = 'foo';
      process.env.AWS_SECRET_ACCESS_KEY = 'bar';
      process.env.AWS_SESSION_TOKEN = 'baz';

      const credentials = {
        accessKeyId: 'foo',
        secretAccessKey: 'bar',
        sessionToken: 'baz'
      };

      const connector = new AmazonElasticsearchHttpConnector(new Host(), {});
      assert.deepStrictEqual(connector.credentials, credentials);
    });
  });

  describe('makeReqParams()', function () {
    const host = new Host({
      host: 'foo.us-east-1.es.amazonaws.com'
    });

    const connector = new AmazonElasticsearchHttpConnector(host, {
      awsConfig: {
        credentials: {
          accessKeyId: 'foo',
          secretAccessKey: 'bar',
          sessionToken: 'baz'
        }
      }
    });

    it('sets the Host header without the port appended', function () {
      const req = connector.makeReqParams({
        method: 'GET',
        path: '/_cluster/health',
        query: {},
        body: undefined,
        headers: {}
      });

      assert.strictEqual(req.headers['Host'], host.host);
    });

    it('sets the Content-Length: 0 header when there is no body', function () {
      const req = connector.makeReqParams({
        method: 'POST',
        path: '/_cluster/health',
        query: {},
        body: '',
        headers: {}
      });

      assert.strictEqual(req.headers['Content-Length'], 0);
    });

    it('sets the Content-Length header when there is a body', function () {
      const req = connector.makeReqParams({
        method: 'POST',
        path: '/_cluster/health',
        query: {},
        body: 'foo',
        headers: {}
      });

      assert.strictEqual(req.headers['Content-Length'], 3);
      assert.strictEqual(req.body, 'foo');
    });

    it('signs the request', function () {
      const req = connector.makeReqParams({
        method: 'POST',
        path: '/_cluster/health',
        query: {},
        body: 'foo',
        headers: {
          'Date': new Date('2019-08-16T20:51:18Z').toISOString()
        }
      });

      assert.strictEqual(req.headers['X-Amz-Date'], '20190816T205118Z');
      assert.strictEqual(req.headers['Authorization'], 'AWS4-HMAC-SHA256 Credential=foo/20190816/us-east-1/es/aws4_request, SignedHeaders=content-length;content-type;date;host;x-amz-date;x-amz-security-token, Signature=5daf2e5d70fe61002e12ad3d4d8dcfcda64bb477ce764af1c30967393d83ba1f');
    });
  });
});
