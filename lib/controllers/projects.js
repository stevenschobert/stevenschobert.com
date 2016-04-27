(function() {
  'use strict';

  var keylime = require('keylime');
  var _ = require('lodash');

  var ProjectsController = keylime('ProjectsController');

  ProjectsController
    .method('index', function index(request) {
      return this.render('projects/index', {request: request});
    });

  module.exports = ProjectsController;
}());
