console.log('background running');
var is_inspecting = false;
var inspectElementList = [];

chrome.tabs.onActivated.addListener(tab => {
  console.log(tab);
  chrome.tabs.get(tab.tabId, current_tab_info => {
    console.log(current_tab_info.url);
    //match the url with nexial url
    if(/^https:\/\/www\.google/.test(current_tab_info.url)) {
      //toDo
      //add context menu if its nexial to downlad json
      //add button to copy or download json
      //clipbord* (tab) ... save in cookie-, file*(tab space) txt csv
      console.log('Its google page')
      // inject css
      chrome.tabs.insertCSS(null, {file: 'mystyles.css'});
    }
  });
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (is_inspecting) {
    chrome.tabs.executeScript(null, {file: '/activityTracker/eventRecorder.js'})
  }
})

chrome.runtime.onMessage.addListener(function(action, sender, sendResponse) {

  //Todo : Change to switch case
  if (action.cmd === 'start_inspecting') {

    is_inspecting = action.value;
    inspectElementList = [];
    chrome.tabs.executeScript(null, {file: '/activityTracker/eventRecorder.js'});
    sendResponse({msg: 'start user inspecting user action'});
  }  else if(action.cmd === "stop_inspecting") {

    is_inspecting = action.value;
    sendResponse({json: inspectElementList});
  } else if(action.cmd === 'inspecting') {

    inspectElementList.push(action.value)
  } else if (action.cmd === 'inspect_status') {

    sendResponse({res: is_inspecting});
  }
});

