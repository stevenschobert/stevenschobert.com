var extend  = require("extend");
var moment  = require("moment");
var path    = require("path");
var url     = require("url");

var helpers = {};

// gets a path to another file based on the
// current files location
helpers.urlTo = function urlTo(file, options) {
  var config = options || { canonical: false };
  var mightBeFingerprintedPath = file;

  if (this.fingerprint && this.fingerprint[file] !== undefined) {
    mightBeFingerprintedPath = this.fingerprint[file];
  }

  if (typeof mightBeFingerprintedPath === "string") {
    if (config.canonical === true) {
      return url.resolve(this.siteBaseUrl, mightBeFingerprintedPath);
    }
    return path.join(this.rootPath, mightBeFingerprintedPath);
  }

  if (config.canonical === true) {
    return url.resolve(this.siteBaseUrl, file.path.dir);
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

helpers.printDate = function printDate(date, format) {
  var fmt = format || "MMM D, YYYY";
  return moment(date).format(fmt);
};

module.exports = function() {
  return function(files, metalsmith, done) {
    for (var file in files) {
      extend(files[file], helpers);
    }

    done();
  };
};
