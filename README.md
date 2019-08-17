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

### With specific credentials

```javascript
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'my-elasticsearch-cluster.us-east-1.es.amazonaws.com'
  Connection: require('aws-elasticsearch-connector'),
  awsConfig: {
    credentials: {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
      sessionToken: 'baz' // optional
    }
  }
});
```

### With credentials from AWS.Config

```javascript
const AWS = require('aws-sdk');
const { Client } = require('@elastic/elasticsearch');

// Load AWS profile credentials
AWS.config.update({
  profile: 'my-profile'
});

const client = new Client({
  node: 'my-elasticsearch-cluster.us-east-1.es.amazonaws.com'
  Connection: require('aws-elasticsearch-connector')
});
```

### With credentials from the environment

```env
AWS_ACCESS_KEY_ID=foo      # alias: AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=bar  # alias: AWS_SECRET_KEY
AWS_SESSION_TOKEN=baz
```

```javascript
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'my-elasticsearch-cluster.us-east-1.es.amazonaws.com'
  Connection: require('aws-elasticsearch-connector'),
});
```

## Test

```bash
npm test

# Run integration tests against a real endpoint
AWS_PROFILE=your-profile npm run test:integration -- \
  --endpoint https://amazon-es-host.us-east-1.es.amazonaws.com
```
