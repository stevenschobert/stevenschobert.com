var debug     = require("debug")("inkplate");
var extend    = require("extend");
var Promise   = require("bluebird");
var spath     = require("path");
var crypto    = require("crypto");
var fs        = Promise.promisifyAll(require("fs"));
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

function allMicroPath() {
  return "/api/micro";
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

function microPath(id) {
  return "/api/micro/" + id;
}

function collectUploads(options) {
  return request.getAsync({ url: options.host + allUploadsPath(), json: true, qs: { api_key: options.apiKey } }).then(function(response) {
    return response.body.uploads;
  }).map(function(upload) {
    return request.getAsync({ url: options.host + uploadPath(upload.id), json: true, qs: { api_key: options.apiKey } });
  }).map(function(response) {
    return response.body;
  });
}

function collectPosts(options) {
  return request.getAsync({ url: options.host + allPostsPath(), json: true, qs: { api_key: options.apiKey } }).then(function(response) {
    return response.body.posts;
  }).map(function(post) {
    return request.getAsync({ url: options.host + postPath(post.id), json: true, qs: { api_key: options.apiKey } });
  }).map(function(response) {
    return response.body;
  });
}

function collectPages(options) {
  return request.getAsync({ url: options.host + allPagesPath(), json: true, qs: { api_key: options.apiKey } }).then(function(response) {
    return response.body.pages;
  }).map(function(page) {
    return request.getAsync({ url: options.host + pagePath(page.id), json: true, qs: { api_key: options.apiKey } });
  }).map(function(response) {
    return response.body;
  });
}

function collectMicro(options) {
  return request.getAsync({ url: options.host + allMicroPath(), json: true, qs: { api_key: options.apiKey } }).then(function(response) {
    return response.body.micro_posts;
  }).map(function(micro) {
    return request.getAsync({ url: options.host + microPath(micro.id), json: true, qs: { api_key: options.apiKey } });
  }).map(function(response) {
    return response.body;
  });
}

module.exports = function(config) {
  var options = extend({
    host: "http://localhost:9292",
    extension: "html",
    saveUploads: true,
    caching: true,
    cacheDir: ".inkplate",
    apiKey: null,
    uploadsDir: "uploads",
    processPost: function() {},
    processPage: function() {},
    processMicro: function() {}
  }, config);

  return function(files, metalsmith, done) {
    var actions = [];
    var uploadsIndex = {};
    var cacheDir = spath.join(metalsmith.directory(), options.cacheDir || "./");

    if (options.caching) {
      if (!fs.existsSync(cacheDir)) {
        debug("Creating new cache directory at \"%s\"", cacheDir);
        fs.mkdir(cacheDir);
      }
    }

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

    actions.push(collectMicro(options).each(function(micro) {
      var path = [slugForDate(micro.created_at), micro.id, "index." + options.extension].join("/");
      var microOptions = options.processMicro(micro) || {};

      debug("Saving micro-post to → \"%s\" with options %j", path, microOptions);

      files[path] = extend({
        contents: new Buffer(micro.body),
        mode: '0644',
      }, microOptions);

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
        var filePath = [options.uploadsDir, upload.name].join("/");
        var cachePath = spath.join(cacheDir, upload.name);

        return { upload: upload, path: filePath, cachePath: cachePath };
      }).map(function(result) {
        result.hasCache = false;
        if (options.caching && result.cachePath) {
          return fs.statAsync(result.cachePath).then(function(stat) {
            debug("Found cached file \"%s\"!", result.cachePath);
            result.hasCache = true;
            return result;
          }).catch({ code: 'ENOENT' }, function(error) {
            debug("No cached file found at \"%s\".", result.cachePath);
            return result;
          });
        }
        return result;
      }).map(function(result) {
        result.cacheContents = null;
        if (result.hasCache) {
          return fs.readFileAsync(result.cachePath).then(function(contents) {
            result.cacheContents = contents;
            return result;
          });
        }
        return result;
      }).map(function(result) {
        var hash, hashed;
        result.exactCopy = false;
        result.contents = null;
        if (result.cacheContents) {
          hash = crypto.createHash("sha1");
          hash.update(result.cacheContents, null);
          hashed = hash.digest("hex");
          if (hashed === result.upload.checksum) {
            debug("Verified checksum of \"%s\" as \"%s\".", result.cachePath, result.upload.checksum);
            result.exactCopy = true;
            result.contents = result.cacheContents;
          } else {
            debug("Invalid checksum of \"%s\" as \"%s\" !== \"%s\".", result.cachePath, hashed, result.upload.checksum);
          }
        }
        return result;
      }).map(function(result) {
        if (!result.contents) {
          debug("Downloading file from \"%s\"", result.upload.url);
          return request.getAsync({ url: result.upload.url, encoding: null }).then(function(response) {
            result.contents = response.body;
            return result;
          });
        }
        return result;
      }).map(function(result) {
        if (!result.exactCopy) {
          debug("Caching contents of file to \"%s\".", result.cachePath);
          return fs.writeFileAsync(result.cachePath, result.contents, "binary").then(function() {
            return result;
          });
        }
        return result;
      }).map(function(result) {
        uploadsIndex[result.upload.url] = result.path;

        files[result.path] = {
          contents: result.contents,
          mode: '0644'
        };

        return true;
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
