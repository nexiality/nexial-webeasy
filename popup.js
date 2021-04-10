var inspectElementList = [];

// fetch current tab url while opening the popup [without tabs permission]
// chrome.tabs.query({active:true,currentWindow:true}, function(tabArray){
//   console.log( 'Current URL ', tabArray[0].url);
// });

function clear() {
  let table = document.getElementById('inspect_table');
  while(table.hasChildNodes()) { table.removeChild(table.firstChild); }
  inspectElementList = [];
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
}

let pauseInspect = document.getElementById("pauseInspect");

function pausedInspect() {
  pauseInspect.classList.toggle("btn-default");
  pauseInspect.classList.toggle("btn-primary");
  pauseInspect.value = 'Restart Inspect';
}

document.getElementById("startInspect").addEventListener("click", function() {

  var command = 'start_inspecting', commandValue = document.getElementById("url").value;
  var res = validURL(commandValue);
  // console.log("url inspect for ", commandValue, res)
  if (!res) {
    console.log(document.getElementsByClassName('valid-feedback')[0])
    document.getElementsByClassName('valid-feedback')[0].classList.add("d-block");
    document.getElementById("url").value = '';
    return;
  }
  startInspect();
  Messenger.sendInternalMessage({cmd: command, value: commandValue});
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
  Messenger.sendInternalMessage({cmd: 'stop_inspecting', value: false}, function(response) {
    Logger.debug(response);
    if (response.hasOwnProperty('json')) {
      inspectElementList = (response.json);
      tableFromJson()
    }
  });
});

pauseInspect.addEventListener("click", function () {
  pauseInspect.classList.toggle("btn-default");
  pauseInspect.classList.toggle("btn-primary");
  if (pauseInspect.value === 'Pause Inspect') {
    pauseInspect.value = 'Restart Inspect';
    // chrome.runtime.sendMessage({cmd: 'pause_inspecting', value: true}, function(response) {
    //   console.log(response)
    // });
    Messenger.sendInternalMessage({cmd: 'pause_inspecting', value: true});
  } else {
    pauseInspect.value = 'Pause Inspect';
  }
});

document.getElementById("copyToNexial").addEventListener("click", copyToNexial)
document.getElementById("clear").addEventListener("click", clear)
chrome.runtime.sendMessage({cmd: 'inspect_status', value: ''}, function(response) {
  console.log('inspect_status  =  ', response)
  if(response.res !== 'stop') {
    startInspect()
    if(response.res === 'paused') pausedInspect()
  }
  if (response.hasOwnProperty('json') && response.res === 'stop') {
    inspectElementList = (response.json);
    tableFromJson()
  }
})

// chrome.runtime.onMessage.addListener(function(msg) {
//   console.log("message recieved in popup js - " + msg);
//   if (msg.hasOwnProperty('json')) {
//     tableFromJson(msg.json)
//   }
// });
