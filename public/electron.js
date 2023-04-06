"use strict";

const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const url = require("url");

// Keep a global reference of the mainWindowdow object, if you don't, the mainWindowdow will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let subpy = null;

const PY_DIST_FOLDER = ""; // python distributable folder
const PY_SRC_FOLDER = "server"; // path to the python source
const PY_MODULE = "start.py"; // the name of the main module
const PY_EXE = "flask_api.exe"; // the pyinstaller created exe location

const getPythonScriptPath = () => {
  if (!app.isPackaged) {
    console.log("----------- DEV RUNNING ----------");
    return path.join(__dirname, PY_MODULE).replace('public', PY_SRC_FOLDER);
  }
  if (process.platform === "win32") {
    console.log("----------- PACKAGED WIN32 RUNNING ----------");
    return path.join(
      __dirname,
      PY_EXE + " --cwd .\\resources\\app"
    ).replace('build', PY_DIST_FOLDER);
  }
  console.log("----------- PACKAGED  RUNNING ----------");
  return path.join(__dirname, PY_MODULE).replace('build\\', PY_DIST_FOLDER);
};

const startPythonSubprocess = () => {
  let script = getPythonScriptPath();
  
  console.log("----------- PYTHON SCRIPT/EXE ----------");
	console.log("RUN:" + script);
	console.log("------------------------------------");

  if (app.isPackaged) {
    subpy = require("child_process").exec(
			script,
			{
				windowsHide: true,
		 	},
			(err, stdout, stderr) => {
				if (err) {
					console.log(err);
				}
				if (stdout) {
					console.log(stdout);
				}
				if (stderr) {
					console.log(stderr);
				}
			}
		);
  } else {
    if (process.platform === "win32") {
      subpy = require("child_process").spawn("python", [script]);
    }
    else {
      subpy = require("child_process").spawn("python3", [script]);
    }

		subpy.stdout.on('data', function (data) {
			console.log("data: ", data.toString('utf8'));
		});

		subpy.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`); // when error
		});
  }
};

const killPythonSubprocesses = main_pid => {
  const python_script_name = path.basename(getPythonScriptPath());
  let cleanup_completed = false;

  if (process.platform === "win32") {
    if (subpy != null) {
      process.kill(subpy.pid);
      cleanup_completed = true;

      console.log("----------- KILLED PYTHON SUB PROCESS ----------");
      console.log(subpy.pid);
      console.log("------------------------------------");
    }
  }
  else {
    const psTree = require("ps-tree");

    psTree(main_pid, function(err, children) {
      let python_pids = children
        .filter(function(el) {
          return el.COMMAND == python_script_name;
        })
        .map(function(p) {
          return p.PID;
        });
      // kill all the spawned python processes
      python_pids.forEach(function(pid) {
        process.kill(pid);
      });
      subpy = null;
      cleanup_completed = true;

      console.log("----------- KILL PYTHON SUB PROCESS ----------");
      console.log(subpy.pid);
      console.log("------------------------------------");
    });
  }

  return new Promise(function(resolve, reject) {
    (function waitForSubProcessCleanup() {
      if (cleanup_completed) return resolve();
      setTimeout(waitForSubProcessCleanup, 30);
    })();
  });
};

const createWindow = () => {

  console.log("----------- START CREATE WINDOW ----------");

  // Create the browser mainWindow
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    icon: __dirname + "/icon.png",
    // Set the path of an additional "preload" script that can be used to
    // communicate between node-land and browser-land.
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    resizeable: true
  });

  // In production, set the initial browser path to the Flask Server
  //  using the dist from by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? "http://localhost:40401"
    : "http://localhost:3000";

    console.log("----------- USE APP URL ----------");
    console.log(appURL);

  console.log("----------- LOAD URL TO MAIN WINDOW ----------");
  mainWindow.loadURL(
    appURL,
    {
      userAgent: 'Chrome',
      webPreferences: {
        javascript: true
      }
    }
  );

  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    console.log("----------- OPEN DEV TOOLS FOR MAIN WINDOW ----------");
    mainWindow.webContents.openDevTools();
  }
  
  // Emitted when the mainWindow is closed.
  mainWindow.on("closed", function() {
    // Dereference the mainWindow object
    console.log("----------- MAIN WINDOW CLOSED ----------");
    mainWindow = null;
  });
};

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizerProxy() {
  protocol.registerHttpProtocol(
    "file",
    (request, callback) => {
      const url = request.url.substr(8);
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    },
    (error) => {
      if (error) console.error("Failed to register protocol");
    }
  );
}

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  process.env['APP_PATH'] = app.getAppPath();
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

  startPythonSubprocess();
  setTimeout(() => { createWindow(); }, 10000)
  setupLocalFilesNormalizerProxy();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
    // start the python sub process if it is not started
    if (subpy == null) {
      console.log("--- >> STARTING PYTHON SUB PROCESS");
      startPythonSubprocess();
    }
  });
});

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    let main_process_pid = process.pid;
    killPythonSubprocesses(main_process_pid).then(() => {
      app.quit();
    });
  }
});

// disable menu
app.on("browser-window-created", function(e, window) {
  window.setMenu(null);
});
