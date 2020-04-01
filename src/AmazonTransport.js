const { Transport } = require('@elastic/elasticsearch')
const AWS = require('aws-sdk')

class AmazonTransport extends Transport {
  awaitAwsCredentials () {
    return new Promise((resolve, reject) => {
      AWS.config.getCredentials((err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  request (params, options = {}, callback = null) {
    // options is optional, so if it is omitted, options will be the callback
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    // Promise support
    if (callback == null) {
      return this.awaitAwsCredentials()
        .then(() => super.request(params, options, null))
    }

    // Callback support
    this.awaitAwsCredentials()
      .then(() => super.request(params, options, callback))
      .catch(callback)
  }
}

module.exports = AmazonTransport
