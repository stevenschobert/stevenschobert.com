(function() {
  'use strict';

  var _ = require('lodash');

  module.exports = function addValidation() {
    return function validation(Model) {
      Model
        .attrHelper('validate', function addValidator(attr, message, validator) {
          if (_.isFunction(message)) {
            validator = message;
            message = 'Invalid.';
          }
          attr.validators = attr.validators || [];
          attr.validators.push({
            validator: validator,
            message: message
          });
        })

        .method('validate', function validate() {
          var errors = {};

          _.forIn(Model.attrs(), function checkAttribute(attr, name) {
            var messages = [];

            _.each(attr.validators, function runValidator(validator) {
              if (!validator.validator(this[name])) {
                messages.push(validator.message);
              }
            }, this);

            if (!_.isEmpty(messages)) {
              errors[name] = messages;
            }
          }, this);

          return errors;
        })

        .method('isValid', function isValid() {
          return _.isEmpty(this.validate());
        });
    };
  };
}());
