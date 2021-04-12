let cmd_selected = '';
let updatedObject = {};
let cmd_param_length = 0;
let table;

function deleteSubTable(tableIndex) {
  let inspectTable = document.getElementById('table_' + tableIndex);
  while(inspectTable.hasChildNodes()) { inspectTable.removeChild(inspectTable.firstChild); }
}

function deleteSubTableRow(tableIndex, rowIndex) { document.getElementById('table_' + tableIndex).deleteRow(rowIndex); }

function createSubTableRow(param_table, key, data, i, editable) {
  // console.log('KEY ______ ', key, '    VALUE _________ ', data)
  let tr = param_table.insertRow(-1);

  let keyCell = tr.insertCell(-1), valueCell = tr.insertCell(-1);
  keyCell.innerHTML = '<span class="param-idx">' + + key.replace("param", "") + '</span>';

  let valueCellText = '';
  if (Object.keys(data).length !== 0) { valueCellText = data[key][0]; }
  if (valueCellText && valueCellText.length > 20) { valueCellText = valueCellText.substring(0,20) + '...';}
  valueCell.setAttribute('id', (key + '_' + i))
  if (editable) {
    valueCell.innerHTML="<input type='text' id='input_" + i + "' value='" + valueCellText + "'>";
  } else valueCell.innerHTML = valueCellText
}

function getCommandParam(str) {
  // console.log('command === ', str)
  var arr = str.substring(
    str.lastIndexOf("(") + 1,
    str.lastIndexOf(")")
  ).split(',');
  if(arr[0] === '') return [];
  return arr;
}

function updateParamRow(i) {
  // console.log(updatedObject, ' --------------- JSON TO EDIT -----------------')
  var parameterArr = getCommandParam(updatedObject.command)
  // var size = Object.size(updatedObject.command);
  // console.log('cmd_param_length =  ', cmd_param_length, parameterArr.length)
  if(parameterArr.length < cmd_param_length) {
    // deleteSubTableRow(i)
    for (let index = cmd_param_length; index > parameterArr.length; index--) {
      // console.log(index, parameterArr.length)
      deleteSubTableRow(i, index-1)
    }
    // console.log('DELETE ROW ')
  }
  cmd_param_length = parameterArr.length;
  for (let index = 1; index <= (parameterArr.length); index++) {
    var el = document.getElementById('param'+ index + '_' + i)
    // param['param'+index] = [el, el.innerHTML];
    if(el) {el.innerHTML = '';}
    else {
      createSubTableRow(document.getElementById('table_' + i), ('param'+ index), {}, i, true);
      el = document.getElementById('param'+ index + '_' + i)
    }
    // else create sub table row;
    if (parameterArr[index - 1] === 'locator') {
      const locatorList = createSelectElement(inspectElementList[i].param['param1'])
      el.appendChild(locatorList)
      el.onchange = function(e) {
        updatedObject.param['param1'] = e.target.value;
      }
    } else {
      var inputVal = ''
      if ((inspectElementList[i].param).hasOwnProperty('param'+index)) {
        inputVal = inspectElementList[i].param['param'+index][0]
      }
      // var inputVal = inspectElementList[i].param['param'+index][0] ? inspectElementList[i].param['param'+index][0] : '';
      if (el) { el.innerHTML="<input type='text' id='input_" + i + "' value='" + inputVal + "'>"; }
    }
  }
  // console.log(updatedObject , '----------------- updatedObject')
}

function editRow(i) {
  toggleRowEdit(i, false);

  // console.log(inspectElementList[i], '###########################')
  const cmdList = createSelectElement(cmd)
  let cmd_el = document.getElementById('command_' + i);
  cmd_el.innerHTML = '';
  cmd_el.appendChild(cmdList);
  cmd_el.onchange = function (e) {
    updatedObject.command = e.target.value;
    cmd_el.value = e.target.value;
    updateParamRow(i);
    // console.log('data change', e.target.value)
  }

  updateParamRow(i)
  // const items = cmd.find(x => x.command_type === 'web').command;
}

function saveRow(i) {
  toggleRowEdit(i, true);

  const data = updatedObject.param;

  let cmd_el = document.getElementById('command_' + i);
  // var target = document.getElementById('target_' + i);
  // var input = document.getElementById('input_' + i);
  cmd_el.innerHTML = updatedObject.command;
  let index = 1;
  for (let key in data) {
    document.getElementById('param' + index + '_' + i).innerHTML = data[key][0];
    index++;
  }
  // console.log(cmd_selected, target_selected , input_data)
}


function toggleRowEdit(/*Number*/i, /*Boolean*/enable) {
  document.getElementById("delete_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("edit_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("save_" + i).style.display = enable ? "none" : "inline-block";
  document.getElementById("close_" + i).style.display = enable ? "none" : "inline-block";
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
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id',('edit_' + i));
  button.innerHTML = '<i class="fa fa-edit"></i>';
  button.onclick = function(e) {
    // console.log(i, '  == i ')
    // editObject.command = inspectElementList[i].command;
    // editObject.param = inspectElementList[i].param;
    updatedObject.command = inspectElementList[i].command;
    updatedObject.param = inspectElementList[i].param;
    cmd_param_length = getCommandParam(inspectElementList[i].command).length;
    Logger.debug('assign cmd_param _length', cmd_param_length);
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

function createCloseButton(i) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id',('close_' + i));
  button.setAttribute('style',('display: none'));
  button.innerHTML = '<i class="fa fa-times"></i>';
  button.onclick = function(e) {
    document.getElementById('command' + '_' + i).innerHTML = inspectElementList[i].command;
    deleteSubTable(i);
    const data = inspectElementList[i].param;
    for (let key in data) { createSubTableRow(document.getElementById('table_' + i), key, data, i, false); }
    toggleRowEdit(i, true);
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

function createSubTable(data, i) {

  const param_table = document.createElement("table");
  param_table.setAttribute('class', 'sub-table');
  param_table.setAttribute('id', 'table_' + i);
  // console.log(i)
  // console.log(data, 'Sub table data')
  for (let key in data) {
    createSubTableRow(param_table, key, data, i, false)
    // var tr = param_table.insertRow(-1);
    // var keyCell = tr.insertCell(-1), valueCell = tr.insertCell(-1);
    // var valueCellText = data[key][0];
    // if (valueCellText && valueCellText.length > 20) { valueCellText = valueCellText.substring(0,20) + '...';}
    // keyCell.innerHTML = key;
    // valueCell.setAttribute('id', (key + '_' + i))
    // valueCell.innerHTML = valueCellText
    // console.log('KEY === ', key, 'DATA === ', data[key])
  }
  return param_table;
}

function tableFromJson() {
  let i;
  var col = [];
  for (i = 0; i < inspectElementList.length; i++) {
    for (var key in inspectElementList[i]) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }
  }

  // Create a table.
  table = document.createElement("table");
  table.setAttribute('class', 'table table-hover');
  table.setAttribute('id', 'inspect_table');
  table.setAttribute('cellspacing', '0');

  // Create table header row using the extracted headers above.
  var head = table.createTHead();
  var tr = head.insertRow(-1);                    // table row.
  // tr.setAttribute('style','d-flex');

  // table header.
  for (i = 0; i < col.length; i++) {
    let heading = col[i] === 'command' ? 'command (web)' :
                  col[i] === 'param' ? 'parameters' :
                  col[i];
    let th = document.createElement("th");
    th.innerHTML = heading;
    tr.appendChild(th);
  }

  var body = table.createTBody();
  // add json data to the table as rows.
  for (i = 0; i < inspectElementList.length; i++) {

    tr = body.insertRow(-1);

    for (var j = 0; j < col.length; j++) {
      var tabCell = tr.insertCell(-1);
      if (col[j] === "actions") {
        tabCell.appendChild(createDeleteButton(i));
        tabCell.appendChild(createEditButton(i));
        tabCell.appendChild(createSaveButton(i));
        tabCell.appendChild(createCloseButton(i));
      } else if(col[j] === "param") {
        const sub_table = createSubTable(inspectElementList[i][col[j]], i);
        tabCell.appendChild(sub_table);
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