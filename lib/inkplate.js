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

function allUploadsPath() {
  return "/api/uploads";
}

function allPostsPath() {
  return "/api/posts";
}

function allPagesPath() {
  return "/api/pages";
}

function uploadPath(id) {
  return "/api/uploads/" + id;
}

function postPath(id) {
  return "/api/posts/" + id;
}

function pagePath(id) {
  return "/api/pages/" + id;
}

function collectUploads(options) {
  return request.getAsync({ url: options.host + allUploadsPath(), json: true }).then(function(response) {
    return response.body.uploads;
  }).map(function(upload) {
    return request.getAsync({ url: options.host + uploadPath(upload.id), json: true });
  }).map(function(response) {
    return response.body;
  });
}

function collectPosts(options) {
  return request.getAsync({ url: options.host + allPostsPath(), json: true }).then(function(response) {
    return response.body.posts;
  }).map(function(post) {
    return request.getAsync({ url: options.host + postPath(post.id), json: true });
  }).map(function(response) {
    return response.body;
  });
}

function collectPages(options) {
  return request.getAsync({ url: options.host + allPagesPath(), json: true }).then(function(response) {
    return response.body.pages;
  }).map(function(page) {
    return request.getAsync({ url: options.host + pagePath(page.id), json: true });
  }).map(function(response) {
    return response.body;
  });
}

module.exports = function(config) {
  var options = extend({
    host: "http://localhost:9292",
    extension: "html",
    saveUploads: true,
    uploadsDir: "uploads",
    processPost: function() {},
    processPage: function() {},
  }, config);

  return function(files, metalsmith, done) {
    var actions = [];
    var uploadsIndex = {};

    actions.push(collectPosts(options).each(function(post) {
      var path = [slugForDate(post.created_at), post.slug, "index." + options.extension].join("/");
      var postOptions = options.processPost(post) || {};

      debug("Saving post to → \"%s\" with options %j", path, postOptions);

      files[path] = extend({
        contents: new Buffer(post.body),
        mode: '0644',
      }, postOptions);

      return true;
    }));

    actions.push(collectPages(options).each(function(page) {
      var path = [page.slug, "index." + options.extension].join("/");
      var pageOptions = options.processPage(page) || {};

      debug("Saving page to → \"%s\" with options %j", path, pageOptions);

      files[path] = extend({
        contents: new Buffer(page.body),
        mode: '0644',
      }, pageOptions);

      return true;
    }));

    if (options.saveUploads) {
      actions.push(collectUploads(options).map(function(upload) {
        var path = [options.uploadsDir, upload.name].join("/");

        debug("Saving upload \"%s\" upload to → \"%s\"", upload.url, path);

        return request.getAsync({ url: upload.url, encoding: null }).then(function(response) {
          uploadsIndex[upload.url] = path;

          files[path] = {
            contents: response.body,
            mode: '0644'
          };

          return true;
        });
      }));
    }

    Promise.all(actions).then(function() {
      metalsmith.metadata().inkplate_uploads = uploadsIndex;
      done();
    }).catch(function(error) {
      done(error);
    });
  };
}
