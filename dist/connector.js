'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _http = require('elasticsearch/src/lib/connectors/http');

var _http2 = _interopRequireDefault(_http);

var _utils = require('elasticsearch/src/lib/utils');

var _utils2 = _interopRequireDefault(_utils);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var HttpAmazonESConnector = function (_HttpConnector) {
  (0, _inherits3.default)(HttpAmazonESConnector, _HttpConnector);

  function HttpAmazonESConnector(host, config) {
    (0, _classCallCheck3.default)(this, HttpAmazonESConnector);

    var _this = (0, _possibleConstructorReturn3.default)(this, (HttpAmazonESConnector.__proto__ || Object.getPrototypeOf(HttpAmazonESConnector)).call(this, host, config));

    var protocol = host.protocol,
        port = host.port;

    var endpoint = new _awsSdk2.default.Endpoint(host.host);

    if (protocol) endpoint.protocol = protocol.replace(/:?$/, ":");
    if (port) endpoint.port = port;

    _this.AWS = _awsSdk2.default;
    _this.awsConfig = config.awsConfig || _awsSdk2.default.config;
    _this.endpoint = endpoint;
    _this.httpOptions = config.httpOptions || _this.awsConfig.httpOptions;
    return _this;
  }

  (0, _createClass3.default)(HttpAmazonESConnector, [{
    key: 'request',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(params, cb) {
        var incoming, timeoutId, request, req, status, headers, log, response, AWS, reqParams, cleanUp, p, CREDS, signer, send;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                incoming = void 0;
                timeoutId = void 0;
                request = void 0;
                req = void 0;
                status = 0;
                headers = {};
                log = this.log;
                response = void 0;
                AWS = this.AWS;
                reqParams = this.makeReqParams(params);
                // general clean-up procedure to run after the request
                // completes, has an error, or is aborted.

                cleanUp = _utils2.default.bind(function (err) {
                  clearTimeout(timeoutId);

                  req && req.removeAllListeners();
                  incoming && incoming.removeAllListeners();

                  if (err instanceof Error === false) {
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
                for (p in reqParams) {
                  request[p] = reqParams[p];
                }
                request.region = this.awsConfig.region;
                if (params.body) {
                  request.body = params.body;
                  request.headers['Content-Length'] = params.body.length;
                }
                if (!request.headers) request.headers = {};
                request.headers['presigned-expires'] = false;
                request.headers['Host'] = this.endpoint.host;

                // load creds
                CREDS = void 0;
                _context.prev = 19;
                _context.next = 22;
                return this.getAWSCredentials();

              case 22:
                CREDS = _context.sent;


                // Sign the request (Sigv4)
                signer = new AWS.Signers.V4(request, 'es');

                signer.addAuthorization(CREDS, new Date());
                _context.next = 32;
                break;

              case 27:
                _context.prev = 27;
                _context.t0 = _context['catch'](19);

                if (_context.t0 && _context.t0.message) _context.t0.message = `AWS Credentials error: ${_context.t0.message}`;
                cleanUp(_context.t0);
                return _context.abrupt('return', function () {});

              case 32:
                send = new AWS.NodeHttpClient();

                req = send.handleRequest(request, this.httpOptions, function (_incoming) {
                  incoming = _incoming;
                  status = incoming.statusCode;
                  headers = incoming.headers;
                  response = '';

                  var encoding = (headers['content-encoding'] || '').toLowerCase();
                  if (encoding === 'gzip' || encoding === 'deflate') {
                    incoming = incoming.pipe(_zlib2.default.createUnzip());
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

                return _context.abrupt('return', function () {
                  req.abort();
                });

              case 38:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[19, 27]]);
      }));

      function request(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return request;
    }()
  }, {
    key: 'getAWSCredentials',
    value: function getAWSCredentials() {
      var awsConfig = this.awsConfig;


      return new Promise(function (resolve, reject) {
        awsConfig.getCredentials(function (err, creds) {
          if (err) return reject(err);
          return resolve(creds);
        });
      });
    }
  }]);
  return HttpAmazonESConnector;
}(_http2.default);

module.exports = HttpAmazonESConnector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2Nvbm5lY3Rvci5qcyJdLCJuYW1lcyI6WyJIdHRwQW1hem9uRVNDb25uZWN0b3IiLCJob3N0IiwiY29uZmlnIiwicHJvdG9jb2wiLCJwb3J0IiwiZW5kcG9pbnQiLCJFbmRwb2ludCIsInJlcGxhY2UiLCJBV1MiLCJhd3NDb25maWciLCJodHRwT3B0aW9ucyIsInBhcmFtcyIsImNiIiwiaW5jb21pbmciLCJ0aW1lb3V0SWQiLCJyZXF1ZXN0IiwicmVxIiwic3RhdHVzIiwiaGVhZGVycyIsImxvZyIsInJlc3BvbnNlIiwicmVxUGFyYW1zIiwibWFrZVJlcVBhcmFtcyIsImNsZWFuVXAiLCJiaW5kIiwiZXJyIiwiY2xlYXJUaW1lb3V0IiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwiRXJyb3IiLCJ0cmFjZSIsIm1ldGhvZCIsImJvZHkiLCJIdHRwUmVxdWVzdCIsInAiLCJyZWdpb24iLCJDUkVEUyIsImdldEFXU0NyZWRlbnRpYWxzIiwic2lnbmVyIiwiU2lnbmVycyIsIlY0IiwiYWRkQXV0aG9yaXphdGlvbiIsIkRhdGUiLCJtZXNzYWdlIiwic2VuZCIsIk5vZGVIdHRwQ2xpZW50IiwiaGFuZGxlUmVxdWVzdCIsIl9pbmNvbWluZyIsInN0YXR1c0NvZGUiLCJlbmNvZGluZyIsInRvTG93ZXJDYXNlIiwicGlwZSIsImNyZWF0ZVVuemlwIiwic2V0RW5jb2RpbmciLCJvbiIsImQiLCJzZXROb0RlbGF5Iiwic2V0U29ja2V0S2VlcEFsaXZlIiwiYWJvcnQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImdldENyZWRlbnRpYWxzIiwiY3JlZHMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVdBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFkQTs7Ozs7Ozs7Ozs7SUFnQk1BLHFCOzs7QUFDSixpQ0FBWUMsSUFBWixFQUFrQkMsTUFBbEIsRUFBMEI7QUFBQTs7QUFBQSw0SkFDbEJE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cUI7QUFDdENuRCxrQkFBVW9ELGNBQVYsQ0FBeUIsVUFBQ3BDLEdBQUQsRUFBTXFDLEtBQU4sRUFBZ0I7QUFDdkMsY0FBSXJDLEdBQUosRUFBUyxPQUFPbUMsT0FBT25DLEdBQVAsQ0FBUDtBQUNULGlCQUFPa0MsUUFBUUcsS0FBUixDQUFQO0FBQ0QsU0FIRDtBQUlELE9BTE0sQ0FBUDtBQU1EOzs7OztBQUdIQyxPQUFPQyxPQUFQLEdBQWlCaEUscUJBQWpCIiwiZmlsZSI6ImNvbm5lY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBjb25uZWN0aW9uIGhhbmRsZXIgZm9yIEFtYXpvbiBFUy5cbiAqXG4gKiBVc2VzIHRoZSBhd3Mtc2RrIHRvIG1ha2Ugc2lnbmVkIHJlcXVlc3RzIHRvIGFuIEFtYXpvbiBFUyBlbmRwb2ludC5cbiAqXG4gKiBAcGFyYW0gY2xpZW50IHtDbGllbnR9IC0gVGhlIENsaWVudCB0aGF0IHRoaXMgY2xhc3MgYmVsb25ncyB0b1xuICogQHBhcmFtIGNvbmZpZyB7T2JqZWN0fSAtIENvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICogQHBhcmFtIFtjb25maWcucHJvdG9jb2w9aHR0cDpdIHtTdHJpbmd9IC0gVGhlIEhUVFAgcHJvdG9jb2wgdGhhdCB0aGlzIGNvbm5lY3Rpb24gd2lsbCB1c2UsIGNhbiBiZSBzZXQgdG8gaHR0cHM6XG4gKiBAY2xhc3MgSHR0cENvbm5lY3RvclxuICovXG5cbmltcG9ydCBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgSHR0cENvbm5lY3RvciBmcm9tICdlbGFzdGljc2VhcmNoL3NyYy9saWIvY29ubmVjdG9ycy9odHRwJ1xuaW1wb3J0IF8gZnJvbSAnZWxhc3RpY3NlYXJjaC9zcmMvbGliL3V0aWxzJztcbmltcG9ydCB6bGliIGZyb20gJ3psaWInO1xuXG5jbGFzcyBIdHRwQW1hem9uRVNDb25uZWN0b3IgZXh0ZW5kcyBIdHRwQ29ubmVjdG9yIHtcbiAgY29uc3RydWN0b3IoaG9zdCwgY29uZmlnKSB7XG4gICAgc3VwZXIoaG9zdCwgY29uZmlnKTtcbiAgICBjb25zdCB7IHByb3RvY29sLCBwb3J0IH0gPSBob3N0O1xuICAgIGNvbnN0IGVuZHBvaW50ID0gbmV3IEFXUy5FbmRwb2ludChob3N0Lmhvc3QpO1xuXG4gICAgaWYgKHByb3RvY29sKSBlbmRwb2ludC5wcm90b2NvbCA9IHByb3RvY29sLnJlcGxhY2UoLzo/JC8sIFwiOlwiKTtcbiAgICBpZiAocG9ydCkgZW5kcG9pbnQucG9ydCA9IHBvcnQ7XG5cbiAgICB0aGlzLkFXUyA9IEFXUztcbiAgICB0aGlzLmF3c0NvbmZpZyA9IGNvbmZpZy5hd3NDb25maWcgfHwgQVdTLmNvbmZpZztcbiAgICB0aGlzLmVuZHBvaW50ID0gZW5kcG9pbnQ7XG4gICAgdGhpcy5odHRwT3B0aW9ucyA9IGNvbmZpZy5odHRwT3B0aW9ucyB8fCB0aGlzLmF3c0NvbmZpZy5odHRwT3B0aW9ucztcbiAgfVxuXG4gIGFzeW5jIHJlcXVlc3QocGFyYW1zLCBjYikge1xuICAgIGxldCBpbmNvbWluZztcbiAgICBsZXQgdGltZW91dElkO1xuICAgIGxldCByZXF1ZXN0O1xuICAgIGxldCByZXE7XG4gICAgbGV0IHN0YXR1cyA9IDA7XG4gICAgbGV0IGhlYWRlcnMgPSB7fTtcbiAgICBsZXQgbG9nID0gdGhpcy5sb2c7XG4gICAgbGV0IHJlc3BvbnNlO1xuICAgIGNvbnN0IEFXUyA9IHRoaXMuQVdTO1xuXG4gICAgbGV0IHJlcVBhcmFtcyA9IHRoaXMubWFrZVJlcVBhcmFtcyhwYXJhbXMpO1xuICAgIC8vIGdlbmVyYWwgY2xlYW4tdXAgcHJvY2VkdXJlIHRvIHJ1biBhZnRlciB0aGUgcmVxdWVzdFxuICAgIC8vIGNvbXBsZXRlcywgaGFzIGFuIGVycm9yLCBvciBpcyBhYm9ydGVkLlxuICAgIGxldCBjbGVhblVwID0gXy5iaW5kKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXG4gICAgICByZXEgJiYgcmVxLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgaW5jb21pbmcgJiYgaW5jb21pbmcucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG5cbiAgICAgIGlmICgoZXJyIGluc3RhbmNlb2YgRXJyb3IpID09PSBmYWxzZSkge1xuICAgICAgICBlcnIgPSB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIGxvZy50cmFjZShwYXJhbXMubWV0aG9kLCByZXFQYXJhbXMsIHBhcmFtcy5ib2R5LCByZXNwb25zZSwgc3RhdHVzKTtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY2IoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiKGVyciwgcmVzcG9uc2UsIHN0YXR1cywgaGVhZGVycyk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG5cbiAgICByZXF1ZXN0ID0gbmV3IEFXUy5IdHRwUmVxdWVzdCh0aGlzLmVuZHBvaW50KTtcblxuICAgIC8vIGNvcHkgYWNyb3NzIHBhcmFtc1xuICAgIGZvciAobGV0IHAgaW4gcmVxUGFyYW1zKSB7XG4gICAgICByZXF1ZXN0W3BdID0gcmVxUGFyYW1zW3BdO1xuICAgIH1cbiAgICByZXF1ZXN0LnJlZ2lvbiA9IHRoaXMuYXdzQ29uZmlnLnJlZ2lvbjtcbiAgICBpZiAocGFyYW1zLmJvZHkpIHJlcXVlc3QuYm9keSA9IHBhcmFtcy5ib2R5O1xuICAgIGlmICghcmVxdWVzdC5oZWFkZXJzKSByZXF1ZXN0LmhlYWRlcnMgPSB7fTtcbiAgICByZXF1ZXN0LmhlYWRlcnNbJ3ByZXNpZ25lZC1leHBpcmVzJ10gPSBmYWxzZTtcbiAgICByZXF1ZXN0LmhlYWRlcnNbJ0hvc3QnXSA9IHRoaXMuZW5kcG9pbnQuaG9zdDtcblxuICAgIC8vIGxvYWQgY3JlZHNcbiAgICBsZXQgQ1JFRFM7XG4gICAgdHJ5IHtcbiAgICAgIENSRURTID0gYXdhaXQgdGhpcy5nZXRBV1NDcmVkZW50aWFscygpO1xuXG4gICAgICAvLyBTaWduIHRoZSByZXF1ZXN0IChTaWd2NClcbiAgICAgIGxldCBzaWduZXIgPSBuZXcgQVdTLlNpZ25lcnMuVjQocmVxdWVzdCwgJ2VzJyk7XG4gICAgICBzaWduZXIuYWRkQXV0aG9yaXphdGlvbihDUkVEUywgbmV3IERhdGUoKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgJiYgZS5tZXNzYWdlKSBlLm1lc3NhZ2UgPSBgQVdTIENyZWRlbnRpYWxzIGVycm9yOiAke2UubWVzc2FnZX1gO1xuICAgICAgY2xlYW5VcChlKTtcbiAgICAgIHJldHVybiAoKSA9PiB7fTtcbiAgICB9XG5cbiAgICBsZXQgc2VuZCA9IG5ldyBBV1MuTm9kZUh0dHBDbGllbnQoKTtcbiAgICByZXEgPSBzZW5kLmhhbmRsZVJlcXVlc3QocmVxdWVzdCwgdGhpcy5odHRwT3B0aW9ucywgZnVuY3Rpb24gKF9pbmNvbWluZykge1xuICAgICAgaW5jb21pbmcgPSBfaW5jb21pbmc7XG4gICAgICBzdGF0dXMgPSBpbmNvbWluZy5zdGF0dXNDb2RlO1xuICAgICAgaGVhZGVycyA9IGluY29taW5nLmhlYWRlcnM7XG4gICAgICByZXNwb25zZSA9ICcnO1xuXG4gICAgICBsZXQgZW5jb2RpbmcgPSAoaGVhZGVyc1snY29udGVudC1lbmNvZGluZyddIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGVuY29kaW5nID09PSAnZ3ppcCcgfHwgZW5jb2RpbmcgPT09ICdkZWZsYXRlJykge1xuICAgICAgICBpbmNvbWluZyA9IGluY29taW5nLnBpcGUoemxpYi5jcmVhdGVVbnppcCgpKTtcbiAgICAgIH1cblxuICAgICAgaW5jb21pbmcuc2V0RW5jb2RpbmcoJ3V0ZjgnKTtcbiAgICAgIGluY29taW5nLm9uKCdkYXRhJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmVzcG9uc2UgKz0gZDtcbiAgICAgIH0pO1xuXG4gICAgICBpbmNvbWluZy5vbignZXJyb3InLCBjbGVhblVwKTtcbiAgICAgIGluY29taW5nLm9uKCdlbmQnLCBjbGVhblVwKTtcbiAgICB9LCBjbGVhblVwKTtcblxuICAgIHJlcS5vbignZXJyb3InLCBjbGVhblVwKTtcblxuICAgIHJlcS5zZXROb0RlbGF5KHRydWUpO1xuICAgIHJlcS5zZXRTb2NrZXRLZWVwQWxpdmUodHJ1ZSk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmVxLmFib3J0KCk7XG4gICAgfTtcbiAgfVxuXG4gIGdldEFXU0NyZWRlbnRpYWxzKCkge1xuICAgIGNvbnN0IHsgYXdzQ29uZmlnIH0gPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGF3c0NvbmZpZy5nZXRDcmVkZW50aWFscygoZXJyLCBjcmVkcykgPT4ge1xuICAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIHJldHVybiByZXNvbHZlKGNyZWRzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSHR0cEFtYXpvbkVTQ29ubmVjdG9yO1xuIl19
