var Metalsmith = require("metalsmith");

// 3rd party build scripts
var archive       = require("metalsmith-archive");
var collections   = require("metalsmith-collections");
var ignore        = require("metalsmith-ignore");
var inPlace       = require("metalsmith-in-place");
var layouts       = require("metalsmith-layouts");
var markdown      = require("metalsmith-markdown");
var metallic      = require("metalsmith-metallic");
var paths         = require("metalsmith-paths");
var rootPath      = require("metalsmith-rootpath");
var sass          = require("metalsmith-sass");
var watch         = require("metalsmith-watch");

// first party build scripts
var helpers           = require("./lib/helpers");
var includes          = require("./lib/includes");
var inkplate          = require("./lib/inkplate");
var permalink         = require("./lib/permalink");
var relocateUploads   = require("./lib/relocate_uploads");
var rename            = require("./lib/rename");

// build state helpers
var startTime = Date.now();

Metalsmith(__dirname)
  .use(ignore(["**/.DS_Store"]))

  // content
  .use(inkplate({
    extension: "md",
    processPost: function(post) {
      return {
        collection: "posts",
        layout: "default.haml",
        title: post.title,
        date: new Date(post.created_at),
        link: (post.custom_fields || {}).link
      };
    },
    processPage: function(page) {
      return {
        layout: "default.haml",
        title: page.title
      };
    }
  }))
  .use(metallic())
  .use(markdown())

  // structure
  .use(collections({
    posts: {
      sortBy: "date",
      reverse: true
    }
  }))
  .use(archive({
    collections: ["\\d{4}\\/\\d{2}\\/\\d{2}\\/*"]
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
  .use(relocateUploads())

  // finalize
  .use(function() {
    if (process.env.NODE_ENV === "development") {
      return watch({
        paths: {
          "${source}/**/*": true,
          "layouts/**/*": "**/*",
        },
        livereload: true
      });
    }

    return function(files, metalsmith, done) { done(); };
  }())
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
