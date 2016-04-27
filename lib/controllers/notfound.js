(function() {
  'use strict';

  var keylime = require('keylime');
  var NotFoundController = keylime('NotFoundController');

  NotFoundController
    .method('index', function index(request) {
      return this.render('notfound/index', {request: request}, 404);
    });

  module.exports = NotFoundController;
}());
