(function() {
  'use strict';

  var _ = require('lodash');

  module.exports = function append() {
    var arr = _.first(arguments);
    var values = _.flatten([_.rest(arguments)]);

    if (!_.isArray(arr)) {
      arr = _.flatten([arr || []]);
    }

    [].push.apply(arr, values);

    return arr;
  };
}());
