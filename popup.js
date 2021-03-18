var inspectElementList = [];

// fetch current tab url while opening the popup [without tabs permission]
// chrome.tabs.query({active:true,currentWindow:true}, function(tabArray){
//   console.log( 'Current URL ', tabArray[0].url);
// });

function clear() {
  var table = document.getElementById("inspect_table");
  table.remove();
}

function copyToAmplify() {
  var dummy = document.createElement("textarea");
    // dummy.style.display = 'none'
    document.body.appendChild(dummy);
    for (var i = 0; i < inspectElementList.length; i++) {
      // console.log(inspectElementList[i])
      dummy.value += inspectElementList[i].action+ '\t' + inspectElementList[i].locator[0] + '\t' + inspectElementList[i].input + '    ' +'text' + '\n';
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
  document.getElementById("startOption").style.display="block";
  chrome.runtime.sendMessage({cmd: 'stop_inspecting', value: false}, function(response) {
    console.log(response)
    if (response.hasOwnProperty('json')) {
      inspectElementList = (response.json);
      tableFromJson()
    }
  });
});

document.getElementById("copyToAmplify").addEventListener("click", copyToAmplify)
document.getElementById("clear").addEventListener("click", clear)
chrome.runtime.sendMessage({cmd: 'inspect_status', value: ''}, function(response) {
  console.log('inspect_status  =  ', response)
  if(response.res) {
    startInspect()
  }
})

// chrome.runtime.onMessage.addListener(function(msg) {
//   console.log("message recieved in popup js - " + msg);
//   if (msg.hasOwnProperty('json')) {
//     tableFromJson(msg.json)
//   }
// });
