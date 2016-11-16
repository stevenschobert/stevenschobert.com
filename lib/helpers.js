var extend  = require("extend");
var moment  = require("moment");
var path    = require("path");
var url     = require("url");

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
helpers.urlToSelf = function urlToSelf(options) {
  var config = options || { canonical: false };
  var selfPath = path.join(this.rootPath, this.path.dir);

  if (config.canonical === true) {
    return url.resolve(this.siteBaseUrl, selfPath);
  }

  return selfPath;
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
