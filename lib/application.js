(function() {
  'use strict';

  var Pimm = require('pimm');
  var path = require('path');
  var notFound = require('./middleware/not_found');
  var perf = require('./middleware/performance');
  var captureErrors = require('./middleware/capture_errors');

  var app = new Pimm({
    dir: __dirname,
    static: path.join(__dirname, '../public')
  });

  // error capturing
  app.use(captureErrors);

  // performance tracking
  app.use(perf);

  // page not found middleware
  app.use(notFound, app, 'notfound#index');


  // add routes
  app.routes(function() {
    this.get('/', 'home#index');
    this.get('about', 'about#index');
    this.get('projects', 'projects#index');
    this.get('writings', 'posts#index');
    this.get('writings/:id', 'posts#show');

    // legacy routes
    this.alias('blog', 'writings', 'permanent');
    this.alias('blog/:id', 'writings/:id', 'permanent');
  });

  module.exports = app;
}());
