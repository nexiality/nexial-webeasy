var is_inspecting = 'stop';
var inspectElementList = [];
var inspectingTab = null;
var step = 1;
// Add a `manifest` property to the `chrome` object.
chrome.manifest = chrome.app.getDetails();

function updateBadge() {
  if (is_inspecting === 'start' && inspectingTab) {
    console.log(inspectingTab, "%%%%%%%%%%%%%%%%%%%%%%%")
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
    chrome.browserAction.setBadgeText({ tabId: inspectingTab.tabId, text: ' ' });
  } else {
    chrome.browserAction.setBadgeText({ tabId: (inspectingTab? inspectingTab.tabId : null), text: '' });
  }
}

function loadListener(url) {
  inspectElementList.push({step: step, command: 'open(url)', param: {url: url}, actions: ''});
  // chrome.tabs.executeScript(null, {file: '/inspection/eventInspecting.js'}, function (result) {
    // Process |result| here (or maybe do nothing at all).
    // console.log('execute script : ', result)
  // });
}

function createOpenURLEntry(url) {
  if (url) {
    chrome.tabs.create({"url": url}, function (tab) {
      // console.log('given url is open', url)
      inspectingTab = JSON.parse(JSON.stringify(tab));
      updateBadge();
      loadListener(url);
    });
  } else {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      if (!tabs || tabs.length < 1) return;
      inspectingTab = JSON.parse(JSON.stringify(tabs[0]));
      loadListener(inspectingTab.url);
      updateBadge();
    });
  }
}

function sendRunTimeMessage(message) {
  chrome.tabs.query({ active: !0, currentWindow: !0 }, function (tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    }
  });
}

var injectIntoTab = function (tab) {
  // You could iterate through the content scripts here
  var scripts = chrome.manifest.content_scripts[0].js;
  var i = 0, s = scripts.length;
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
  var i = 0, w = windows.length, currentWindow;
  for( ; i < w; i++ ) {
      currentWindow = windows[i];
      var j = 0, t = currentWindow.tabs.length, currentWindowTab;
      for( ; j < t; j++ ) {
        currentWindowTab = currentWindow.tabs[j];
          // console.log('CURRENT TAB ==== ', currentWindowTab)
          // console.log('CURRENT TAB URL ==== ', currentWindowTab.url)
          // Skip chrome:// and https:// pages
          if( currentWindowTab.url && ! currentWindowTab.url.match(/(chrome|https):\/\//gi) ) {
              injectIntoTab(currentWindowTab);
          }
      }
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log('changeInfo.status = ', changeInfo.status)
  if (is_inspecting === 'start' && changeInfo.status === 'complete') {
    // console.log('chrome.tabs.onUpdated - is_inspecting  =  ', is_inspecting);
    sendRunTimeMessage({action: 'start', startStep: step});
    updateBadge();
    console.log('tabId = ', tabId);
    console.log(' changeInfo = ', changeInfo, ' tab = ', tab)
    // console.log('tab = ', tab);
    // chrome.tabs.executeScript(null, {file: '/inspection/utils.js'}, () => chrome.runtime.lastError);
    // chrome.tabs.executeScript(null, {file: '/inspection/eventInspecting.js'}, () => chrome.runtime.lastError);
  }
})

chrome.runtime.onMessage.addListener(function (action, sender, sendResponse) {

  switch (action.cmd) {
    case 'start_inspecting': {
      inspectElementList = [];
      is_inspecting = 'start';
      createOpenURLEntry(action.value);
      sendRunTimeMessage({action: 'start', startStep: step})
      break;
    }
    case 'stop_inspecting': {
      is_inspecting = 'stop';
      step = 1;
      inspectingTab = null;
      sendResponse({json: inspectElementList});
      sendRunTimeMessage({action: 'stop'})
      break;
    }
    case 'inspecting': {
      console.log(action.cmd, action.value)
      step = action.value.step;
      inspectElementList.push(action.value);
      break;
    }
    case 'inspect_status': {
      sendResponse({res: is_inspecting, json: inspectElementList});
      break;
    }
    case 'pause_inspecting': {
      is_inspecting = 'paused';
      sendRunTimeMessage({action: 'paused'})
      break;
    }
    case 'clear_inspection': {
      inspectElementList = [];
      break;
    }
  }
  updateBadge();
  return true;
});
