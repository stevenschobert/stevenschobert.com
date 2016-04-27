(function() {
  'use strict';

  module.exports = function requireAuth(request) {
    if (!request.user) {
      request.messages.error('You must be logged in to view that page.');
      return this.redirect('/login?return_path='+request.path);
    }
  };
}());
