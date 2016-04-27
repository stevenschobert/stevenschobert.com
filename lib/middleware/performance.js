(function() {
  'use strict';

  var _ = require('lodash');
  var librato = require('librato-node');
  var config = require('../config');

  module.exports = function addPerformanceMiddleware(app, options) {
    var libratoEnabled = _.isPlainObject(config.get('librato'));

    options = options || {};
    _.defaults(options, {
      requestCountKey: 'requestCount',
      responseTimeKey: 'responseTime',
      statusCodeKey: 'statusCode'
    });

    if (!libratoEnabled) {
      return function(request) {
        return request.call(app);
      };
    }

    librato.configure(config.get('librato'));
    librato.start();

    process.once('exit', function stopLibrato() {
      librato.stop();
    });

    return function trackPerformance(request) {
      var startTime = Date.now();
      librato.increment(options.requestCountKey);
      return request.call(app).then(function trackResponseTime(res) {
        var responseTime = Date.now() - startTime;
        librato.timing(options.responseTimeKey, responseTime);
        return res;
      });
    };
  };
}());
