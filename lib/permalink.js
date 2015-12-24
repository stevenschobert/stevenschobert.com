var debug   = require("debug")("permalink");
var BASE_MATCHER = /index/i;
var EXT_MATCHER = /html/i

module.exports = function() {
  return function(files, metalsmith, done) {
    var base, extension, newPath;

    for (var file in files) {
      base = file.split(".", 1).shift();
      extension = file.replace(base, "");

      if (!BASE_MATCHER.test(base) && EXT_MATCHER.test(extension)) {
        newPath = base + "/index" + extension;
        debug("Moving \"%s\" → \"%s\"", file, newPath);
        files[newPath] = files[file];
        delete files[file];
      }
    }

    done();
  }
}
