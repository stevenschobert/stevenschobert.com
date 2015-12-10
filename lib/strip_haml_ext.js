var log = require("util").debuglog("stip_haml_ext");
var MATCHER = /^(.*)\.haml$/i;

module.exports = function() {
  return function(files, metalsmith, done) {
    var newFilename;

    for (var file in files) {
      if ((newFilename = file.replace(MATCHER, "$1")) !== file) {
        log("Stripping .haml extension \"%s\" → \"%s\"", file, newFilename);
        files[newFilename] = files[file];
        delete files[file];
      }
    }

    done();
  };
};
