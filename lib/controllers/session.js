(function() {
  'use strict';

  var keylime = require('keylime');
  var _ = require('lodash');
  var Promise = require('bluebird');
  var User = require('../models/user');
  var createError = require('../support/util/create_error_class');
  var SessionController = keylime('SessionController');
  var AuthenticationError = createError('AuthenticationError');

  SessionController
    .init(function() {
      this.before('new', function(request) {
        if (request.user) {
          return this.redirect('/');
        }
      });
    })

    .method('new', function newSession(request) {
      return this.render('session/new', {request: request});
    })

    .method('destroy', function destroy(request) {
      request.session.user_id = null;
      request.messages.success('Logged out!');
      return this.redirect('/login');
    })

    .method('create', function create(request) {
      var params = _.pick(request.params, ['email', 'password']);
      var user;

      return User.where({email: params.email}).bind(this)
      .then(function(users) {
        if (_.isEmpty(users)) {
          throw new AuthenticationError('Account not found!');
        }

        user = _.first(users);
        return user.comparePassword(params.password);
      })
      .then(function(passed) {
        if (passed !== true) {
          throw new AuthenticationError('Invalid password!');
        }

        request.session.user_id = user.id;
        request.messages.clear();
        request.messages.success('Logged in!');
        return this.redirect(request.params.success_url);
      })
      .catch(AuthenticationError, function(err) {
        request.messages.error(err.message);
        return this.redirect(request.params.error_url);
      });
    });

  module.exports = SessionController;
}());
