window.inspectStatus = 'stop';
window.inspectElementList = [];
let inspectingTab = null, docTab = null;
let step = 1;
// Add a `manifest` property to the `chrome` object.
chrome.manifest = chrome.app.getDetails();

/**
 * Send message to start Inspection
 * @param {*} url Its a web address
 */
function start(url) {
  printLog('group', `BACKGROUND RECEIVED START INSPECTING`);
  window.inspectElementList = [];
  window.inspectStatus = 'start';
  createOpenURLEntry(url);
  sendRunTimeMessage({action: window.inspectStatus, startStep: step})
}

/**
 * Send message to stop inspection
 */
function stop() {
  printLog('groupend', `BACKGROUND RECEIVED STOP INSPECTING`);
  window.inspectStatus = 'stop';
  step = 1;
  inspectingTab = null;
  sendRunTimeMessage({action: 'stop'})
  updateBadge();
}

/**
 * Send message to pause inspection
 */
function pause() {
  printLog( `BACKGROUND RECEIVED PAUSE INSPECTING`);
  window.inspectStatus = 'paused';
  sendRunTimeMessage({action: 'paused'})
  updateBadge();
}

/**
 * clear inspected list
 */
function clear() {
  window.inspectElementList = [];
  updateBadge();
}

/**
 * add and remove badge from extension icon
 */
function updateBadge() {
  if (window.inspectStatus === 'start' && inspectingTab) {
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
    chrome.browserAction.setBadgeText({ tabId: inspectingTab.tabId, text: ' ' });
  } else {
    chrome.browserAction.setBadgeText({ tabId: (inspectingTab? inspectingTab.tabId : null), text: '' });
  }
}

/**
 * add open url inspection in inspectElementList
 * @param {*} url Its a web address
 */
function loadListener(url) {
  printLog( 'CREATE OPEN URL ENTRY');
  window.inspectElementList.push({step: step, command: 'open(url)', param: {url: url}, actions: ''});
}

/**
 * Open new tab if url exits and record inspecting tab
 * @param {*} url Its a web address
 */
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

/**
 * Used to communicated
 * @param {*} message its a data that we want to pass
 */
function sendRunTimeMessage(message) {
  // console.log(' SEND  MESSAGE - ', message )
  chrome.tabs.query({ active: !0, currentWindow: !0 }, function (tabs) {
    // console.log('tab ', tabs[0])
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    }
  });
}

/**
 * fetch and return current active tab
 * @returns current tab
 */
async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

/**
 * Chrome Extension Api for more help https://developer.chrome.com/docs/extensions/mv3/content_scripts/
 */
let injectIntoTab = function (tab) {
  let scripts = chrome.manifest.content_scripts[0].js;
  let i = 0, s = scripts.length;
  for( ; i < s; i++ ) {
      chrome.tabs.executeScript(tab.id, {
          file: scripts[i]
      });
  }
}

// Get all windows
/**
 * Chrome Extension Api for more help https://developer.chrome.com/docs/extensions/reference/windows/
 */
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

/**
 * Chrome Extension Api for more help https://developer.chrome.com/docs/extensions/reference/tabs/
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (window.inspectStatus === 'start' && changeInfo.status === 'complete') {
    sendRunTimeMessage({action: window.inspectStatus, startStep: step});
    updateBadge();
  }
})

/**
 * Chrome Extension Api for more help https://developer.chrome.com/docs/extensions/reference/runtime/
 */
chrome.runtime.onMessage.addListener(function (action) {

  switch (action.cmd) {
    case 'inspecting': {
      step = action.value.step;
      window.inspectElementList.push(action.value);
      break;
    }
    case 'console':
      printLog(action.type, action.msg, action.data);
      break;
  }
  updateBadge();
});
