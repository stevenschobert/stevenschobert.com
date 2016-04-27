(function() {
  'use strict';

  module.exports = function createErrorClass(name) {
    var error = function(msg) {
      this.message = msg;
      this.name = name;
    };
    error.prototype = Object.create(Error.prototype);
    return error;
  };
}());
