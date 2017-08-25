/**
 * A connection handler for Amazon ES.
 *
 * Uses the aws-sdk to make signed requests to an Amazon ES endpoint.
 *
 * @param client {Client} - The Client that this class belongs to
 * @param config {Object} - Configuration options
 * @param [config.protocol=http:] {String} - The HTTP protocol that this connection will use, can be set to https:
 * @class HttpConnector
 */

import AWS from 'aws-sdk';
import HttpConnector from 'elasticsearch/src/lib/connectors/http'
import _ from 'elasticsearch/src/lib/utils';
import zlib from 'zlib';

class HttpAmazonESConnector extends HttpConnector {
  constructor(host, config) {
    super(host, config);
    const { protocol, port } = host;
    const endpoint = new AWS.Endpoint(host.host);

    if (protocol) endpoint.protocol = protocol.replace(/:?$/, ":");
    if (port) endpoint.port = port;

    this.AWS = AWS;
    this.awsConfig = config.awsConfig || AWS.config;
    this.endpoint = endpoint;
  }

  async request(params, cb) {
    let incoming;
    let timeoutId;
    let request;
    let req;
    let status = 0;
    let headers = {};
    let log = this.log;
    let response;
    const AWS = this.AWS;

    let reqParams = this.makeReqParams(params);
    // general clean-up procedure to run after the request
    // completes, has an error, or is aborted.
    let cleanUp = _.bind(function (err) {
      clearTimeout(timeoutId);

      req && req.removeAllListeners();
      incoming && incoming.removeAllListeners();

      if ((err instanceof Error) === false) {
        err = void 0;
      }

      log.trace(params.method, reqParams, params.body, response, status);
      if (err) {
        cb(err);
      } else {
        cb(err, response, status, headers);
      }
    }, this);

    request = new AWS.HttpRequest(this.endpoint);

    // copy across params
    for (let p in reqParams) {
      request[p] = reqParams[p];
    }
    request.region = this.awsConfig.region;
    if (params.body) request.body = params.body;
    if (!request.headers) request.headers = {};
    request.headers['presigned-expires'] = false;
    request.headers['Host'] = this.endpoint.host;

    // load creds
    let CREDS;
    try {
      CREDS = await this.getAWSCredentials();

      // Sign the request (Sigv4)
      let signer = new AWS.Signers.V4(request, 'es');
      signer.addAuthorization(CREDS, new Date());
    } catch (e) {
      if (e && e.message) e.message = `AWS Credentials error: ${e.message}`;
      cleanUp(e);
      return () => {};
    }

    let send = new AWS.NodeHttpClient();
    req = send.handleRequest(request, null, function (_incoming) {
      incoming = _incoming;
      status = incoming.statusCode;
      headers = incoming.headers;
      response = '';

      let encoding = (headers['content-encoding'] || '').toLowerCase();
      if (encoding === 'gzip' || encoding === 'deflate') {
        incoming = incoming.pipe(zlib.createUnzip());
      }

      incoming.setEncoding('utf8');
      incoming.on('data', function (d) {
        response += d;
      });

      incoming.on('error', cleanUp);
      incoming.on('end', cleanUp);
    }, cleanUp);

    req.on('error', cleanUp);

    req.setNoDelay(true);
    req.setSocketKeepAlive(true);

    return function () {
      req.abort();
    };
  }

  getAWSCredentials() {
    const { awsConfig } = this;

    return new Promise((resolve, reject) => {
      awsConfig.getCredentials((err, creds) => {
        if (err) return reject(err);
        return resolve(creds);
      });
    });
  }
}

module.exports = HttpAmazonESConnector;
