var debug     = require("debug")("inkplate");
var extend    = require("extend");
var Promise   = require("bluebird");
var request   = Promise.promisifyAll(require("request"));

function padNum(num, limit) {
  var prefix = "";
  if (num.toString().length < limit) {
    for (var i=limit; i > 1; i--) {
      prefix += "0";
    }
  }
  return prefix + num;
}

function slugForDate(date) {
  var date  = (date instanceof Date) ? date : new Date(date);
  var year  = padNum(date.getFullYear(), 4);
  var month = padNum(date.getMonth() + 1, 2);
  var day   = padNum(date.getDate(), 2);

  return [year, month, day].join("/");
}

function allPostsPath() {
  return "/api/posts";
}

function postPath(id) {
  return "/api/posts/" + id;
}

function collectPosts(options) {
  return request.getAsync({ url: options.host + allPostsPath(), json: true }).then(function(response) {
    return response.body.posts;
  }).map(function(post) {
    return request.getAsync({ url: options.host + postPath(post.id), json: true });
  }).map(function(response) {
    return response.body;
  })
}

module.exports = function(config) {
  var options = extend({
    host: "http://localhost:9292",
    processPost: function() {},
  }, config);

  return function(files, metalsmith, done) {
    collectPosts(options).each(function(post) {
      var path = [slugForDate(post.created_at), post.slug, "index.html"].join("/");
      var postOptions = options.processPost(post) || {};

      debug("Saving post to → \"%s\" with options %j", path, postOptions);

      files[path] = extend({
        contents: new Buffer(post.body),
        mode: '0644',
      }, postOptions);

      return files[path];
    }).then(function() {
      done();
    }).catch(function(error) {
      done(error);
    });
  };
}
