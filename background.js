importScripts('env.js');
importScripts('resources/scripts/console.js');
importScripts('inspection/contextMenu.js');



chrome?.storage?.local.get(['inspectStatus'],(result)=>{
  
  if(result?.inspectStatus)
  {
    chrome?.storage?.local.set({'inspectStatus': result?.inspectStatus}, function() {
      
    }); 
  }
  else
  {
    chrome?.storage?.local.set({'inspectStatus': 'stop'}, function() {
      
    });
  }

})

chrome?.storage?.local.get(['inspectList'],(result)=>{
  // console.log(result);
  if(result?.inspectList)
  {
    chrome?.storage?.local.set({'inspectList': result?.inspectList}, function() {
        
    });
  }
  else
  {
    chrome?.storage?.local.set({'inspectList': []}, function() {
      
    });
  }  
})

chrome?.storage?.local.get(['inspectingTab'],(result)=>{
  // console.log(result);
  if(result?.inspectingTab)
  {
    chrome?.storage?.local.set({'inspectingTab': result?.inspectingTab}, function() {
      
    }); 
  }
  else
  {
    chrome?.storage?.local.set({'inspectingTab': null}, function() {
      
    });
  }

})

chrome?.storage?.local.get(['step'],(result)=>{
  // console.log(result);
  if(result?.step)
  {
    chrome?.storage?.local.set({'step': result?.step}, function() {
      
    }); 
  }
  else
  {
    chrome?.storage?.local.set({'step': '1'}, function() {
      
    });
  }

})

/**
 * Send message to start Inspection
 * @param {*} url Its a web address
 */
function start(url) {
  printLog('group', `BACKGROUND RECEIVED START INSPECTING`);
  let inspectStatus = 'start';
  let step = 1;
  chrome.storage.local.set({'inspectList': []}, function() {
    
  });
  
  chrome.storage.local.set({'inspectStatus': 'start'}, function() {
    
  });
  createOpenURLEntry(url);
  sendRunTimeMessage({action: inspectStatus, startStep: step})
}

/**
 * Send message to stop inspection
 */
function stop() {
  printLog('groupend', `BACKGROUND RECEIVED STOP INSPECTING`);
  inspectStatus = 'stop';
  chrome.storage.local.set({'inspectStatus': 'stop'}, function() {
    
  });
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
  chrome.storage.local.set({'inspectStatus': 'paused'}, function() {
    
  });
  sendRunTimeMessage({action: 'paused'})
  updateBadge();
}

// /**
//  * clear inspected list
//  */
function clear() {
  chrome?.storage?.local.set({'inspectList': []}, function() {
      
  });
  updateBadge();
}

// /**
//  * add and remove badge from extension icon
//  */
function updateBadge() {
  let inspectStatus;
  chrome.storage.local.get(['inspectStatus'],(result)=>{ 
    inspectStatus = result?.inspectStatus;
    chrome.storage.local.get(['inspectingTab'],(result2)=>{ 
      inspectingTab = result2.inspectingTab ? result2.inspectingTab : null;
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
  // inspectElementList.push({step: step, command: 'open(url)', param: {url: url}, actions: ''});
  let inspectElementList;
  let step;
  chrome?.storage?.local.get(['inspectList'],(result1)=>{
    
    inspectElementList = result1?.inspectList;
    chrome?.storage?.local.get(['step'],(result2)=>{
      step = result2?.step;
      inspectElementList.push({step: step, command: 'open(url)', param: {url: url}, actions: ''});
      chrome?.storage?.local.set({'inspectList': inspectElementList}, function() {
          
      });
      
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
      chrome?.storage?.local.set({'inspectingTab': JSON.parse(JSON.stringify(tab))}, function() {
      
      }); 
      // inspectingTab = JSON.parse(JSON.stringify(tab));
      printLog( inspectingTab)
      updateBadge();
      loadListener(url);
    });
  } else {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      
      if (!tabs || tabs.length < 1) return;
      printLog('CURRENT PAGE')
       inspectingTab = JSON.parse(JSON.stringify(tabs[0]));
      chrome?.storage?.local.set({'inspectingTab': inspectingTab}, function() {
      
      }); 
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
      // chrome.runtime.sendMessage({tabs : tabs[0].id, message : message}, (response)=> {
      // });
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
  
  chrome.storage.local.get(['inspectStatus'],(result1)=>{ 
    inspectStatus = result1?.inspectStatus;
    chrome.storage.local.get(['step'],(result2)=>{ 
      step = result2?.step;
      if (inspectStatus === 'start' && changeInfo.status === 'complete') {
        sendRunTimeMessage({action: inspectStatus, startStep: step});
        updateBadge();
      }
      // return true;
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
      
      chrome.storage.local.get(['inspectList'],function(result){
        console.log(result);
        if(result?.inspectList != undefined)
        {
          inspectElementList = result?.inspectList;              
        }
        
        inspectElementList.push(action.value);
        chrome.storage.local.set({'inspectList':inspectElementList}, function() {
          // console.log('Value is set to ' + value);
        });
        
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
  
  if (request?.callStartMethod == "start"){
      start();
  }
  
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
  
  if (request?.callStopMethod == "stop"){
      stop();
  }
  
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
  if (request?.callClearMethod == "clear"){
      clear();
  }
  // return true;
})
