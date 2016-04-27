(function() {
  'use strict';

  var keylime = require('keylime');
  var _ = require('lodash');
  var Post = require('../models/post');
  var PostsController = keylime('PostsController');

  PostsController
    .method('index', function index(request) {
      return Post.publishedByYear().bind(this)
      .then(function(posts) {
        return this.render('posts/index', {posts: posts, request: request});
      });
    })

    .method('show', function show(request) {
      return Post.publishedWhere({slug: request.params.id}).bind(this)
      .then(function(posts) {
        var post = _.first(posts);
        if (_.isEmpty(posts)) {
          return this.text('Not found', 404);
        }
        return post.render().bind(this)
        .then(function() {
          return this.render('posts/show', {post: post, request: request});
        });
      });
    });

  module.exports = PostsController;
}());
