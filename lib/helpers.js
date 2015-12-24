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
  var file = helpers.allFiles[name] || {};
  return file.contents || "";
};


module.exports = function() {
  return function(files, metalsmith, done) {
    var bound;

    for (var file in files) {
      bound = {};
      for (var helper in helpers) {
        bound[helper] = helpers[helper].bind(file);
      }
      extend(files[file], helpers);
    }

    // expose all files to helpers
    helpers.allFiles = files;

    done();
  };
};
