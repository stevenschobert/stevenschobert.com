var debug       = require("debug")("includes");
var extend      = require("extend");
var fs          = require("fs");
var multimatch  = require("multimatch");
var path        = require("path");

module.exports = function(opts) {
  var config = extend({
    directory: "includes",
    matcher: "##include (.*)",
    preserveWhitespace: false,
    pattern: "*"
  }, opts);

  return function(files, metalsmith, done) {
    var partialsDir = path.join(metalsmith.directory(), config.directory);
    var matcher = new RegExp(config.matcher);
    var partials = {};
    var stringContents;
    var replacement;
    var linePrefix;
    var matches;

    fs.readdirSync(partialsDir).forEach(function(name) {
      var filePath = path.join(partialsDir, name);
      var contents = fs.readFileSync(filePath, { encoding: "utf-8" });

      partials[name] = contents;
    });

    for (var file in files) {
      if (multimatch(file, config.pattern)[0]) {
        stringContents = files[file].contents.toString();

        debug("Checking file \"%s\" with options %j", file, config);

        while ((matches = matcher.exec(stringContents)) !== null) {
          debug("Found match in \"%s\": %s", file, matches[0]);

          replacement = partials[matches[1]];

          if (replacement) {
            linePrefix = stringContents.slice(0, matches.index).split("\n").pop() || "";

            if (config.preserveWhitespace) {
              replacement = replacement.split("\n").map(function(part) {
                return linePrefix + part;
              }).join("\n").trim();
            }

            stringContents = stringContents.replace(matches[0], replacement);
          }
        }

        files[file].contents = new Buffer(stringContents);
      }
    }

    done();
  };
};
