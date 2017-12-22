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

  var path = host + "/api/status";

  request({ url: path, json: true, headers: { "x-api-key": key } }, function (error, response, body) {
    checkingBuild = false;

    if (error) {
      console.log("error getting status: " + error);
      return;
    }

    if (response.statusCode != 200) {
      console.log("bad status: " + response.statusCode);
      return;
    }

    if (!response.body || !response.body.last_updated_at) {
      console.log("last_updated_at not found: " + response.body);
      return;
    }

    if (response.body.last_updated_at != lastBuildTimestamp) {
      console.log("New timestamp, starting build: " + response.body.last_updated_at);
      runBuild(response.body.last_updated_at);
    }
  });
}

checkBuild();
setInterval(checkBuild, parseInt(process.env.BUILD_CHECK_INTERVAL || 5000));
