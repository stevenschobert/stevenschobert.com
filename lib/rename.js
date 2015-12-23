var log = require("util").debuglog("rename");

module.exports = function(matcher, replace) {
  return function(files, metalsmith, done) {
    var newFilename;

    for (var file in files) {
      if ((newFilename = file.replace(matcher, replace)) !== file) {
        log("Renaming \"%s\" → \"%s\"", file, newFilename);
        files[newFilename] = files[file];
        delete files[file];
      }
    }

    done();
  };
};
