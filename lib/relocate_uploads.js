var path        = require("path");
var extend      = require("extend");
var multimatch  = require("multimatch");
var debug       = require("debug")("relocate_uploads");

module.exports = function(opts) {
  var config = extend({
    pattern: "**/*.html"
  }, opts);

  return function(files, metalsmith, done) {
    var metadata = metalsmith.metadata() || {};
    var uploadsIndex = metadata.inkplate_uploads || {};
    var uploadFiles = Object.keys(uploadsIndex).reduce(function(acc, key) {
      var path = uploadsIndex[key];
      acc[path] = true;
      return acc;
    }, {});

    Object.keys(files).filter(function(filename) {
      return !uploadFiles[filename] && multimatch(filename, config.pattern)[0];
    }).forEach(function(filepath) {
      var file = files[filepath];
      var urlMatcher = null;
      var contents = null;
      var uploadFile = null;
      var uploadPath = null;

      if (file) {
        debug("Scanning \"%s\" for upload urls to replace.", filepath);

        contents = file.contents.toString();

        for (var url in uploadsIndex) {
          uploadFile = files[uploadsIndex[url]];

          if (uploadFile) {
            uploadPath = path.join(file.rootPath, uploadsIndex[url]);
            urlMatcher = new RegExp(url.replace(/([?=&])/g, "\\$1"), "g");
            contents = contents.replace(urlMatcher, uploadPath);
          }

          uploadPath = null;
          uploadFile = null;
        }

        file.contents = new Buffer(contents);
      }
    });

    done();
  };
};
