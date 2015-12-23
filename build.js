var Metalsmith = require("metalsmith");
var path = require("path");

// 3rd party build scripts
var branch        = require("metalsmith-branch");
var collections   = require("metalsmith-collections");
var ignore        = require("metalsmith-ignore");
var inPlace       = require("metalsmith-in-place");
var layouts       = require("metalsmith-layouts");
var paths         = require("metalsmith-paths");
var rootPath      = require("metalsmith-rootpath");

// first party build scripts
var inkplate  = require("./lib/inkplate_content");
var permalink = require("./lib/permalink");
var rename    = require("./lib/rename");

// build state helpers
var startTime = Date.now();

Metalsmith(__dirname)
  // content
  .use(ignore([
    ".DS_Store"
  ]))
  .use(inkplate())

  // structure
  .use(collections({
    posts: {
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(permalink())
  .use(rootPath())
  .use(paths())

  // rendering
  .use(function(files, metalsmith, done) {
    var urlTo = function(file) {
      if (typeof file === "string") {
        return path.join(this.rootPath, file);
      }
      return path.join(this.rootPath, file.path.href);
    };
    for (var file in files) {
      files[file].urlTo = urlTo.bind(files[file]);
    }
    done();
  })
  .use(layouts({
    engine: "haml"
  }))
  .use(inPlace({
    engine: "haml",
    pattern: "**/*.haml"
  }))
  .use(rename(/^(.*)\.haml$/i, "$1"))

  // finalize
  .build(function resolveBuild(error) {
    var endTime = Date.now();
    var elapsedSeconds = (endTime - startTime) / 100;

    if (error) {
      console.log(error);
      throw error;
    } else {
      process.stdin.write("Done building! Build time: " + elapsedSeconds + " seconds");
    }
  });
