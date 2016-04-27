(function() {
  'use strict';

  var Promise = require('bluebird');
  var prompt = require('prompt');
  var get = Promise.promisify(prompt.get);
  var config = require('../lib/config');
  var User, user;

  // set couch configuration
  config.set('couch', {
    url: process.env.COUCH_URL || 'http://localhost',
    port: process.env.COUCH_PORT || 5984,
    database: process.env.COUCH_DB || 'blog-dev',
    username: process.env.COUCH_USER || null,
    password: process.env.COUCH_PASS || null
  });

  // bring in the user model
  User = require('../lib/models/user');

  // start the prompt
  prompt.start();

  // ask for the username and email
  get(['email', 'username', 'password'])
  .then(function(result) {
    user = new User({
      email: result.email,
      username: result.username
    });

    return user.setPassword(result.password);
  })
  .then(function() {
    return user.save();
  })
  .then(function() {
    console.log('User created!');
  });
}());
