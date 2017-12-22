const http = require("http");
const childProcess = require("child_process");
const spawn = childProcess.spawn;

const server = http.createServer(function(req, res) {
  if (req.url == "/build" && req.method == "POST") {
    if (req.headers && req.headers["x-api-key"] == process.env.BUILD_SERVER_API_KEY) {
      const buildPs = spawn("node", [ "build.js" ]);
      var stdout = "";
      var stderr = "";

      buildPs.stdout.on("data", (data) => {
        stdout += data;
      });

      buildPs.stderr.on("data", (data) => {
        stderr += data;
      });

      buildPs.on("close", (code) => {
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

server.listen(process.env.PORT || 3000);
