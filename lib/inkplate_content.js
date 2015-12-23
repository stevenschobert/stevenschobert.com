var log = require("util").debuglog("inkplate_content");
var format = require("util").format;
var fs = require("fs");
var http = require("http");

function fileForPost(post) {
  return {
    contents: new Buffer(post.body || ""),
    mode: '0644',
    collection: 'posts',
    layout: 'post_detail.haml',
    slug: post.slug,
    date: new Date(post.created_at)
  }
}

function padNum(num, limit) {
  var prefix = "";
  if (num.toString().length < limit) {
    for (var i=limit; i > 1; i--) {
      prefix += "0";
    }
  }
  return prefix + num;
}

function extend(target, source) {
  for (var prop in source) {
    target[prop] = source[prop];
  }

  return target;
}

function slugForDate(date) {
  var date = (date instanceof Date) ? date : new Date(date);
  var year = padNum(date.getFullYear(), 4);
  var month = padNum(date.getMonth(), 2);
  var day = padNum(date.getDate(), 2);

  return [year, month, day].join("/");
}

function streamPostToFiles(httpConfig, id, files, metalsmith, done) {
  log("Fetching post details: " + id);

  var context = {
    files: files,
    metalsmith: metalsmith,
    done: done
  };

  jsonGet(httpConfig, "/api/posts/" + id, function(error, data) {
    if (error) {
      return this.done(error);
    }

    var post = fileForPost(data);
    var filePath = [ slugForDate(post.date), "index.html" ].join("/");
    log("Got post details: %j", post);
    log("Writing data to file: %s", filePath);

    this.files[filePath] = post;

    this.done();
  }.bind(context));
}

function jsonGet(httpConfig, path, done) {
  var opts = extend({}, httpConfig);
  opts.path = path;
  log("Making request with options: %j", opts);

  var req = http.request(opts, function(response) {
    log("Received %d response with headers: %j", response.statusCode, response.headers);

    var dataRef = { string: "" };

    response.setEncoding("utf8");

    response.on("data", function(data, chunk) {
      log("Decoding response chunk: %j", chunk);
      data.string += chunk;
    }.bind(null, dataRef));

    response.on("end", function(data) {
      log("Reached end of response: %j", data.string);

      try {
        var json = JSON.parse(data.string);
        log("Decoded response as JSON: %j", json);
        done(null, json);
      } catch(e) {
        var errorMsg = format("Error decoding response JSON: %s: %s", e.message, data.string)
        done(new Error("[inkplate_content] " + errorMsg));
      }

    }.bind(null, dataRef));
  });

  req.on("error", function(e) {
    var errorMsg = "Error making request: " + e.message;
    log(errorMsg);
    done(new Error("[inkplate_content] " + errorMsg));
  });

  req.end();
};

module.exports = function(options) {
  var defaults = {
    host: "localhost",
    port: 9292,
    headers: {
      "Accept": "application/json"
    }
  };

  var defaults = extend(defaults, options || {});

  return function(httpConfig, files, metalsmith, done) {
    log("Fetching posts at: /api/posts");

    var context = {
      httpConfig: httpConfig,
      files: files,
      metalsmith: metalsmith,
      done: done
    };

    jsonGet(httpConfig, "/api/posts", function(error, data) {
      if (error) {
        log("Error fetching posts: %s", error);
        return this.done(error);
      }

      log("Got posts index: %j", data.posts);
      log("Queuing %d post fetches.", data.posts.length);

      this.rem = data.posts.length;
      this.checkRemaining = function(error) {
        if (error) {
          log("Error fetching post details: %s", error);
          return this.done(error);
        }

        this.rem -= 1;
        if (this.rem <= 0) {
          log("Finished fetching posts!");
          this.done();
        } else {
          log("Remaining posts: %d", this.rem);
        }
      }.bind(this);

      for (var i=0; i < data.posts.length; i++) {
        streamPostToFiles(this.httpConfig, data.posts[i].id, this.files, this.metalsmith, this.checkRemaining);
      }
    }.bind(context));
  }.bind(null, defaults);
}
