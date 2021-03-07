const inspec_btn = document.getElementById("inspectAction");
var testCaseList ;

// fetch current tab url while opening the popup [without tabs permission]
// chrome.tabs.query({active:true,currentWindow:true}, function(tabArray){
//   console.log( 'Current URL ', tabArray[0].url);
// });
function clear() {

}

function copyToAmplify() {
  console.log('*****************************')
  var dummy = document.createElement("textarea");
    // dummy.style.display = 'none'
    document.body.appendChild(dummy);
    for (var i = 0; i < testCaseList.length; i++) {
      console.log(testCaseList[i])
      dummy.value += testCaseList[i].action+ '\t' + testCaseList[i].locator[0] + '\t' + testCaseList[i].input + '    ' +'text' + '\n';
    
    }
    console.log(dummy.value)
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

function inspectCaption(inspect_btn_caption, is_inspecting) {
  if(inspect_btn_caption === 'Start Inspect' || is_inspecting) {
    inspec_btn.value = 'Stop Inspect';
  } else if(inspect_btn_caption !== 'Start Inspect' || !is_inspecting) {
    inspec_btn.value = 'Start Inspect';
  }
}

// function create(array, index) {
//   console.log(index, '  ji')
//   array.splice(index, 1);
// }



document.getElementById('url').addEventListener('focusout', function(e) {
  // checking is url validated
  var res = (e.target.value).match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if(res == null) {
    console.log(document.getElementsByClassName('valid-feedback')[0])
    document.getElementsByClassName('valid-feedback')[0].classList.add("d-block");
    // document.getElementsByClassName('valid-feedback')[0].style.display === 'none' ? 'block' : 'none';
    e.target.value = '';
  }
});

inspec_btn.addEventListener("click", function() {

  var command = 'start_inspecting', commandValue = document.getElementById("url").value;
  if(inspec_btn.value !== 'Start Inspect') { 
    command = 'stop_inspecting';
    commandValue = false;
  }
  inspectCaption(inspec_btn.value, '')
  chrome.runtime.sendMessage({cmd: command, value: commandValue}, function(response) {
    console.log(response)
    if (response.hasOwnProperty('json')) {
      testCaseList = (response.json);
      tableFromJson(response.json)
    }
  });
});

document.getElementById("copyToAmplify").addEventListener("click", copyToAmplify)
chrome.runtime.sendMessage({cmd: 'inspect_status', value: ''}, function(response) {
  console.log(response)
  inspectCaption('', response.res)
})

// chrome.runtime.onMessage.addListener(function(msg) {
//   console.log("message recieved in popup js - " + msg);
//   if (msg.hasOwnProperty('json')) {
//     tableFromJson(msg.json)
//   }
// });
