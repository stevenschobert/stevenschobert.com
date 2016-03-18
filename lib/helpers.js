var extend  = require("extend");
var moment  = require("moment");
var path    = require("path");

var helpers = {};

// gets a path to another file based on the
// current files location
helpers.urlTo = function urlTo(file) {
  if (typeof file === "string") {
    return path.join(this.rootPath, file);
  }

  return path.join(this.rootPath, file.path.dir);
};

// pretty-prints a date in format: Mon 12, 1204
helpers.printDate = function printDate(date) {
  return moment(date).format("MMM D YYYY");
};

module.exports = function() {
  return function(files, metalsmith, done) {
    for (var file in files) {
      extend(files[file], helpers);
    }

    done();
  };
};
