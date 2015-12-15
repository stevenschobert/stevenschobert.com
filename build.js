var Metalsmith = require("metalsmith");

// 3rd party build scripts
var collections = require("metalsmith-collections");
var inPlace = require("metalsmith-in-place");
var layouts = require("metalsmith-layouts");

// first party build scripts
var stripHamlExt = require("./lib/strip_haml_ext");
var inkplate = require("./lib/inkplate_content");

// build state helpers
var startTime = Date.now();

Metalsmith(__dirname)
  // content
  .use(inkplate())

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
  .use(layouts({
    engine: "haml"
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
