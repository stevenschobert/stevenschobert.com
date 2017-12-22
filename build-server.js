require("dotenv").config();

const http = require("http");
const childProcess = require("child_process");
const request = require("request");
const spawn = childProcess.spawn;

var runningBuild = false;
var checkingBuild = false;
var lastBuildTimestamp = null;

function runBuild(buildTimestamp) {
  if (runningBuild) { return; }

  runningBuild = true;

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
    runningBuild = false;
    console.log("build finished, exit code: " + code);

    if (code == 0) {
      lastBuildTimestamp = buildTimestamp;
    }
  });
}

function checkBuild() {
  if (checkingBuild) { return; }

  checkingBuild = true;

  var host = process.env.INKPLATE_HOST;
  var key = process.env.INKPLATE_API_KEY;

  var path = host + "/api/status?api_key=" + key;

  request(path, function (error, response, body) {
    checkingBuild = false;

    if (error) {
      console.log("error getting status: " + error);
      return;
    }

    if (response.statusCode != 200) {
      console.log("bad status: " + response.statusCode);
      return;
    }

    if (!response.body) {
      console.log("missing response body: " + response.body);
      return;
    }

    var body = null;
    try {
      body = JSON.parse(response.body);
    } catch(error) {
      console.log("error parsing body: " + error);
    }

    if (!body || !body.last_updated_at) {
      console.log("last_updated_at not found: " + body);
    }

    if (body.last_updated_at != lastBuildTimestamp) {
      console.log("New timestamp, starting build: " + body.last_updated_at);
      runBuild(body.last_updated_at);
    }
  });
}

checkBuild();
setInterval(checkBuild, parseInt(process.env.BUILD_CHECK_INTERVAL || 5000));
