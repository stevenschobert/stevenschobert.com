var Metalsmith = require("metalsmith");

// 3rd party build scripts
var collections   = require("metalsmith-collections");
var ignore        = require("metalsmith-ignore");
var inPlace       = require("metalsmith-in-place");
var layouts       = require("metalsmith-layouts");
var paths         = require("metalsmith-paths");
var rootPath      = require("metalsmith-rootpath");
var sass          = require("metalsmith-sass");

// first party build scripts
var helpers   = require("./lib/helpers");
var includes  = require("./lib/includes");
var inkplate  = require("./lib/inkplate");
var permalink = require("./lib/permalink");
var rename    = require("./lib/rename");

// build state helpers
var startTime = Date.now();

Metalsmith(__dirname)
  .use(ignore(["**/.DS_Store"]))

  // content
  .use(inkplate({
    processPost: function(post) {
      return {
        collection: "posts",
        layout: "post_detail.haml",
        title: post.title,
        date: new Date(post.created_at),
        color: post.custom_fields.color_code
      };
    }
  }))

  // structure
  .use(collections({
    posts: {
      sortBy: "date",
      reverse: true
    }
  }))
  .use(permalink())
  .use(rootPath())
  .use(paths())

  // rendering
  .use(sass({
    outputStyle: "compressed"
  }))
  .use(includes({
    directory: "includes",
    pattern: "**/*.haml",
    preserveWhitespace: true,
    matcher: "-# include (.*)"
  }))
  .use(helpers())
  .use(inPlace({
    engine: "haml",
    pattern: ["**/*.haml"]
  }))
  .use(layouts({
    engine: "haml",
    directory: "layouts"
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
