let cmd_selected = '', target_selected = '', input_data;
var table;

function editRow(i) {
  document.getElementById("delete_"+i).style.display="none";
  document.getElementById("edit_"+i).style.display="none";
  document.getElementById("save_"+i).style.display="block";

  var action = document.getElementById('command_' + i);
  var target = document.getElementById('target_' + i);
  var input = document.getElementById('input_' + i);

  cmd_selected = action.innerHTML;
  target_selected = target.innerHTML;
  input_data = input.innerHTML;
	
  const items = cmd.find(x => x.command_type === 'web').command;
  const actionList = createSelectElement(items)
  action.innerHTML = '';
  action.appendChild(actionList);

  action.onchange =  function(e) {
    cmd_selected = e.target.value;
  }
  target.onchange = function(e) {
    target_selected = e.target.value;
  }
  input.onchange = function(e) {
    input_data = e.target.value;
  }

  const selectList = createSelectElement(inspectElementList[i].target)
  target.innerHTML = '';
  if(inspectElementList[i].target) {
    target.appendChild(selectList);
  } else {
    target.innerHTML = 'NULL'
  }

  input.innerHTML="<input type='text' id='input_text" + i + "' value='" + input_data + "'>";
}

function saveRow(i) {
  document.getElementById("delete_"+i).style.display="block";
  document.getElementById("edit_"+i).style.display="block";
  document.getElementById("save_"+i).style.display="none";

  var action = document.getElementById('command_' + i);
  var target = document.getElementById('target_' + i);
  var input = document.getElementById('input_' + i);

  input.innerHTML = input_data
  action.innerHTML = cmd_selected
  target.innerHTML = target_selected
  // console.log(cmd_selected, target_selected , input_data)
}

function createDuplicateButton() {

}

function createDeleteButton(i) {
  var button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark delete-button ripple-surface')
  button.setAttribute('id',('delete_' + i));
  button.innerHTML = '<i class="fa fa-trash"></i>';
  button.onclick = function(e) {
    // console.log(i, '  == i ')
    inspectElementList.splice(i-1, 1);
    table.deleteRow(i-1);
    // console.log(inspectElementList, '  inspectElementList')
  };
  return button;
}

function createEditButton(i) {
  var button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id',('edit_' + i));
  button.innerHTML = '<i class="fa fa-edit"></i>';
  button.onclick = function(e) {
    // console.log(i, '  == i ')
    editRow(i);
  };
  return button;
}

function createSaveButton(i) {
  var button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id',('save_' + i));
  button.setAttribute('style',('display: none'));
  button.innerHTML = '<i class="fa fa-check"></i>';
  button.onclick = function(e) {
    // console.log(i, '  == i ')
    saveRow(i)
    // inspectElementList.splice(i-1, 1);
    // table.deleteRow(i);
    // console.log(inspectElementList, '  inspectElementList')
  };
  return button;
}

function createSelectElement(items) {
  // Create and append select list
  var selectList = document.createElement("select");
  selectList.id = "mySelect";
  // console.log(items)

  //Create and append the options
  for (var index = 0; index < items.length; index++) {
    var option = document.createElement("option");
    option.value = items[index];
    option.text = items[index];
    selectList.appendChild(option);
  }
  return selectList;
}

function tableFromJson() {
  var col = [];
  for (var i = 0; i < inspectElementList.length; i++) {
    for (var key in inspectElementList[i]) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }
  }

  // Create a table.
  table = document.createElement("table");
  table.setAttribute('class', 'table table-hover table-bordered table-responsive-md text-center');
  table.setAttribute('style',('table-layout: auto;width:100%;'));
  table.setAttribute('id', 'inspect_table')

  // Create table header row using the extracted headers above.
  var tr = table.insertRow(-1);                    // table row.
  // tr.setAttribute('style','d-flex');

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
      if (col[j] === "Actions") {
        const delete_button = createDeleteButton(i)
        tabCell.appendChild(delete_button);
        const edit_button = createEditButton(i)
        tabCell.appendChild(edit_button);
        const save_button = createSaveButton(i)
        tabCell.appendChild(save_button);
      } else {
        tabCell.setAttribute('id', (col[j] + '_' + i))
        var cellText = inspectElementList[i][col[j]];
        if (cellText && cellText.length > 20) { cellText = cellText.substring(0,20) + '...';}
        tabCell.innerHTML = cellText;
      }
    }
  }

  // Now, add the newly created table with json data, to a container.
  var divShowData = document.getElementById('showData');
  divShowData.innerHTML = "";
  divShowData.appendChild(table);
      
  // document.getElementById('msg').innerHTML = '<br />You can later <a href="https://www.encodedna.com/javascript/dynamically-add-remove-rows-to-html-table-using-javascript-and-save-data.htm" target="_blank" style="color:#1464f4;text-decoration:none;">get all the data from table and save it in a database.</a>';
}