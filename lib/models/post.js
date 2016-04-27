(function() {
  'use strict';

  var keylime = require('keylime');
  var paramCase = require('param-case');
  var moment = require('moment');
  var _ = require('lodash');
  var config = require('../config');
  var couch = require('../support/keylime_couch');
  var MarkdownRenderer = require('../support/markdown_renderer');

  var Post = keylime('Post');

  // add model middleware
  Post.use(couch(config.get('couch')));

  // define model
  Post
    .attr('title', '')
    .attr('description', '')
    .attr('slug')
    .attr('published', false)
    .attr('color', '#aeaeae')
    .attr('body', '')

    /**
     * Published dates get serialized to integer
     * timestamps for storage.
     */
    .attr('published_at', function() {
      return new Date();
    }).serialize(function(date) {
      return date.getTime();
    }).deserialize(function(timestamp) {
      return new Date(timestamp);
    })

    /**
     * Generate a slug based on the title of the post.
     */
    .method('slugify', function slugify() {
      this.slug = paramCase(this.title);
      return this;
    })

    /**
     * Prepares the post for displaying. Renders markdown
     * body, pretty-fies dates, etc.
     */
    .method('render', function render() {
      var mark = new MarkdownRenderer({markdown: this.body || ''});

      this.published_at = moment(this.published_at).format('MMM Do YYYY');

      return mark.render().bind(this)
      .then(function() {
        this.body = mark.html;
      });
    })

    .method('toJSON', function toJSON() {
      return _.omit(this, ['_rev', 'model_name']);
    });

  // helper method for getting posts grouped by year
  Post.publishedByYear = function publishedByYear() {
    return Post.publishedByMostRecent()
    .then(function(posts) {
      var reduced;

      /**
       * Group up the posts into a object where the keys
       * are the year the posts were published.
       */
      reduced = _.reduce(posts, function(acc, post) {
        var year = post.published_at.getFullYear();
        acc[year] = acc[year] || [];
        acc[year].push(post);
        return acc;
      }, {});

      /**
       * Map out sorted array of { year: '2014', posts: [...] }
       */
      return _.sortBy(_.map(reduced, function(posts, year) {
        return {year: year, posts: posts};
      }), function(year) {
        return parseInt(year.year, 10);
      }).reverse();
    });
  };

  Post.published = function getPublishedPosts() {
    return Post.where({published: true});
  };

  Post.publishedWhere = function getPublishedPostsWhere() {
    return Post.where.apply(null, arguments)
    .then(function(posts) {
      return _.where(posts, {published: true});
    });
  };

  Post.publishedByMostRecent = function getPublishedPostsByMostRecent() {
    return Post.published()
    .then(function(posts) {
      return _.sortBy(posts, function(post) {
        return post.published_at.getTime();
      }).reverse();
    });
  };

  module.exports = Post;
}());
