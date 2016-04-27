(function() {
  'use strict';

  var env = require('dotenv').load();
  var app = require('../lib/application');
  var config = require('../lib/config');

  // set application configs
  app.port = process.env.PORT || 3000;
  app.caching = process.env.NODE_ENV === 'production';

  // set couch configuration
  config.set('couch', {
    url: process.env.COUCH_URL || 'http://localhost',
    port: process.env.COUCH_PORT || 5984,
    database: process.env.COUCH_DB || 'blog-dev',
    username: process.env.COUCH_USER || null,
    password: process.env.COUCH_PASS || null
  });

  // set analytics tracking
  if (process.env.GAUGES_KEY) {
    app.config('gaugesKey', process.env.GAUGES_KEY);
  }

  // set performance tracking
  if (process.env.LIBRATO_EMAIL && process.env.LIBRATO_TOKEN && process.env.LIBRATO_SOURCE) {
    config.set('librato', {
      email: process.env.LIBRATO_EMAIL,
      token: process.env.LIBRATO_TOKEN,
      source: process.env.LIBRATO_SOURCE
    });
  }

  // set sentry error logging
  if (process.env.SENTRY_KEY) {
    config.set('sentry', process.env.SENTRY_KEY);
  }

  // start the application
  app.start().then(function() {
    console.log('Application started.');
  });
}());
