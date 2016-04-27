(function() {
  'use strict';

  var User;

  module.exports = function requestUser(app) {
    User = User || require('../models/user');

    return function grabUser(request) {
      var id = request.session.user_id;

      if (!id) {
        request.user = null;
        return request.call(app);
      }

      return User.find(id).bind(this)
      .then(function(user) {
        request.user = user ? user : null;
        return request.call(app);
      });
    };
  };
}());
