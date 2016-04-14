/**
 * A Connection handler for Amazon ES.
 *
 * Uses the aws-sdk to make signed requests to an Amazon ES endpoint.
 * Define the Amazon ES config and the connection handler
 * in the client configuration:
 *
 * var es = require('elasticsearch').Client({
 *  hosts: 'https://amazon-es-host.us-east-1.es.amazonaws.com',
 *  connectionClass: require('http-aws-es'),
 *  amazonES: {
 *    region: 'us-east-1',
 *    accessKey: 'AKID',
 *    secretKey: 'secret',
 *    credentials: new AWS.EnvironmentCredentials('AWS') // Optional
 *  }
 * });
 *
 * @param client {Client} - The Client that this class belongs to
 * @param config {Object} - Configuration options
 * @param [config.protocol=http:] {String} - The HTTP protocol that this connection will use, can be set to https:
 * @class HttpConnector
 */

let AWS = require('aws-sdk');
let HttpConnector = require('elasticsearch/src/lib/connectors/http')
let _ = require('elasticsearch/src/lib/utils');
let zlib = require('zlib');

/**
 * Checks to see if this object acts like a Promise, i.e. has a "then"
 * function.
 */
function isThenable(value) {
  return typeof value === 'object' &&
    value !== null &&
    typeof value.then === 'function';
}

class HttpAmazonESConnector extends HttpConnector {
  constructor(host, config) {
    super(host, config);
    this.endpoint = new AWS.Endpoint(host.host);
    this.amazonES = config.amazonES;
  }

  /**
   * Resolve the credentails provided to amazonES.
   *
   * @return {Promise} promise that resolves with an AWS.Credential subclass
   */
  _resolveCredentials() {
    return new Promise((resolve, reject) => {
      const { credentials, accessKey, secretKey } = this.amazonES;
      if (credentials) {
        if (isThenable(credentials)) {
          credentials
            .then(res => resolve(res))
            .catch(err => reject(err));
        } else {
          resolve(credentials);
        }
      } else {
        resolve(new AWS.Credentials(accessKey, secretKey));
      }
    });
  }

  /**
   * Get the existing credentials. This will handle refreshing the credentials if needed.
   *
   * @param {Object} credentials subclass of AWS.Credentials
   * @return {Promise} promise that resolves with the refreshed credentials
   */
  _getCredentials(credentials) {
    return new Promise((resolve, reject) => {
      credentials.get(err => {
        if (err) {
          this.log.error('failed to get credentials:', err);
          reject(err);
        } else {
          resolve(credentials);
        }
      });
    });
  }

  request(params, cb) {
    this._resolveCredentials()
      .then(credentials => this._getCredentials(credentials))
      .then(credentials => this._request(credentials, params, cb))
      .catch(err => cb(err));
  }

  _request(credentials, params, cb) {
    var incoming;
    var timeoutId;
    var request;
    var req;
    var status = 0;
    var headers = {};
    var log = this.log;
    var response;

    var reqParams = this.makeReqParams(params);
    // general clean-up procedure to run after the request
    // completes, has an error, or is aborted.
    var cleanUp = _.bind(function (err) {
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
    request.region = this.amazonES.region;
    if (params.body) request.body = params.body;
    if (!request.headers) request.headers = {};
    request.headers['presigned-expires'] = false;
    request.headers['Host'] = this.endpoint.host;

    // Sign the request (Sigv4)
    var signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(credentials, new Date());

    var send = new AWS.NodeHttpClient();
    req = send.handleRequest(request, null, function (_incoming) {
      incoming = _incoming;
      status = incoming.statusCode;
      headers = incoming.headers;
      response = '';

      var encoding = (headers['content-encoding'] || '').toLowerCase();
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
}

module.exports = HttpAmazonESConnector;
