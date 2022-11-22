importScripts('../env.js');
importScripts('../resources/scripts/console.js');
importScripts('./contextMenu.js');
var inspectList = "inspectList" , inspectStatus = "inspectStatus", inspectingTab = "inspectingTab";

chrome?.storage?.local.get(["inspectStatus"],(result)=>{
  if(result?.inspectStatus)
  {
    chrome?.storage?.local.set({inspectStatus: result?.inspectStatus}, ()=> { }); 
  }
  else
  {
    chrome?.storage?.local.set({inspectStatus: 'stop'},() => {});
  }

})

chrome?.storage?.local.get(["inspectList"],(result)=>{
  
  if(result?.inspectList)
  {
    chrome?.storage?.local.set({inspectList: result?.inspectList}, ()=> {});
  }
  else
  {
    chrome?.storage?.local.set({inspectList: []}, ()=> {});
  }  
})

chrome?.storage?.local.get(["inspectingTab"],(result)=>{
  if(result?.inspectingTab)
  {
    chrome?.storage?.local.set({inspectingTab: result?.inspectingTab}, ()=> {}); 
  }
  else
  {
    chrome?.storage?.local.set({inspectingTab: null}, ()=> {});
  }

})

chrome?.storage?.local.get(['step'],(result)=>{
  if(result?.step)
  {
    chrome?.storage?.local.set({'step': result?.step}, ()=> {}); 
  }
  else
  {
    chrome?.storage?.local.set({'step': '1'}, ()=> {});
  }

})

/**
 * Send message to start Inspection
 * @param {*} url Its a web address
 */
function start(url) {
  printLog('group', `BACKGROUND RECEIVED START INSPECTING`);
  chrome?.storage?.local.get(["inspectList"],(result)=>{
    if(result?.inspectList)
    {
      chrome?.storage?.local.set({inspectList: result?.inspectList}, ()=> {});
    }
    else
    {
      chrome?.storage?.local.set({inspectList: []}, ()=> {});
    }  
  })
  
  chrome.storage.local.set({inspectStatus: 'start'}, ()=> {});
  createOpenURLEntry(url);
  sendRunTimeMessage({action: 'start', startStep: 1})
}

/**
 * Send message to stop inspection
 */
function stop() {
  printLog('groupend', `BACKGROUND RECEIVED STOP INSPECTING`);
  chrome.storage.local.set({inspectStatus: 'stop'}, ()=> {});
  step = 1;
  inspectingTab = null;
  sendRunTimeMessage({action: 'stop'})
  updateBadge();
}

// /**
//  * Send message to pause inspection
//  */
function pause() {
  printLog( `BACKGROUND RECEIVED PAUSE INSPECTING`);
  inspectStatus = 'paused';
  chrome.storage.local.set({inspectStatus: 'paused'}, ()=> {});
  sendRunTimeMessage({action: 'paused'})
  updateBadge();
}

// /**
//  * clear inspected list
//  */
function clear() {
  chrome?.storage?.local.set({inspectList: []}, ()=> {});
  updateBadge();
}

// /**
//  * add and remove badge from extension icon
//  */
function updateBadge() {
  chrome.storage.local.get(["inspectStatus"],(result)=>{ 
    let inspectStatus = result?.inspectStatus;
    chrome.storage.local.get(["inspectingTab"],(result2)=>{ 
      let inspectingTab = result2.inspectingTab ? result2.inspectingTab : null;
      if (inspectStatus === 'start' && inspectingTab) {
        chrome.action.setBadgeBackgroundColor({ color: 'red' });
        chrome.action.setBadgeText({ tabId: inspectingTab.tabId, text: ' ' });
      } else {
        chrome.action.setBadgeText({ tabId: (inspectingTab? inspectingTab.tabId : null), text: '' });
      }

    });  

  });
  

}

// /**
//  * add open url inspection in inspectElementList
//  * @param {*} url Its a web address
//  */
function loadListener(url) {
  printLog( 'CREATE OPEN URL ENTRY');
  chrome?.storage?.local.get(["inspectList"],(result1)=>{
    let inspectElementList;
    let step;
    inspectElementList = result1?.inspectList;
    chrome?.storage?.local.get(['step'],(result2)=>{
      step = result2?.step;
      inspectElementList.push({step: step, command: 'open(url)', param: {url: url}, actions: ''});
      chrome?.storage?.local.set({inspectList: inspectElementList}, ()=> {});
      
    })    
  })
}

/**
 * Open new tab if url exits and record inspecting tab
 * @param {*} url Its a web address
 */
function createOpenURLEntry(url) {
  
  if (url) {
    chrome.tabs.create({"url": url}, function (tab) {
      printLog('OPEN NEW PAGE')
      chrome?.storage?.local.set({inspectingTab: JSON.parse(JSON.stringify(tab))}, ()=>{})
      printLog( inspectingTab)
      updateBadge();
      loadListener(url);
    });
  } else {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      
      if (!tabs || tabs.length < 1) return;
      printLog('CURRENT PAGE')
       inspectingTab = JSON.parse(JSON.stringify(tabs[0]));
      chrome?.storage?.local.set({inspectingTab: inspectingTab},  ()=>{})
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
  chrome.tabs.query({ active: !0, currentWindow: !0 }, (tabs)=> {
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
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
          file: [scripts[i]]
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
      currenttabs = getCurrentTab();
      let j = 0, t = currenttabs.length, currentWindowTab;
      for( ; j < t; j++ ) {
        currentWindowTab = currenttabs[j];
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
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=> {
  
  chrome.storage.local.get(["inspectStatus"],(result1)=>{ 
    inspectStatus = result1?.inspectStatus;
    chrome.storage.local.get(['step'],(result2)=>{ 
      step = result2?.step;
      if (inspectStatus === 'start' && changeInfo.status === 'complete') {
        sendRunTimeMessage({action: inspectStatus, startStep: step});
        updateBadge();
      }
      
    })
  })
})

/**
 * Chrome Extension Api for more help https://developer.chrome.com/docs/extensions/reference/runtime/
 */
chrome.runtime.onMessage.addListener(function (action) {
  switch (action.cmd) {
    case 'inspecting': {
      step = action.value.step;
      
      chrome.storage.local.get(["inspectList"],function(result){
        console.log(result);
        if(result?.inspectList != undefined)
        {
          inspectElementList = result?.inspectList;              
        }
        
        inspectElementList.push(action.value);
        chrome.storage.local.set({inspectList:inspectElementList}, ()=> {});
        
      })   
      break;
    }
    case 'console':
      printLog(action.type, action.msg, action.data);
      break;
  }
  updateBadge();
  
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
  
  if (request?.callMethod == "start"){
    start();
  }
 
  if (request?.callMethod == "stop"){
    stop();
  }

  if (request?.callMethod == "clear"){
    clear();
  }
  
  if (request?.callMethod == "pause"){
    pause();
  }
})

