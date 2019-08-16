# aws-elasticsearch-connector

[![Build Status](https://travis-ci.org/compwright/aws-elasticsearch-connector.png?branch=master)](https://travis-ci.org/compwright/aws-elasticsearch-connector)
[![Code Climate](https://codeclimate.com/github/compwright/aws-elasticsearch-connector/badges/gpa.svg)](https://codeclimate.com/github/compwright/aws-elasticsearch-connector)
[![Test Coverage](https://codeclimate.com/github/compwright/aws-elasticsearch-connector/badges/coverage.svg)](https://codeclimate.com/github/compwright/aws-elasticsearch-connector/coverage)
[![Dependency Status](https://img.shields.io/david/compwright/aws-elasticsearch-connector.svg?style=flat-square)](https://david-dm.org/compwright/aws-elasticsearch-connector)
[![Download Status](https://img.shields.io/npm/dm/aws-elasticsearch-connector.svg?style=flat-square)](https://www.npmjs.com/package/aws-elasticsearch-connector)

A tiny [Amazon Signature Version 4](https://www.npmjs.com/package/aws4) connection class for [Elasticsearch.js 16.x](https://www.npmjs.com/package/elasticsearch), for compatibility with AWS Elasticsearch and IAM authentication.

> This library is drop-in replacement for [http-aws-es](https://www.npmjs.com/package/http-aws-es), which is no longer actively maintained.

## Installation

```bash
npm install --save aws-elasticsearch-connector elasticsearch aws-sdk
```

## Example usage

### With specific credentials

```javascript
const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  hosts: [
    'my-elasticsearch-cluster.us-east-1.es.amazonaws.com'
  ],
  connectionClass: require('aws-elasticsearch-connector'),
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
const elasticsearch = require('elasticsearch');

// Load AWS profile credentials
AWS.config.update({
  profile: 'my-profile'
});

const client = new elasticsearch.Client({
  hosts: [
    'my-elasticsearch-cluster.us-east-1.es.amazonaws.com'
  ],
  connectionClass: require('aws-elasticsearch-connector')
});
```

### With credentials from the environment

```env
AWS_ACCESS_KEY_ID=foo      # alias: AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=bar  # alias: AWS_SECRET_KEY
AWS_SESSION_TOKEN=baz
```

```javascript
const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  hosts: [
    'my-elasticsearch-cluster.us-east-1.es.amazonaws.com'
  ],
  connectionClass: require('aws-elasticsearch-connector'),
});
```

## Test

```bash
npm test

# Run integration tests against a real endpoint
AWS_PROFILE=your-profile npm run test:integration -- \
  --endpoint https://amazon-es-host.us-east-1.es.amazonaws.com
```
