var is_inspecting = 'stop';
var inspectElementList = [];
var currentTab = null;
var inspectingTab = null;
// Add a `manifest` property to the `chrome` object.
chrome.manifest = chrome.app.getDetails();

function updateBadge() {
  if (is_inspecting === 'start') {
    console.log(inspectingTab, "%%%%%%%%%%%%%%%%%%%%%%%")
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
    chrome.browserAction.setBadgeText({ tabId: inspectingTab.tabId, text: ' ' });
  } else  chrome.browserAction.setBadgeText({ tabId: (inspectingTab? inspectingTab.tabId : null), text: '' });
}

function loadListener(url) {
  inspectElementList.push({step: 1, command: 'open(url)', param: {url: url}, actions: ''});
  // chrome.tabs.executeScript(null, {file: '/inspection/eventInspecting.js'}, function (result) {
    // Process |result| here (or maybe do nothing at all).
    // console.log('execute script : ', result)
  // });
}

function createOpenURLEntry(url) {
  if (url) {
    chrome.tabs.create({"url": url}, function (tab) {
      // console.log('given url is open', url)
      inspectingTab['url'] = url;
      loadListener(url)
    });
  } else {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      if (!tabs || tabs.length < 1) return;
      //Todo check on new tab open 
      inspectingTab['url'] = tabs[0].url;
      loadListener(tabs[0].url);
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

chrome.tabs.onActivated.addListener(tab => {
  console.log('onActivated currentTab == ', tab);
  currentTab = tab;
  // chrome.tabs.get(tab.tabId, current_tab_info => {
  //   console.log('current_tab_info ---------- ', current_tab_info.url);
  //   currentTab = current_tab_info.url;
  //   //match the url with nexial url
  //   if (/^https:\/\/www\.google/.test(current_tab_info.url)) {
  //     //toDo
  //     //add context menu if its nexial to downlad json
  //     //add button to copy or download json
  //     //clipbord* (tab) ... save in cookie-, file*(tab space) txt csv
  //     // console.log('Its google page')
  //     // inject css
  //     // chrome.tabs.insertCSS(null, {file: 'mystyles.css'});
  //   }
  // });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log('changeInfo.status = ', changeInfo.status)
  if (is_inspecting === 'start' && changeInfo.status === 'complete') {
    // console.log('chrome.tabs.onUpdated - is_inspecting  =  ', is_inspecting);
    console.log('tabId = ', tabId);
    console.log('onUpdated currentTab == ', currentTab, ' changeInfo = ', changeInfo, ' tab = ', tab)
    // console.log('tab = ', tab);
    // chrome.tabs.executeScript(null, {file: '/inspection/utils.js'}, () => chrome.runtime.lastError);
    // chrome.tabs.executeScript(null, {file: '/inspection/eventInspecting.js'}, () => chrome.runtime.lastError);
  }
})

chrome.runtime.onMessage.addListener(function (action, sender, sendResponse) {
  console.log('current TAb == ', currentTab)
  switch (action.cmd) {
    case 'start_inspecting': {
      inspectElementList = [];
      is_inspecting = 'start';
      inspectingTab = JSON.parse(JSON.stringify(currentTab));
      createOpenURLEntry(action.value);
      sendResponse({msg: 'start inspecting'});
      sendRunTimeMessage({action: 'start'})
      break;
    }
    case 'stop_inspecting': {
      is_inspecting = 'stop';
      sendResponse({json: inspectElementList});
      sendRunTimeMessage({action: 'stop'})
      break;
    }
    case 'inspecting': {
      console.log(action.value)
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
});
