let inspectElementList = [];
let height = "98px";

function resizePopupWindow() {
  if (window.innerHeight < 150) {
    document.getElementById("nexial-container").style.height = "350px";
  }
}

function openDocLink(url) {
  chrome.runtime.getBackgroundPage((background) => {
    if (background.docTab) {
      chrome.tabs.get(background.docTab.id, () => {
        if (chrome.runtime.lastError) {
          chrome.tabs.create({"url": url}, function (tab) {
            background.docTab = JSON.parse(JSON.stringify(tab));
          });
        } else {
          // Tab exists
          chrome.tabs.update(background.docTab.id, {url: url, 'active': true}, (tab) => { });
        }
      });
    } else {
      chrome.tabs.create({"url": url}, function (tab) {
        background.docTab = JSON.parse(JSON.stringify(tab));
      });
    }
  });
}

function info(title, text) {
  document.getElementById('infoModalLabel').innerHTML = title;
  document.getElementById('infoModelBody').innerHTML = text;
}

function clear() {
  let table = document.getElementById('inspect_table');
  while (table && table.hasChildNodes()) { table.removeChild(table.firstChild); }
  inspectElementList = [];
  // Messenger.sendInternalMessage({cmd: 'clear_inspection', value: ''});
  chrome.runtime.getBackgroundPage((background) => {
    background.clear();
  });
  document.getElementById("inspectDataOption").style.display = "none";
}

function createScript() {
  let delim = '\t';
  let script = '';

  for (let i = 0; i < inspectElementList.length; i++) {
    script += 'web' + delim + inspectElementList[i].command + delim;
    for (let parameter in inspectElementList[i].param) {
      const el = document.getElementById(parameter + '_' + inspectElementList[i].step);
      if (el && el.tagName && el.tagName === 'SELECT') {
        script += (el.selectedOptions ? el.selectedOptions[0].text : el.options[0].text) + delim;
      } else {
        script += (el && el.value ? el.value : '<MISSING>') + delim;
      }
    }
    script += '\n';
  }
  return script;
}

function validURL(myURL) {
  let pattern = new RegExp('^(http(s)?:\/\/.)' + // protocol
                           '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
                           '((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
                           '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + //port
                           '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
                           '(\\#[-a-z\\d_]*)?$', 'i');
  return pattern.test(myURL);
}

function start() {
  // console.log('start')
  document.getElementById("stopOption").style.display = "block";
  document.getElementById("showStatus").style.display = "block";
  document.getElementById("startOption").style.display = "none";
  document.getElementById("showData").style.display = "none";
  document.getElementById("inspectDataOption").style.display = "none";
}

function stop() {
  document.getElementById("startOption").style.display = "flex";
  document.getElementById("showData").style.display = "none";
  document.getElementById("inspectDataOption").style.display = "none";
  document.getElementById("stopOption").style.display = "none";
  document.getElementById("showStatus").style.display = "none";
  chrome.runtime.getBackgroundPage((background) => {
    inspectElementList = background.inspectElementList;
    // console.log('STOP STATUS : ', inspectElementList)
    if (inspectElementList.length) {
      document.getElementById("showData").style.display = "block";
      document.getElementById("inspectDataOption").style.display = "block";
      tableFromJson();
    }
  });
}

function pause() {
  start();
  pauseInspect.value = 'Resume';
}

function setClasses(/*String*/id, /*String*/classes) {
  document.getElementById(id).setAttribute("class", classes);
}

let maximizePopup = document.getElementById("maximizePopup");
let closePopup = document.getElementById("closePopup");
let startInspect = document.getElementById("startInspect");
let nowInspect = document.getElementById("nowInspect");
let pauseInspect = document.getElementById("pauseInspect");
let stopInspect = document.getElementById("stopInspect");
let showHelp = document.getElementById("showHelp");
let copyToNexial = document.getElementById("copyToNexial");
let clearInspection = document.getElementById("clear");

pauseInspect.addEventListener("click", function () {
  pauseInspect.classList.toggle("btn-default");
  pauseInspect.classList.toggle("btn-primary");
  if (pauseInspect.value === 'Pause') {
    pauseInspect.value = 'Resume';
    chrome.runtime.getBackgroundPage((background) => {
      background.pause();
    });
  } else {
    pauseInspect.value = 'Pause';
    start();
    chrome.runtime.getBackgroundPage((background) => {
      background.start();
    });
  }
}, false);

startInspect.addEventListener("click", function () {
  let url = document.getElementById("url").value.trim();
  if (!validURL(url)) {
    let validFeedback = document.getElementsByClassName('valid-feedback')[0];
    validFeedback.classList.add("d-block");
    document.getElementById("url").value = '';
    return;
  }
  start();
  chrome.runtime.getBackgroundPage((background) => {
    background.start(url);
  });
});
startInspect.addEventListener("mouseover", () => setClasses("startInspectInfo", "badge badge-focus"));
startInspect.addEventListener("mouseout", () => setClasses("startInspectInfo", "badge"));

nowInspect.addEventListener("click", function () {
  start();
  chrome.runtime.getBackgroundPage((background) => {
    background.start('');
  });
}, false);
nowInspect.addEventListener("mouseover", () => setClasses("nowInspectInfo", "badge badge-focus"));
nowInspect.addEventListener("mouseout", () => setClasses("nowInspectInfo", "badge"));

stopInspect.addEventListener("click", function () {
  stop();
  chrome.runtime.getBackgroundPage((background) => {
    background.stop();
  });
});

showHelp.addEventListener("click", function () { openDocLink(`${HELP_URL}`); }, false);

maximizePopup.addEventListener("click", async () => {
  await chrome.tabs.create({ url: chrome.runtime.getURL("NexialWebEZ.html") });
})

closePopup.addEventListener("click", function () {
  window.close();
}, false);

copyToNexial.addEventListener("click", function () {
  let dummy = document.body.appendChild(document.createElement("textarea"));
  dummy.value = createScript();
  document.body.appendChild(dummy);
  dummy.focus();
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
}, false);
copyToNexial.addEventListener("mouseover", () => setClasses("copyToNexialInfo", "badge badge-focus"));
copyToNexial.addEventListener("mouseout", () => setClasses("copyToNexialInfo", "badge"));

clearInspection.addEventListener("click", clear);
clearInspection.addEventListener("mouseover", () => setClasses("clearInfo", "badge badge-focus"));
clearInspection.addEventListener("mouseout", () => setClasses("clearInfo", "badge"));


document.getElementById("startInspectInfo").addEventListener("click", function () {
  resizePopupWindow();
  info('Inspect',
       'Enter a valid URL and click on this button to start the WebEZ inspection ' +
       'process on the specified URL . WebEZ will capture and inspect your mouse ' +
       'clicks and keyboard inputs (when interacting with a form). Additionally, ' +
       'you may add waits ' + 'and assertions via the context menu. When you are ' +
       'done interacting with your browser, return back to WebEZ and click on ' +
       '"Stop".' +
       '<div style="text-align: center"><img' +
       ' src="https://nexiality.github.io/documentation/webez/image/inspect.gif"' +
       ' alt="HOWTO: Inspect" style="width:90%;margin:5px 0"/></div>'
  );
}, false);

document.getElementById("nowInspectInfo").addEventListener("click", function () {
  resizePopupWindow();
  info('Inspect Current Page',
       'Click this button to start the WebEZ inspection process on the current ' +
       'web page. WebEZ will capture and inspect your mouse clicks and keyboard ' +
       'inputs (when interacting with a form). Additionally, you may add waits ' +
       'and assertions via the context menu. When you are done interacting with ' +
       'your browser, return back to WebEZ and click on "Stop".' +
       '<div style="text-align: center"><img' +
       ' src="https://nexiality.github.io/documentation/webez/image/inspect-now.gif"' +
       ' alt="HOWTO: Inspect Now" style="width:90%;margin:5px 0"/></div>'
  );
}, false);

document.getElementById("clearInfo").addEventListener("click", function () {
  info('Clear',
       'Use this button to clear away all the captured steps. Please note that ' +
       'there is no Undo for this functionality.'
  );
}, false);

document.getElementById("copyToNexialInfo").addEventListener("click", function () {
  resizePopupWindow();
  info('Copy to Nexial script',
       'Use this button to copy the current steps and commands to clipboard. ' +
       'Open up the test scenario of your choosing, then perform Paste (' +
       '<code>CTRL+v</code> for Windows, <code>COMMAND+v</code> for Mac) on a ' +
       '"cmd type" cell. Edit the copied steps as needed. Be sure to set your ' +
       'browser type via <code>nexial.browser</code> System variable before ' +
       'running the script' +
       '<div style="text-align: center"><img' +
       ' src="https://nexiality.github.io/documentation/webez/image/copy-to-nexial.gif"' +
       ' alt="HOWTO: Copy to Nexial" style="width:90%;margin:5px 0"/></div>'
  );
}, false);


window.onload = function () {
  // console.log("popup loaded");
  chrome.runtime.getBackgroundPage((background) => {
    // console.log(background)
    const inspectStatus = background.inspectStatus;
    // console.log("current status", inspectStatus)
    if (inspectStatus === 'start') start();
    else if (inspectStatus === 'paused') pause();
    else if (inspectStatus === 'stop') stop();
  });
}
