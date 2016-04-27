(function() {
  'use strict';

  var _ = require('lodash');

  module.exports = function createSecureAttrs() {
    return function secureAttrs(Model) {
      if (!Model.hidden && !Model.locked) {
        Model.attrHelper('hidden', function(attr) {
          attr.descriptor = attr.descriptor || {};
          attr.descriptor.enumerable = false;
        });

        Model.attrHelper('locked', function(attr) {
          attr.descriptor = attr.descriptor || {};
          attr.descriptor.writable = false;
        });

        Model.init(function(instance) {
          _.forIn(instance, function(value, key) {
            var attr = Model.attrs(key),
                opts;

            if (attr && attr.descriptor) {
              opts = _.defaults(_.cloneDeep(attr.descriptor), Object.getOwnPropertyDescriptor(instance, key));
              delete instance[key];
              Object.defineProperty(instance, key, opts);
            }
          });
        });
      }
    };
  };
}());
