(function() {
  'use strict';

  var env = require('dotenv').load();
  var admin = require('../lib/admin');
  var config = require('../lib/config');

  // set adminlication configs
  admin.port = process.env.ADMIN_PORT || 3001;
  admin.session = process.env.SESSION_KEY || 'secret';
  admin.caching = process.env.NODE_ENV === 'production';

  // set couch configuration
  config.set('couch', {
    url: process.env.COUCH_URL || 'http://localhost',
    port: process.env.COUCH_PORT || 5984,
    database: process.env.COUCH_DB || 'blog-dev',
    username: process.env.COUCH_USER || null,
    password: process.env.COUCH_PASS || null
  });

  // start the adminlication
  admin.start().then(function() {
    console.log('Application started.');
  });
}());
