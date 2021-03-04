// var port = chrome.runtime.connect({name: "extension.nexialautomation"});
// // port.postMessage({joke: "Knock knock"});
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

function tableFromJson(inspectElementList) {
  var col = [];
  for (var i = 0; i < inspectElementList.length; i++) {
    for (var key in inspectElementList[i]) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }
  }

  // Create a table.
  var table = document.createElement("table");
  table.setAttribute('class', 'table table-hover table-bordered table-responsive-md text-center');

  // Create table header row using the extracted headers above.
  var tr = table.insertRow(-1);                   // table row.

  for (var i = 0; i < col.length; i++) {
    var th = document.createElement("th");      // table header.
    th.innerHTML = col[i];
    tr.appendChild(th);
  }

  // add json data to the table as rows.
  for (var i = 0; i < inspectElementList.length; i++) {

    tr = table.insertRow(-1);

    for (var j = 0; j < col.length; j++) {
      var tabCell = tr.insertCell(-1);

      if (col[j] === "other") {
        var button = document.createElement('button');
        button.innerHTML = 'Delete';
        button.onclick = function(e) {
        // alert('here be dragons');return false;
        console.log(i, '  == i ')
        inspectElementList.splice(i-1, 1);
        table.deleteRow(i);
        console.log(inspectElementList, '  inspectElementList')
      };
      tabCell.appendChild(button);
      // tabCell.innerHTML = "<button type='button' onclick='deleteInspect(inspectElementList,i)'>Delete</button>"
      } else if(col[j] === 'locator') {
        //Create and append select list
        var selectList = document.createElement("select");
        selectList.id = "mySelect";
        // tabCell.appendChild(selectList);
        console.log(inspectElementList[i][col[j]])
        const locatorList = inspectElementList[i][col[j]]; 
        console.log(typeof locatorList)
        //Create and append the options
        for (var index = 0; index < locatorList.length; index++) {
          var option = document.createElement("option");
          option.value = locatorList[index];
          option.text = locatorList[index];
          selectList.appendChild(option);
        }
        tabCell.appendChild(selectList);
      } else {
        tabCell.setAttribute('class', 'pt-3-half');
        tabCell.setAttribute('contenteditable', 'true');
        tabCell.innerHTML = inspectElementList[i][col[j]];
      }
    }
  }

  // Now, add the newly created table with json data, to a container.
  var divShowData = document.getElementById('showData');
  divShowData.innerHTML = "";
  divShowData.appendChild(table);
      
  // document.getElementById('msg').innerHTML = '<br />You can later <a href="https://www.encodedna.com/javascript/dynamically-add-remove-rows-to-html-table-using-javascript-and-save-data.htm" target="_blank" style="color:#1464f4;text-decoration:none;">get all the data from table and save it in a database.</a>';
}

inspec_btn.addEventListener("click", function() {
  console.log('------------------------------')
  var command = 'start_inspecting', commandValue = true;  
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
