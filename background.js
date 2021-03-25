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
    if(/^https:\/\/www\.google/.test(current_tab_info.url)) {
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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log('chrome.tabs.onUpdated - is_inspecting  =  ', is_inspecting)
  if (is_inspecting === 'start' && changeInfo.status === 'complete') {
    // console.log('LOAD executeScript: eventRecorder')
    chrome.tabs.executeScript(null, {
      file: '/activityTracker/eventRecorder.js'
    }, () => chrome.runtime.lastError);
  }
})

function loadListener(url) {
  inspectElementList.push({
    step: 0,
    command: 'openURl',
    target: '',
    input: url,
    Actions: ''
  });
  // console.log('first entry : ', inspectElementList)
  // console.log('LOAD executeScript: eventRecorder')
  chrome.tabs.executeScript(null, {file: '/activityTracker/eventRecorder.js'},
  function(result) {
    // Process |result| here (or maybe do nothing at all).
    // console.log('execute script : ', result)
  });
}

function createOpenURLEntry(url) {
  if(url) {
    chrome.tabs.create({"url": url}, function (tab) {
      // console.log('given url is open', url)
      loadListener(url)
    });
  } else loadListener(currentTab);
}

chrome.runtime.onMessage.addListener(function(action, sender, sendResponse) {

  //Todo : Change to switch case
  // console.log('recive command  ', action)
  if (action.cmd === 'start_inspecting') {
    inspectElementList = [];
    is_inspecting = 'start';
    createOpenURLEntry(action.value);
    sendResponse({msg: 'start inspecting'});
    // console.log('start and now inspecting response send')
  }  else if(action.cmd === "stop_inspecting") {

    is_inspecting = 'stop';
    sendResponse({json: inspectElementList});
  } else if(action.cmd === 'inspecting') {

    inspectElementList.push(action.value)
  } else if (action.cmd === 'inspect_status') {

    sendResponse({res: is_inspecting, json: inspectElementList});
  } else if(action.cmd === 'pause_inspecting') {
    is_inspecting = 'paused';
  }
});

