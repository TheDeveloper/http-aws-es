# aws-elasticsearch-connector

[![Build Status](https://travis-ci.org/compwright/aws-elasticsearch-connector.png?branch=master)](https://travis-ci.org/compwright/aws-elasticsearch-connector)
[![Code Climate](https://codeclimate.com/github/compwright/aws-elasticsearch-connector/badges/gpa.svg)](https://codeclimate.com/github/compwright/aws-elasticsearch-connector)
[![Test Coverage](https://codeclimate.com/github/compwright/aws-elasticsearch-connector/badges/coverage.svg)](https://codeclimate.com/github/compwright/aws-elasticsearch-connector/coverage)
[![Dependency Status](https://img.shields.io/david/compwright/aws-elasticsearch-connector.svg?style=flat-square)](https://david-dm.org/compwright/aws-elasticsearch-connector)
[![Download Status](https://img.shields.io/npm/dm/aws-elasticsearch-connector.svg?style=flat-square)](https://www.npmjs.com/package/aws-elasticsearch-connector)

A tiny [Amazon Signature Version 4](https://www.npmjs.com/package/aws4) connection class for the official [Elasticsearch Node.js client](https://www.npmjs.com/package/elasticsearch), for compatibility with AWS Elasticsearch and IAM authentication.

> For legacy [Elasticsearch.js 16.x](https://www.npmjs.com/package/elasticsearch) support, use version 7.x of this library.

## Installation

```bash
npm install --save aws-elasticsearch-connector @elastic/elasticsearch aws-sdk
```

## Example usage

### With static credentials

```javascript
const { Client } = require('@elastic/elasticsearch');
const { AmazonConnection } = require('aws-elasticsearch-connector');

const client = new Client({
  node: 'my-elasticsearch-cluster.us-east-1.es.amazonaws.com',
  Connection: AmazonConnection,
  awsConfig: {
    credentials: {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
      sessionToken: 'baz' // optional
    }
  }
});
```

### With static credentials from AWS.Config

```javascript
const AWS = require('aws-sdk');
const { Client } = require('@elastic/elasticsearch');
const { AmazonConnection } = require('aws-elasticsearch-connector');

// Load AWS profile credentials
AWS.config.update({
  profile: 'my-profile'
});

const client = new Client({
  node: 'my-elasticsearch-cluster.us-east-1.es.amazonaws.com',
  Connection: AmazonConnection
});
```

### With static credentials from the environment

```env
AWS_ACCESS_KEY_ID=foo      # alias: AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=bar  # alias: AWS_SECRET_KEY
AWS_SESSION_TOKEN=baz
```

```javascript
const { Client } = require('@elastic/elasticsearch');
const { AmazonConnection } = require('aws-elasticsearch-connector');

const client = new Client({
  node: 'my-elasticsearch-cluster.us-east-1.es.amazonaws.com',
  Connection: AmazonConnection,
});
```

### With asynchronous or refreshing credentials from AWS

When reading AWS credentials from an IAM role or an EC2/ECS profile, the credentials
will be retrieved and refreshed automatically. In this case you'll need to use the
bundled `AmazonTransport` transport which will call AWS.Config.getCredentials()
before each ElasticSearch request to ensure that the latest credentials are used.

```javascript
const { Client } = require('@elastic/elasticsearch');
const { AmazonConnection, AmazonTransport } = require('aws-elasticsearch-connector');

const client = new Client({
  node: 'my-elasticsearch-cluster.us-east-1.es.amazonaws.com',
  Connection: AmazonConnection,
  Transport: AmazonTransport
});
```

## Test

```bash
npm test

# Run integration tests against a real endpoint
AWS_PROFILE=your-profile npm run test:integration -- \
  --endpoint https://amazon-es-host.us-east-1.es.amazonaws.com
```
