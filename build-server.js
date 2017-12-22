const http = require("http");
const childProcess = require("child_process");
const spawn = childProcess.spawn;

function runBuild(cb) {
  var buildPs = spawn("node", [ "build.js" ]);
  var stdout = "";
  var stderr = "";

  buildPs.stdout.on("data", (data) => {
    stdout += data;
  });

  buildPs.stderr.on("data", (data) => {
    stderr += data;
  });

  buildPs.on("close", (code) => {
    cb(code, stdout, stderr);
  });
}

const server = http.createServer(function(req, res) {
  if ((req.url == "/build" || req.url == "/build/") && req.method == "POST") {
    if (req.headers && req.headers["x-api-key"] == process.env.BUILD_SERVER_API_KEY) {
      runBuild((code, stdout, stderr) => {
        const result = {
          success: code == 0,
          code: code,
          stdout: stdout,
          stderr: stderr
        };
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result));
      });
    } else {
      res.statusCode = 400;
      res.end("Bad request.");
    }
  } else {
    res.statusCode = 404;
    res.end("Not found.");
  }
});

console.log("running initial build...");
runBuild((code, stdout, stderr) => {
  var port = process.env.PORT || 3000;
  if (code != 0) {
    console.log("initial build failed: " + stderr);
  } else {
    console.log("initial build succeeded: " + stdout);
    server.listen(port);
    console.log("listening on port " + port);
  }
});
