(function() {
  'use strict';

  var keylime = require('keylime');
  var Promise = require('bluebird');
  var bcrypt = require('bcrypt-nodejs');
  var hash = Promise.promisify(bcrypt.hash);
  var compare = Promise.promisify(bcrypt.compare);
  var secureAttrs = require('../support/keylime_secure_attrs');
  var couch = require('../support/keylime_couch');
  var config = require('../config');

  var User = keylime('User');

  // Add model middlware
  User
    .use(secureAttrs())
    .use(couch(config.get('couch')));

  // add attributes and methods
  User
    .attr('email')
    .attr('username')
    .attr('password')
      .hidden()

    /**
     * Sets a password using bcrypt. Returns a promise
     * to keep things non-blocking. Should be called
     * before saving a new user record.
     *
     *    user.setPassword('newpass');
     */
    .method('setPassword', function setPassword(pass) {
      return hash(pass, null, null).bind(this)
      .then(function(hash) {
        this.password = hash;
      });
    })

    /**
     * Compares a plain-text password with the password hash.
     * Returns a promise that resolves with true/false.
     *
     *    user.comparePassword('testpass');
     */
    .method('comparePassword', function comparePassword(pass) {
      return compare(pass, this.password).bind(this);
    });

  module.exports = User;
}());
