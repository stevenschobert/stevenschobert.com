var Metalsmith = require("metalsmith");

// 3rd party build scripts
var collections = require("metalsmith-collections");
var inPlace = require("metalsmith-in-place");

// first party build scripts
var stripHamlExt = require("./lib/strip_haml_ext");

// build state helpers
var startTime = Date.now();

Metalsmith(__dirname)
  // structure
  .use(collections({
    posts: {
      sortBy: 'date',
      reverse: true
    }
  }))

  // rendering
  .use(inPlace({
    engine: "haml",
    pattern: "*.haml"
  }))
  .use(stripHamlExt())

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
