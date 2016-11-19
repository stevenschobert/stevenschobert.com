require("dotenv").config();

var Metalsmith = require("metalsmith");

// 3rd party build scripts
var archive       = require("metalsmith-archive");
var collections   = require("metalsmith-collections");
var concat        = require("metalsmith-concat");
var drafts        = require("metalsmith-drafts");
var feed          = require("metalsmith-feed");
var fingerprint   = require("metalsmith-fingerprint-ignore");
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
pipeline.destination(process.env.BUILD_DIR || "./build");
pipeline.clean(!process.env.SKIP_CLEAN);

// misc
pipeline.use(ignore(["**/.DS_Store"]));

// global env
pipeline.metadata().siteBaseUrl = process.env.BASE_URL || null;

// content
pipeline.use(inkplate({
  extension: "md",
  apiKey: process.env.INKPLATE_API_KEY,
  host: process.env.INKPLATE_HOST,
  processPost: function(post) {
    var description = (post.excerpt && post.excerpt.length > 0) ? post.excerpt : null;

    return {
      collection: "posts",
      layout: "default.haml",
      title: post.title,
      type: "post",
      description: description,
      draft: !!(post.status !== "publish"),
      date: new Date(post.created_at),
      color: (post.custom_fields || {}).color,
      link: (post.custom_fields || {}).link
    };
  },
  processPage: function(page) {
    var description = (page.excerpt && page.excerpt.length > 0) ? page.excerpt : null;

    return {
      draft: !!(page.status !== "publish"),
      layout: "default.haml",
      type: "page",
      description: description,
      title: page.title
    };
  }
}));
pipeline.use(metallic());
pipeline.use(markdown());

// remove drafts in production
if (!process.env.INCLUDE_DRAFTS) {
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
pipeline.use(concat({
  files: [
    "js/vendor/jquery*.js",
    "js/vendor/*.js",
    "js/**/*.js",
  ],
  output: "js/main.js",
  keepConcatenated: false
}));
pipeline.use(fingerprint({
  pattern: [
    "css/main.css",
    "js/main.js"
  ]
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

// RSS Feed
pipeline.use(function(files, ms, done) {
  var baseUrl = ms.metadata().siteBaseUrl;
  var file;
  for (var filename in files) {
    file = files[filename];
    if (file.collection && file.collection.indexOf("posts") >= 0) {
      file.siteBaseUrl = baseUrl;
      file.url = file.urlToSelf.call(file, { canonical: true });
    }
  }
  done();
});
pipeline.use(feed({
  title: "Steven Schobert",
  collection: "posts",
  limit: 20,
  site_url: pipeline.metadata().siteBaseUrl,
  postDescription: function(post) {
    return post.description;
  }
}));

// finalize
pipeline.build(function resolveBuild(error) {
  var endTime = Date.now();
  var elapsedSeconds = (endTime - startTime) / 100;

  if (error) {
    console.log(error);
    throw error;
  } else {
    console.log("Done building! Build time: " + elapsedSeconds + " seconds");
  }
});
