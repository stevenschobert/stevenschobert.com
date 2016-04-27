(function() {
  'use strict';

  var keylime = require('keylime');
  var AboutController = keylime('AboutController');

  AboutController
    .method('index', function index(request) {
      return this.render('about/index', {request: request});
    });

  module.exports = AboutController;
}());
