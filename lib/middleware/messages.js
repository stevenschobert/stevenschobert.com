(function() {
  'use strict';

  var _ = require('lodash');
  var MessageStack = require('../support/message_stack');

  module.exports = function addMessageStack(app) {
    return function messageStack(request) {
      request.messages = new MessageStack({messages: request.session.messages || []});
      request.session.messages = request.messages.messages;
      return request.call(app).then(function(response) {
        if (response.status === 302) {
          return response;
        }

        if (!_.isEmpty(request.session.messages)) {
          request.session.messages = null;
        }

        return response;
      });
    };
  };
}());
