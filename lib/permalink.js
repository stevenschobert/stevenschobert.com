var debug   = require("debug")("permalink");
var MATCHER = /index/i;

module.exports = function() {
  return function(files, metalsmith, done) {
    var base, extension, newPath;

    for (var file in files) {
      base = file.split(".", 1).shift();
      extension = file.replace(base, "");

      if (!MATCHER.test(base)) {
        newPath = base + "/index" + extension;
        debug("Moving \"%s\" → \"%s\"", file, newPath);
        files[newPath] = files[file];
        delete files[file];
      }
    }

    done();
  }
}
