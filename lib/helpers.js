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

// includes a partial files content
helpers.include = function include(name) {
  var file = this.allFiles[name] || {};
  return file.contents || "";
};

module.exports = function() {
  return function(files, metalsmith, done) {
    // expose all files to helpers
    helpers.allFiles = files;

    for (var file in files) {
      extend(files[file], helpers);
    }

    done();
  };
};
