(function() {
  'use strict';

  var keylime = require('keylime');
  var _ = require('lodash');
  var Post = require('../../models/post');
  var createError = require('../../support/util/create_error_class');
  var requireAuth = require('../../filters/require_auth');

  var safeParams = ['title', 'description', 'slug', 'color', 'body', 'published'];
  var PostNotFoundError = createError('PostNotFoundError');
  var ApiPostsController = keylime('ApiPostsController');

  ApiPostsController
    .init(function() {
      this.before('index', 'replace', 'create', 'destroy', requireAuth);
    })

    .method('index', function index(request) {
      var postsQuery = (request.user) ? Post.all() : Post.published();
      return postsQuery.bind(this)
      .then(function(posts) {
        var jsonPosts = _.map(posts, function(post) {
          return post.toJSON();
        });
        return this.json({posts: jsonPosts});
      });
    })

    .method('destroy', function destroy(request) {
      return Post.find(request.params.id).bind(this)
      .then(function(post) {
        if (!post) {
          throw new PostNotFoundError('Post not found');
        }
        return post.remove();
      })
      .then(function() {
        return this.json({});
      })
      .catch(PostNotFoundError, function(err) {
        return this.json({error: err.message});
      });
    })

    .method('create', function create(request) {
      var params = _.pick(request.params.post, safeParams);
      var post = new Post(params);

      if (_.isEmpty(post.slug)) {
        post.slugify();
      }

      return post.save().bind(this)
      .then(function() {
        return this.json({post: post.toJSON()});
      });
    })

    .method('replace', function replace(request) {
      var params = _.pick(request.params.post, safeParams);

      return Post.find(request.params.id).bind(this)
      .then(function(post) {
        var wasPublished;

        if (!post) {
          throw new PostNotFoundError('Post not found.');
        }

        wasPublished = post.published;
        _.extend(post, params);

        if (_.isEmpty(post.slug)) {
          post.slugify();
        }

        if (!wasPublished && post.published) {
          post.published_at = new Date();
        }

        return post.save();
      })
      .then(function(post) {
        return this.json({post: post.toJSON()});
      })
      .catch(PostNotFoundError, function(err) {
        return this.json({error: err.message});
      });
    });

  module.exports = ApiPostsController;
}());
