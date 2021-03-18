console.log('background running');
var is_inspecting = false;
var inspectElementList = [];
var currentTab = '';

chrome.tabs.onActivated.addListener(tab => {
  console.log(tab);
  chrome.tabs.get(tab.tabId, current_tab_info => {
    console.log(current_tab_info.url);
    currentTab = current_tab_info.url;
    //match the url with nexial url
    if(/^https:\/\/www\.google/.test(current_tab_info.url)) {
      //toDo
      //add context menu if its nexial to downlad json
      //add button to copy or download json
      //clipbord* (tab) ... save in cookie-, file*(tab space) txt csv
      console.log('Its google page')
      // inject css
      // chrome.tabs.insertCSS(null, {file: 'mystyles.css'});
    }
  });
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (is_inspecting) {
    chrome.tabs.executeScript(null, {file: '/activityTracker/eventRecorder.js'})
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
  chrome.tabs.executeScript(null, {file: '/activityTracker/eventRecorder.js'});
}

function createOpenURLEntry(url) {
  if(url) {
    chrome.tabs.create({"url": url}, function (tab) {
      console.log('given url is open')
      loadListener(url)
    });
  } else loadListener(currentTab);
}

chrome.runtime.onMessage.addListener(function(action, sender, sendResponse) {

  //Todo : Change to switch case
  console.log(action)
  if (action.cmd === 'start_inspecting') {
    inspectElementList = [];
    is_inspecting = true;
    createOpenURLEntry(action.value);
    sendResponse({msg: 'start inspecting'});
  }  else if(action.cmd === "stop_inspecting") {

    is_inspecting = action.value;
    sendResponse({json: inspectElementList});
  } else if(action.cmd === 'inspecting') {

    inspectElementList.push(action.value)
  } else if (action.cmd === 'inspect_status') {

    sendResponse({res: is_inspecting, json: inspectElementList});
  }
});

