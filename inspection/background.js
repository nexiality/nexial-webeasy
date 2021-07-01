let inspectStatus = 'stop';
let inspectElementList = [];
let inspectingTab = null;
let step = 1;
// Add a `manifest` property to the `chrome` object.
chrome.manifest = chrome.app.getDetails();

function start(url) {
  printLog('group', `BACKGROUND RECEIVED START INSPECTING`);
  inspectElementList = [];
  inspectStatus = 'start';
  createOpenURLEntry(url);
  sendRunTimeMessage({action: 'start', startStep: step})
}

function stop() {
  printLog('groupend', `BACKGROUND RECEIVED STOP INSPECTING`);
  inspectStatus = 'stop';
  step = 1;
  inspectingTab = null;
  // sendResponse({json: inspectElementList});
  sendRunTimeMessage({action: 'stop'})
  updateBadge();
}

function pause() {
  printLog( `BACKGROUND RECEIVED PAUSE INSPECTING`);
  inspectStatus = 'paused';
  sendRunTimeMessage({action: 'paused'})
  updateBadge();
}

function clear() {
  inspectElementList = [];
  updateBadge();
}

function updateBadge() {
  if (inspectStatus === 'start' && inspectingTab) {
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
    chrome.browserAction.setBadgeText({ tabId: inspectingTab.tabId, text: ' ' });
  } else {
    chrome.browserAction.setBadgeText({ tabId: (inspectingTab? inspectingTab.tabId : null), text: '' });
  }
}

function loadListener(url) {
  printLog( 'CREATE OPEN URL ENTRY');
  inspectElementList.push({step: step, command: 'open(url)', param: {url: url}, actions: ''});
  // chrome.tabs.executeScript(null, {file: '/inspection/eventInspecting.js'}, function (result) {
    // Process |result| here (or maybe do nothing at all).
  // });
}

function createOpenURLEntry(url) {
  if (url) {
    chrome.tabs.create({"url": url}, function (tab) {
      printLog('OPEN NEW PAGE')
      inspectingTab = JSON.parse(JSON.stringify(tab));
      printLog( inspectingTab)
      updateBadge();
      loadListener(url);
    });
  } else {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      if (!tabs || tabs.length < 1) return;
      printLog('CURRENT PAGE')
      inspectingTab = JSON.parse(JSON.stringify(tabs[0]));
      printLog( inspectingTab)
      loadListener(inspectingTab.url);
      updateBadge();
    });
  }
}

function sendRunTimeMessage(message) {
  console.log(' SEND  MESSAGE - ', message )
  chrome.tabs.query({ active: !0, currentWindow: !0 }, function (tabs) {
    console.log('tab ', tabs[0])
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    }
  });
}

let injectIntoTab = function (tab) {
  // You could iterate through the content scripts here
  let scripts = chrome.manifest.content_scripts[0].js;
  let i = 0, s = scripts.length;
  for( ; i < s; i++ ) {
      chrome.tabs.executeScript(tab.id, {
          file: scripts[i]
      });
  }
}

// Get all windows
chrome.windows.getAll({
  populate: true
}, function (windows) {
  let i = 0, w = windows.length, currentWindow;
  for( ; i < w; i++ ) {
      currentWindow = windows[i];
      let j = 0, t = currentWindow.tabs.length, currentWindowTab;
      for( ; j < t; j++ ) {
        currentWindowTab = currentWindow.tabs[j];
          // Skip chrome:// and https:// pages
          if( currentWindowTab.url && ! currentWindowTab.url.match(/(chrome|https):\/\//gi) ) {
              injectIntoTab(currentWindowTab);
          }
      }
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (inspectStatus === 'start' && changeInfo.status === 'complete') {
    sendRunTimeMessage({action: 'start', startStep: step});
    updateBadge();
    // chrome.tabs.executeScript(null, {file: '/inspection/utils.js'}, () => chrome.runtime.lastError);
    // chrome.tabs.executeScript(null, {file: '/inspection/eventInspecting.js'}, () => chrome.runtime.lastError);
  }
})

chrome.runtime.onMessage.addListener(function (action) {

  switch (action.cmd) {
    // case 'start_inspecting': {
    //   printLog('group', `BACKGROUND RECEIVED START INSPECTING`);
    //   inspectElementList = [];
    //   inspectStatus = 'start';
    //   createOpenURLEntry(action.value);
    //   sendRunTimeMessage({action: 'start', startStep: step})
    //   break;
    // }
    // case 'stop_inspecting': {
    //   inspectStatus = 'stop';
    //   step = 1;
    //   inspectingTab = null;
    //   // sendResponse({json: inspectElementList});
    //   sendRunTimeMessage({action: 'stop'})
    //   break;
    // }
    case 'inspecting': {
      step = action.value.step;
      inspectElementList.push(action.value);
      break;
    }
    // case 'inspect_status': {
    //   // sendResponse({res: inspectStatus, json: inspectElementList});
    //   break;
    // }
    // case 'pause_inspecting': {
    //   inspectStatus = 'paused';
    //   sendRunTimeMessage({action: 'paused'})
    //   break;
    // }
    // case 'clear_inspection': {
    //   inspectElementList = [];
    //   break;
    // }
    case 'console':
      printLog(action.type, action.msg, action.data);
      break;
  }
  updateBadge();
});

window.inspectStatus = inspectStatus;
window.inspectElementList = inspectElementList;
