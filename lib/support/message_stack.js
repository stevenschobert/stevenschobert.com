(function() {
  'use strict';

  var _ = require('lodash');
  var keylime = require('keylime');
  var append = require('./util/append');
  var MessageStack = keylime('MessageStack');

  MessageStack
    .attr('messages', [])

    .method('_addMessage', function addMessage(type, message) {
      this.messages = append(this.messages, {type: type, message: message});
      return this;
    })

    .method('clear', function clear() {
      this.messages = [];
      return this;
    })

    .method('error', function error() {
      var messages = _.flatten([arguments]);
      _.each(messages, function(msg) {
        this._addMessage('error', msg);
      }, this);
      return this;
    })

    .method('success', function success() {
      var messages = _.flatten([arguments]);
      _.each(messages, function(msg) {
        this._addMessage('success', msg);
      }, this);
      return this;
    })

    .method('getMessages', function getMessages() {
      return this.messages;
    })

    .method('isEmpty', function isEmpty() {
      return _.isEmpty(this.messages);
    });

  module.exports = MessageStack;
}());
