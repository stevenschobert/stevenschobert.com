(function() {
  'use strict';

  var _ = require('lodash');
  var raven = require('raven');
  var config = require('../config');
  var Pimm = require('pimm');

  var formatRequest = function formatRequest(request) {
    return _.extend({}, _.pick(request, ['url', 'method', 'headers', 'cookies', 'params']));
  };

  module.exports = function addErrorCapturer(app) {
    var sentryEnabled = _.isString(config.get('sentry'));
    var client;

    if (!sentryEnabled) {
      return function ignoreErrors(request) {
        return request.call(app);
      };
    }

    client = new raven.Client(config.get('sentry'));

    return function captureError(request) {
      return request.call(app).catch(function catchError(err) {
        client.captureError(err, { request: formatRequest(request) });
        return Pimm.Controller.prototype.text.call(null, 'Internal Server Error', 500);
      });
    };
  };
}());
