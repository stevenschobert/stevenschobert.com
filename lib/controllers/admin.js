(function() {
  'use strict';

  var keylime = require('keylime');
  var AdminController = keylime('AdminController');
  var requireAuth = require('../filters/require_auth');

  AdminController
    .init(function() {
      this.before('index', requireAuth);
    })

    .method('index', function index(request) {
      return this.render('admin/index', {request: request});
    });

  module.exports = AdminController;
}());
