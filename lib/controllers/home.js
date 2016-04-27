(function() {
  'use strict';

  var keylime = require('keylime');
  var _ = require('lodash');

  var Post = require('../models/post');
  var HomeController = keylime('HomeController');

  HomeController
    .method('index', function index(request) {
      return Post.publishedByMostRecent()
      .bind(this)
      .then(function(posts) {
        var topPosts = posts.splice(0, 3);
        return this.render('home/index', {posts: topPosts, request: request});
      });
    });

  module.exports = HomeController;
}());
