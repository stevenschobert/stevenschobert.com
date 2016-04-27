(function() {
  'use strict';

  var keylime = require('keylime');
  var Configuration = keylime('Configuration');

  Configuration
    .attr('values', {})
    .method('get', function get(name) {
      return this[name];
    })
    .method('set', function set(name, value) {
      this[name] = value;
    });

  module.exports = Configuration;
}());
