console.log('background running');
var is_inspecting = 'stop';
var inspectElementList = [];
var currentTab = '';

chrome.tabs.onActivated.addListener(tab => {
  // console.log(tab);
  chrome.tabs.get(tab.tabId, current_tab_info => {
    // console.log(current_tab_info.url);
    currentTab = current_tab_info.url;
    //match the url with nexial url
    if (/^https:\/\/www\.google/.test(current_tab_info.url)) {
      //toDo
      //add context menu if its nexial to downlad json
      //add button to copy or download json
      //clipbord* (tab) ... save in cookie-, file*(tab space) txt csv
      // console.log('Its google page')
      // inject css
      // chrome.tabs.insertCSS(null, {file: 'mystyles.css'});
    }
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log('chrome.tabs.onUpdated - is_inspecting  =  ', is_inspecting);
  if (is_inspecting === 'start' && changeInfo.status === 'complete') {
    // console.log('LOAD executeScript: eventRecorder')
    // chrome.tabs.executeScript(null, {file: '/inspection/utils.js'}, () => chrome.runtime.lastError);
    chrome.tabs.executeScript(null, {file: '/inspection/eventInspecting.js'}, () => chrome.runtime.lastError);
  }
})

function loadListener(url) {
  inspectElementList.push({step: 1, command: 'open(url)', param: {url: url}, actions: ''});
  // console.log('first entry : ', inspectElementList)
  // console.log('LOAD executeScript: eventRecorder')
  chrome.tabs.executeScript(null, {file: '/inspection/eventInspecting.js'}, function (result) {
    // Process |result| here (or maybe do nothing at all).
    // console.log('execute script : ', result)
  });
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

chrome.runtime.onMessage.addListener(function (action, sender, sendResponse) {
  switch (action.cmd) {
    case 'start_inspecting': {
      inspectElementList = [];
      is_inspecting = 'start';
      createOpenURLEntry(action.value);
      sendResponse({msg: 'start inspecting'});
      break;
    }
    case 'stop_inspecting': {
      is_inspecting = 'stop';
      sendResponse({json: inspectElementList});
      break;
    }
    case 'inspecting': {
      inspectElementList.push(action.value);
      break;
    }
    case 'inspect_status': {
      sendResponse({res: is_inspecting, json: inspectElementList});
      break;
    }
    case 'pause_inspecting': {
      is_inspecting = 'paused';
      break;
    }
    case 'clear_inspection': {
      inspectElementList = [];
      break;
    }
  }
});
