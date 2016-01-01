var extend  = require("extend");
var path    = require("path");

var helpers = {};

// gets a path to another file based on the
// current files location
helpers.urlTo = function urlTo(file) {
  if (typeof file === "string") {
    return path.join(this.rootPath, file);
  }

  return path.join(this.rootPath, file.path.href);
};

module.exports = function() {
  return function(files, metalsmith, done) {
    for (var file in files) {
      extend(files[file], helpers);
    }

    done();
  };
};
