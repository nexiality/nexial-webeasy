var inspectElementList = [];

// fetch current tab url while opening the popup [without tabs permission]
// chrome.tabs.query({active:true,currentWindow:true}, function(tabArray){
//   console.log( 'Current URL ', tabArray[0].url);
// });

function info(title, text) {
  document.getElementById('exampleModalLabel').innerHTML = ''
  document.getElementById('exampleModalLabel').innerHTML = title;
  document.getElementById('modelBody').innerHTML = ''
  document.getElementById('modelBody').innerHTML = text;
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

function copyToNexial() {
  let delim = '\t';
  let script = '';

  for (let i = 0; i < inspectElementList.length; i++) {
    script += 'web' + delim + inspectElementList[i].command + delim;
    for (let parameter in inspectElementList[i].param) {
      const el = document.getElementById(parameter + '_' + inspectElementList[i].step);
      script += (el.value ? el.value : '<MISSING>') + delim
    }
    script += '\n';
  }

  let dummy = document.createElement("textarea");
  dummy.value = script;
  document.body.appendChild(dummy);
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  return false;
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

function start(url) {
  document.getElementById("stopOption").style.display = "block";
  document.getElementById("startOption").style.display = "none";
  document.getElementById("showStatus").style.display = "block";
  document.getElementById("inspectDataOption").style.display = "none";
  if (inspectElementList.length) document.getElementById("showData").style.display = "none";
  chrome.runtime.getBackgroundPage((background) => {
    background.start(url);
  });
}

function stop() {
  document.getElementById("stopOption").style.display = "none";
  document.getElementById("startOption").style.display = "flex";
  document.getElementById("inspectDataOption").style.display = "block";
  document.getElementById("showStatus").style.display = "none";
  if (inspectElementList.length) document.getElementById("showData").style.display = "block";
  chrome.runtime.getBackgroundPage((background) => {
    background.stop();
    // if (background.inspectElementList.length) {
      inspectElementList = background.inspectElementList;
      tableFromJson();
    // }
  });
}

let pauseInspect = document.getElementById("pauseInspect");

function pausedInspect() {
  pauseInspect.classList.toggle("btn-default");
  pauseInspect.classList.toggle("btn-primary");
  pauseInspect.value = 'Resume';
}

pauseInspect.addEventListener("click", function () {
  pauseInspect.classList.toggle("btn-default");
  pauseInspect.classList.toggle("btn-primary");
  if (pauseInspect.value === 'Pause') {
    pauseInspect.value = 'Resume';
    // Messenger.sendInternalMessage({cmd: 'pause_inspecting', value: true});
    chrome.runtime.getBackgroundPage((background) => {
      background.pause();
    });
  } else {
    pauseInspect.value = 'Pause';
    start('');
  }
}, false);

document.getElementById("startInspect").addEventListener("click", function () {
  var url = document.getElementById("url").value;
  if (!validURL(url)) {
    let validFeedback = document.getElementsByClassName('valid-feedback')[0];
    validFeedback.classList.add("d-block");
    document.getElementById("url").value = '';
    return;
  }
  start(url);
  // Messenger.sendInternalMessage({cmd: 'start_inspecting', value: commandValue});
});

document.getElementById("nowInspect").addEventListener("click", function () {
  start('');
  // Messenger.sendInternalMessage({cmd: 'start_inspecting', value: ''});
}, false);

document.getElementById("stopInspect").addEventListener("click", function () {
  stop();
  // Messenger.sendInternalMessage({cmd: 'stop_inspecting', value: false}, function (response) {
  //   Logger.debug(response);
  //   if (response.hasOwnProperty('json')) {
  //     inspectElementList = response.json;
  //     tableFromJson();
  //   }
  // });
});

document.getElementById("showHelp").addEventListener("click", function () {
  if (!chrome || !chrome.tabs) return;
  chrome.tabs.create({url: 'https://nexiality.github.io/documentation/'});
  return false;
}, false);

document.getElementById("maximizePopup").addEventListener("click", async () => {
  let url = chrome.runtime.getURL("NexialWebEZ.html");
  let tab = await chrome.tabs.create({ url });
  console.log(`Created tab ${tab}`);
})

// document.getElementById("maximizePopup").addEventListener("click", function () {
//   if (!chrome || !chrome.windows || !chrome.i18n || !chrome.tabs || !chrome.storage) return;

//   let extensionUrl = "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/NexialWebEZ.html";

//   let targetTabId;
//   chrome.storage.local.get(['maximized_popup_tab_id'], function (result) {
//     targetTabId = !result ? null : result.key;
//   });

//   if (!targetTabId) {
//     // first time, open new tab
//     console.log('new tab');
//     chrome.tabs.create({url: extensionUrl, active: true}, function (tab) {
//       chrome.storage.local.set({'maximized_popup_tab_id': tab.id, 'maximized_popup_window_id': tab.windowId});
//     });

//     return;
//   }

//   let currentWindowIncognito = false;
//   chrome.windows.getCurrent(function (currentWindow) {
//     currentWindowIncognito = currentWindow && currentWindow.incognito;
//   });

//   if (currentWindowIncognito) {
//     let targetWinId;
//     chrome.storage.local.get(['maximized_popup_window_id'], function (result) {
//       targetWinId = !result ? null : result.key;
//     });

//     if (targetWinId) {
//       chrome.windows.get({windowId: targetWinId}, function (win) {
//         if (win && win.tabs) {
//           for (let i = 0; i < win.tabs.length; i++) {
//             let tab = win.tabs[i];
//             if (tab.id === targetTabId) {
//               chrome.tabs.update(targetTabId, {active: true});
//               return;
//             }
//           }
//         }
//       });
//     }
//   }

//   chrome.tabs.update(targetTabId, {active: true});
// }, false);

document.getElementById("closePopup").addEventListener("click", function () {
  window.close();
}, false);

document.getElementById("startInspectInfo").addEventListener("click", function () {
  info('Start Inspect', 'startInspectInfo');
}, false);

document.getElementById("nowInspectInfo").addEventListener("click", function () {
  info('Inspect Now', 'nowInspectInfo');
}, false);

document.getElementById("clearInfo").addEventListener("click", function () {
  info('Clear', 'clearInfo');
}, false);

document.getElementById("copyToNexialInfo").addEventListener("click", function () {
  info('Copy to Nexial', 'copyToNexialInfo');
}, false);

document.getElementById("copyToNexial").addEventListener("click", copyToNexial);

document.getElementById("clear").addEventListener("click", clear);

window.onload = function () {
  console.log("popup loaded");
  chrome.runtime.getBackgroundPage((background) => {
    const inspectStatus = background.inspectstatus;
    if (inspectStatus === 'start') start('');
    else if (inspectStatus === 'paused') pausedInspect();
    else if (inspectStatus === 'stop') {
      inspectElementList = background.inspectElementList;
      if (inspectElementList.length) {
        tableFromJson();
        document.getElementById("inspectDataOption").style.display = "block";
      }
    }
  });
}

// Messenger.sendInternalMessage({cmd: 'inspect_status', value: ''}, function (response) {
//   Logger.debug('inspect_status  =  ', response)
//   if (response.res !== 'stop') {
//     start();
//     if (response.res === 'paused') pausedInspect();
//   } else if (response.hasOwnProperty('json')) {
//     inspectElementList = response.json;
//     if (inspectElementList.length) {
//       tableFromJson();
//       document.getElementById("inspectDataOption").style.display = "block";
//     }
//   }
// });

// chrome.runtime.onMessage.addListener(function(msg) {
//   console.log("message recieved in popup js - " + msg);
//   if (msg.hasOwnProperty('json')) {
//     tableFromJson(msg.json)
//   }
// });
