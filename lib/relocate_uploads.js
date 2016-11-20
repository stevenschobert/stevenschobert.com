var path        = require("path");
var url         = require("url");
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
    var siteBaseUrl = metadata.siteBaseUrl;
    var uploadFiles = Object.keys(uploadsIndex).reduce(function(acc, key) {
      var path = uploadsIndex[key];
      acc[path] = true;
      return acc;
    }, {});

    Object.keys(files).filter(function(filename) {
      return !uploadFiles[filename] && multimatch(filename, config.pattern)[0];
    }).forEach(function(filepath) {
      var file = files[filepath];
      var uploadUrlMatcher = null;
      var contents = null;
      var uploadFile = null;
      var uploadPath = null;
      var canonicalUploadPath = null;

      if (file) {
        debug("Scanning \"%s\" for upload uploadUrls to replace.", filepath);

        contents = file.contents.toString();

        for (var uploadUrl in uploadsIndex) {
          uploadFile = files[uploadsIndex[uploadUrl]];

          if (uploadFile) {
            uploadPath = path.join(file.rootPath, uploadsIndex[uploadUrl]);

            if (siteBaseUrl && siteBaseUrl.length > 0) {
              canonicalUploadPath = url.resolve(siteBaseUrl, uploadPath);
              canonicalMatcher = new RegExp("--CANONICAL--" + uploadUrl.replace(/([?=&])/g, "\\$1"), "g");
              contents = contents.replace(canonicalMatcher, canonicalUploadPath);
            }

            uploadUrlMatcher = new RegExp(uploadUrl.replace(/([?=&])/g, "\\$1"), "g");
            contents = contents.replace(uploadUrlMatcher, uploadPath);
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
