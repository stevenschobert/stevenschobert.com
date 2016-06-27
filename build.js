require("dotenv").config();

var Metalsmith = require("metalsmith");

// 3rd party build scripts
var archive       = require("metalsmith-archive");
var collections   = require("metalsmith-collections");
var drafts        = require("metalsmith-drafts");
var ignore        = require("metalsmith-ignore");
var inPlace       = require("metalsmith-in-place");
var layouts       = require("metalsmith-layouts");
var markdown      = require("metalsmith-markdown");
var metallic      = require("metalsmith-metallic");
var paths         = require("metalsmith-paths");
var redirect      = require("metalsmith-redirect");
var rootPath      = require("metalsmith-rootpath");
var sass          = require("metalsmith-sass");

// first party build scripts
var helpers           = require("./lib/helpers");
var includes          = require("./lib/includes");
var inkplate          = require("./lib/inkplate");
var permalink         = require("./lib/permalink");
var relocateUploads   = require("./lib/relocate_uploads");
var rename            = require("./lib/rename");

// build state helpers
var startTime = Date.now();

var pipeline = Metalsmith(__dirname);

// misc
pipeline.use(ignore(["**/.DS_Store"]))

// content
pipeline.use(inkplate({
  extension: "md",
  apiKey: process.env.INKPLATE_API_KEY,
  host: process.env.INKPLATE_HOST,
  processPost: function(post) {
    return {
      collection: "posts",
      layout: "default.haml",
      title: post.title,
      type: "post",
      draft: !!(post.status !== "publish"),
      date: new Date(post.created_at),
      color: (post.custom_fields || {}).color,
      link: (post.custom_fields || {}).link
    };
  },
  processPage: function(page) {
    return {
      draft: !!(page.status !== "publish"),
      layout: "default.haml",
      type: "page",
      title: page.title
    };
  }
}));
pipeline.use(metallic());
pipeline.use(markdown());

// remove drafts in production
if (process.env.NODE_ENV === "production") {
  pipeline.use(drafts());
}

// structure
pipeline.use(collections({
  posts: {
    sortBy: "date",
    reverse: true
  }
}));
pipeline.use(archive({
  collections: ["\\d{4}\\/\\d{2}\\/\\d{2}\\/*"]
}));
pipeline.use(permalink());
pipeline.use(rootPath());
pipeline.use(paths());

// rendering
pipeline.use(sass({
  outputStyle: "compressed"
}));
pipeline.use(includes({
  directory: "includes",
  pattern: "**/*.haml",
  preserveWhitespace: true,
  matcher: "-# include (.*)"
}));
pipeline.use(helpers());
pipeline.use(inPlace({
  engine: "haml",
  pattern: ["**/*.haml"]
}));
pipeline.use(layouts({
  engine: "haml",
  directory: "layouts"
}));
pipeline.use(rename(/^(.*)\.haml$/i, "$1"));
pipeline.use(relocateUploads());

// redirects
pipeline.use(redirect(require("./redirects.json")));

// finalize
pipeline.build(function resolveBuild(error) {
  var endTime = Date.now();
  var elapsedSeconds = (endTime - startTime) / 100;

  if (error) {
    console.log(error);
    throw error;
  } else {
    process.stdin.write("Done building! Build time: " + elapsedSeconds + " seconds");
  }
});
