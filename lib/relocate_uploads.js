var path = require("path");
var debug = require("debug")("relocate_uploads");

module.exports = function() {
  return function(files, metalsmith, done) {
    var metadata = metalsmith.metadata() || {};
    var uploadsIndex = metadata.inkplate_uploads || {};
    var uploadFiles = Object.keys(uploadsIndex).reduce(function(acc, key) {
      var path = uploadsIndex[key];
      acc[path] = true;
      return acc;
    }, {});

    Object.keys(files).filter(function(filename) {
      return !uploadFiles[filename];
    }).forEach(function(filepath) {
      var file = files[filepath];
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
            contents = contents.replace(url, uploadPath);
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