var extend  = require("extend");
var moment  = require("moment");
var path    = require("path");

var helpers = {};

// gets a path to another file based on the
// current files location
helpers.urlTo = function urlTo(file) {
  var mightBeFingerprintedPath = file;

  if (this.fingerprint && this.fingerprint[file] !== undefined) {
    mightBeFingerprintedPath = this.fingerprint[file];
  }

  if (typeof mightBeFingerprintedPath === "string") {
    return path.join(this.rootPath, mightBeFingerprintedPath);
  }

  return path.join(this.rootPath, file.path.dir);
};

// gets a path to the current file
helpers.urlToSelf = function urlToSelf() {
  return path.join(this.rootPath, this.path.dir);
};

// pretty-prints a date in format: Mon 12, 1204
helpers.printDate = function printDate(date) {
  return moment(date).format("MMM D, YYYY");
};

helpers.printDateForArchive = function printDate(date) {
  return moment(date).format("MMM D");
};

module.exports = function() {
  return function(files, metalsmith, done) {
    for (var file in files) {
      extend(files[file], helpers);
    }

    done();
  };
};
