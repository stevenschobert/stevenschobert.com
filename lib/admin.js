(function() {
  'use strict';

  var Pimm = require('pimm');
  var path = require('path');
  var requestUser = require('./middleware/request_user');
  var messages = require('./middleware/messages');

  var admin = new Pimm({
    dir: __dirname,
    static: path.join(__dirname, '../public')
  });

  // add middleware
  admin.use(requestUser);
  admin.use(messages);

  // add routes
  admin.routes(function() {
    this.get('login', 'session#new');
    this.get('logout', 'session#destroy');
    this.resource('session');

    this.namespace('api', function() {
      this.resources('posts');
    });

    this.get('/', 'admin#index');
  });

  module.exports = admin;
}());
