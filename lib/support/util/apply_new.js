(function() {
  'use strict';

  var _ = require('lodash');

  module.exports = function applyNew() {
    var constructor = _.first(arguments);
    var args = _.flatten([_.rest(arguments)]);
    var Wrapped = function Wrapped() {
      return constructor.apply(this, args);
    };
    Wrapped.prototype = constructor.prototype;
    return new Wrapped();
  };
}());
