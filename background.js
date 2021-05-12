var is_inspecting = 'stop';
var inspectElementList = [];
var currentTab = '';
// Add a `manifest` property to the `chrome` object.
chrome.manifest = chrome.app.getDetails();

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
      loadListener(url)
    });
  } else {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      if (!tabs || tabs.length < 1) return;
      currentTab = tabs[0].url;
      loadListener(currentTab);
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
      var j = 0, t = currentWindow.tabs.length, currentTab;
      for( ; j < t; j++ ) {
          currentTab = currentWindow.tabs[j];
          // Skip chrome:// and https:// pages
          if( ! currentTab.url.match(/(chrome|https):\/\//gi) ) {
              injectIntoTab(currentTab);
          }
      }
  }
});

// chrome.tabs.onActivated.addListener(tab => {
//   // console.log(tab);
//   chrome.tabs.get(tab.tabId, current_tab_info => {
//     // console.log(current_tab_info.url);
//     currentTab = current_tab_info.url;
//     //match the url with nexial url
//     if (/^https:\/\/www\.google/.test(current_tab_info.url)) {
//       //toDo
//       //add context menu if its nexial to downlad json
//       //add button to copy or download json
//       //clipbord* (tab) ... save in cookie-, file*(tab space) txt csv
//       // console.log('Its google page')
//       // inject css
//       // chrome.tabs.insertCSS(null, {file: 'mystyles.css'});
//     }
//   });
// });

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log('changeInfo.status = ', changeInfo.status)
  if (is_inspecting === 'start' && changeInfo.status === 'complete') {
    console.log('chrome.tabs.onUpdated - is_inspecting  =  ', is_inspecting);
    console.log('tabId = ', tabId);
    console.log('tab = ', tab);
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
});
