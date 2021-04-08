var inspectElementList = [];

// fetch current tab url while opening the popup [without tabs permission]
// chrome.tabs.query({active:true,currentWindow:true}, function(tabArray){
//   console.log( 'Current URL ', tabArray[0].url);
// });

function clear() {
  var Parent = document.getElementById('inspect_table');
  while(Parent.hasChildNodes())
  {
    Parent.removeChild(Parent.firstChild);
  }
  inspectElementList = [];
}

function copyToAmplify() {
  var dummy = document.createElement("textarea");
  // dummy.style.display = 'none'
  document.body.appendChild(dummy);
  for (var i = 0; i < inspectElementList.length; i++) {
    dummy.value += inspectElementList[i].command + '\t';
    const data = inspectElementList[i].param;
    for (var key in data) {
      dummy.value += data[key][0] + '\t'
    }
    dummy.value += '\n';
  }
  // console.log(dummy.value)
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

function pausedInspect() {
  document.getElementById("pauseInspect").classList.toggle("btn-default");
  document.getElementById("pauseInspect").classList.toggle("btn-primary");
  document.getElementById("pauseInspect").value = 'Restart Inspect';
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
  startInspect()
  chrome.runtime.sendMessage({cmd: command, value: commandValue}, function(response) {
    console.log('start inspecting response -- ', response)
  });
});

document.getElementById("nowInspect").addEventListener("click", function() {
  startInspect()
  chrome.runtime.sendMessage({cmd: 'start_inspecting', value: ''}, function(response) {
    console.log('Now inspecting response -- ', response)
  });
});

document.getElementById("stopInspect").addEventListener("click", function() {
  // startInspect('start_inspecting', currentUrl)
  document.getElementById("stopOption").style.display="none";
  document.getElementById("startOption").style.display="flex";
  chrome.runtime.sendMessage({cmd: 'stop_inspecting', value: false}, function(response) {
    console.log(response)
    if (response.hasOwnProperty('json')) {
      inspectElementList = (response.json);
      tableFromJson()
    }
  });
});

document.getElementById("pauseInspect").addEventListener("click", function() {
  document.getElementById("pauseInspect").classList.toggle("btn-default");
  document.getElementById("pauseInspect").classList.toggle("btn-primary");
  if (document.getElementById("pauseInspect").value === 'Pause Inspect') {
    document.getElementById("pauseInspect").value = 'Restart Inspect';
    chrome.runtime.sendMessage({cmd: 'pause_inspecting', value: true}, function(response) {
      console.log(response)
    });
  } else document.getElementById("pauseInspect").value = 'Pause Inspect';
});

document.getElementById("copyToAmplify").addEventListener("click", copyToAmplify)
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
