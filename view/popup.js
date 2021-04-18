var inspectElementList = [];

// fetch current tab url while opening the popup [without tabs permission]
// chrome.tabs.query({active:true,currentWindow:true}, function(tabArray){
//   console.log( 'Current URL ', tabArray[0].url);
// });

function info(text) {
  console.log('*****************')
  document.getElementById('modelBody').innerHTML = ''
  document.getElementById('modelBody').innerHTML = text;
}

function clear() {
  let table = document.getElementById('inspect_table');
  while(table.hasChildNodes()) { table.removeChild(table.firstChild); }
  inspectElementList = [];
  Messenger.sendInternalMessage({cmd: 'clear_inspection', value: ''});
  document.getElementById("inspectFeature").style.display="none";
}

function copyToNexial() {
  let delim = '\t';
  let script = '';

  for (let i = 0; i < inspectElementList.length; i++) {
    script += 'web' + delim + inspectElementList[i].command + delim;
    for (let parameter in inspectElementList[i].param) {
      script += inspectElementList[i].param[parameter][0] + delim
    }
    script += '\n';
  }

  let dummy = document.createElement("textarea");
  dummy.value = script;
  document.body.appendChild(dummy);
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

function validURL(myURL) {
  var pattern = new RegExp('^(http(s)?:\/\/.)'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ //port
  '(\\?[;&amp;a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i');
  return pattern.test(myURL);
}

function startInspect() {  
  document.getElementById("stopOption").style.display="block";
  document.getElementById("startOption").style.display="none";
  document.getElementById("showStatus").style.display="block";
}

let pauseInspect = document.getElementById("pauseInspect");

function pausedInspect() {
  pauseInspect.classList.toggle("btn-default");
  pauseInspect.classList.toggle("btn-primary");
  pauseInspect.value = 'Restart Inspect';
}

document.getElementById("startInspect").addEventListener("click", function () {
  var commandValue = document.getElementById("url").value;
  var res = validURL(commandValue);
  // console.log("url inspect for ", commandValue, res)

  if (!res) {
    let validFeedback = document.getElementsByClassName('valid-feedback')[0];
    Logger.debug(validFeedback)
    validFeedback.classList.add("d-block");
    document.getElementById("url").value = '';
    return;
  }
  startInspect();
  Messenger.sendInternalMessage({cmd: 'start_inspecting', value: commandValue});
});

document.getElementById("nowInspect").addEventListener("click", function () {
    startInspect();
    Messenger.sendInternalMessage({cmd: 'start_inspecting', value: ''});
  }
);

document.getElementById("stopInspect").addEventListener("click", function() {
  // startInspect('start_inspecting', currentUrl)
  document.getElementById("stopOption").style.display="none";
  document.getElementById("startOption").style.display="flex";
  document.getElementById("inspectFeature").style.display="block";
  document.getElementById("showStatus").style.display="none";
  Messenger.sendInternalMessage({cmd: 'stop_inspecting', value: false}, function(response) {
    Logger.debug(response);
    if (response.hasOwnProperty('json')) {
      inspectElementList = response.json;
      tableFromJson()
    }
  });
});

pauseInspect.addEventListener("click", function () {
  pauseInspect.classList.toggle("btn-default");
  pauseInspect.classList.toggle("btn-primary");
  if (pauseInspect.value === 'Pause Inspect') {
    pauseInspect.value = 'Restart Inspect';
    Messenger.sendInternalMessage({cmd: 'pause_inspecting', value: true});
  } else {
    pauseInspect.value = 'Pause Inspect';
  }
});

document.getElementById("startInspectInfo").addEventListener("click", function(){
  info('startInspectInfo');
}, false);
document.getElementById("nowInspectInfo").addEventListener("click", function(){
  info('nowInspectInfo');
}, false);
document.getElementById("clearInfo").addEventListener("click", function(){
  info('clearInfo');
}, false);
document.getElementById("copyToNexialInfo").addEventListener("click", function(){
  info('copyToNexialInfo');
}, false);

document.getElementById("copyToNexial").addEventListener("click", copyToNexial);

document.getElementById("clear").addEventListener("click", clear);

Messenger.sendInternalMessage({cmd: 'inspect_status', value: ''}, function(response) {
  Logger.debug('inspect_status  =  ', response)
  if(response.res !== 'stop') {
    startInspect();
    if(response.res === 'paused') pausedInspect();
  } else if (response.hasOwnProperty('json')) {
    inspectElementList = response.json;
    if(inspectElementList.length) {
      tableFromJson();
      document.getElementById("inspectFeature").style.display="block";
    }
  }
});

// chrome.runtime.onMessage.addListener(function(msg) {
//   console.log("message recieved in popup js - " + msg);
//   if (msg.hasOwnProperty('json')) {
//     tableFromJson(msg.json)
//   }
// });
