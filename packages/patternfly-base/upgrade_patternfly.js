const exec = require("child_process").exec;

const UPDATE_PATTERNFLY_COMMAND =
  "yarn add @patternfly/patternfly @patternfly/react-charts @patternfly/react-core @patternfly/react-icons";
const LINK_DEPENDENCIES_COMMAND = "(cd ../../; npx lerna run init)";
const BUILD_PROJECT_COMMAND = "(cd ../../; npx lerna run build:fast)";
const UPDATE_SNAPSHOTS_COMMAND = "(cd ../../; npx lerna run test --stream -- -u)";

async function executeCommand(command) {
  return new Promise((resolve, reject) => {
    const execution = exec(command);

    execution.stdout.pipe(process.stdout);
    execution.stderr.pipe(process.stderr);

    execution.on("close", code => {
      if (code === 0) {
        resolve();
      }
      reject(`child process exited with code ${code}`);
    });
  });
}

function upgradeDependencies() {
  return executeCommand(UPDATE_PATTERNFLY_COMMAND)
    .then(() => executeCommand(LINK_DEPENDENCIES_COMMAND))
    .then(() => executeCommand(BUILD_PROJECT_COMMAND));
}

function upgradeSnapshot() {
  return executeCommand(UPDATE_SNAPSHOTS_COMMAND);
}

function usageExample() {
  console.log("Usage yarn upgrade:patternfly [options]");
  console.log("Options:");
  console.log("-d, --dependencies           Update Patternfly dependencies");
  console.log("-s, --snapshots              Update project test snapshots");
}

function start() {
  if (process.argv.length > 3) {
    console.log("Can't handle more than one argument.");
    usageExample();
    return;
  }

  const [, , argument] = process.argv;

  console.log("Updating...");
  switch (argument) {
    case "-d":
    case "--dependencies": {
      upgradeDependencies()
        .then(() => console.log("Success"))
        .catch(err => console.error("Error", err));
      break;
    }
    case "-s":
    case "--snapshots": {
      upgradeSnapshot()
        .then(() => console.log("Success"))
        .catch(err => console.error("Error", err));
      break;
    }
    case undefined: {
      upgradeDependencies()
        .then(() => upgradeSnapshot())
        .then(() => console.log("Success"))
        .catch(err => console.error("Error", err));
      break;
    }
    default: {
      console.log("Invalid argument.");
      usageExample();
    }
  }
}

start();
