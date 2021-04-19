let table, updatedObject = {}, cmd_param_length = 0, editMode = false;

function updateInspectList(i) {

}

function toggleElement(element, enable) {                                         // Enable disable Element
  if(!enable) element.setAttribute("disabled", "true");
  else element.removeAttribute("disabled");
}

function deleteSubTable(tableIndex) {
  let inspectTable = document.getElementById('table_' + tableIndex);
  while(inspectTable.hasChildNodes()) { inspectTable.removeChild(inspectTable.firstChild); }
}

function deleteSubTableRow(tableIndex, rowIndex) { document.getElementById('table_' + tableIndex).deleteRow(rowIndex); }

function createSubTableRow(param_table, cmdParam, key, data, i, editable) {
  // console.log('KEY ______ ', key, '    VALUE _________ ', data)
  let tr = param_table.insertRow(-1);
  let valueCell = tr.insertCell(-1);
  valueCell.setAttribute("title", cmdParam);
  // keyCell.innerHTML = '<span class="param-idx">' + + key.replace("param", "") + '</span>';

  let element = '';
  if (data.length <= 1) {                                 // param is other than locator
    element = document.createElement("INPUT");
    element.setAttribute("type", "text");
    element.setAttribute("class", "form-control");
    element.setAttribute("value", data[0] ? data[0]: '');
    if (!editable) element.setAttribute('disabled', editable)
  } else if (data.length > 1) {                           // param is locator
    element = createSelectElement(data, editable)
  }
  element.setAttribute('id', (key + '_' + i))
  valueCell.appendChild(element);
}

function getCommandParam(str) {
  // console.log('command === ', str)
  // ToDo : (Case) Command is undefined and has no param
  let arr = str.substring(
    str.lastIndexOf("(") + 1,
    str.lastIndexOf(")")
  ).split(',');
  if(arr[0] === '') return [];
  return arr;
}

function updateParamRow(i) {
  let parameterArr = getCommandParam(updatedObject.command);
  deleteSubTable(i);
  for (let index = 0; index < (parameterArr.length); index++) {
    const paramIndex = index + 1;
    var data = [];
    if (parameterArr[index] === 'locator') data = inspectElementList[i].param['param1'];
    createSubTableRow(document.getElementById('table_' + i), parameterArr[index], ('param'+ paramIndex), data, i, true);
  }
}

function editRow(i) {
  toggleRow(i, false);

  let cmd_el = document.getElementById('command_' + i);
  cmd_el.removeAttribute("disabled");
  cmd_el.onchange = function (e) {
    updatedObject.command = e.target.value;
    cmd_el.value = e.target.value;
    updateParamRow(i);
  }

  updateParamRow(i)
  // const items = cmd.find(x => x.command_type === 'web').command;
}

function saveRow(i) {
  toggleRow(i, true);
  let cmdElement = document.getElementById('command_' + i);
  toggleElement(cmdElement, false)
  inspectElementList[i].command = cmdElement.value                                // Update inspectElementList's command

  const paramList = getCommandParam(cmdElement.value);                            // Update inspectElementList's param
  let index = 1;
  (paramList).forEach(element => {
    const paramElement = document.getElementById('param'+ index + '_' + i);
    if(element === 'locator') {
      // ToDo
    } else inspectElementList[i].param['param' + index] = [paramElement.value];
    toggleElement(paramElement, false)
    index++;
  });
}

function toggleRow(/*Number*/i, /*Boolean*/enable) {
  document.getElementById("delete_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("edit_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("save_" + i).style.display = enable ? "none" : "inline-block";
  document.getElementById("close_" + i).style.display = enable ? "none" : "inline-block";
}

function createDuplicateButton() {

}

function createDeleteButton(i) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark delete-button ripple-surface')
  button.setAttribute('id',('delete_' + i));
  button.innerHTML = '<i class="fa fa-trash"></i>';
  button.onclick = function(e) {
    // Todo Update background.js
    inspectElementList.splice(i, 1);
    table.deleteRow(i + 1);
    console.log(inspectElementList, '  inspectElementList')
  };
  return button;
}

function createEditButton(i) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id',('edit_' + i));
  button.innerHTML = '<i class="fa fa-edit"></i>';
  button.onclick = function(e) {
    if (editMode) return;
    editMode = true;
    updatedObject.command = inspectElementList[i].command;
    updatedObject.param = inspectElementList[i].param;
    cmd_param_length = getCommandParam(inspectElementList[i].command).length;
    Logger.debug('assign cmd_param _length', cmd_param_length);
    editRow(i);
  };
  return button;
}

function createSaveButton(i) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id',('save_' + i));
  button.setAttribute('style',('display: none'));
  button.innerHTML = '<i class="fa fa-check"></i>';
  button.onclick = function(e) {
    editMode = false;
    saveRow(i)
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
    editMode = false;
    // Undo Command value and make it disable
    document.getElementById('command' + '_' + i).value = inspectElementList[i].command;
    toggleElement(document.getElementById('command' + '_' + i), false)

    deleteSubTable(i);                           // clear param table

    const data = inspectElementList[i].param, paramList = getCommandParam(inspectElementList[i].command);;
    let index = 0;
    for (let key in data) {
      createSubTableRow(document.getElementById('table_' + i), paramList[index], key, data[key], i, false);
      index++;
    }
    toggleRow(i, true);
  };
  return button;
}

function createSelectElement(items, editable = true) {
  // Create and append select list
  let selectList = document.createElement("select");
  selectList.setAttribute('class', 'form-control')
  if (!editable) selectList.setAttribute('disabled', 'true')
  // console.log(items)

  //Create and append the options
  let optgroup = '', optgroupLabel = '';
  for (let index = 0; index < items.length; index++) {
    if ((items[index]).includes('=') && optgroupLabel !== items[index].split('=')[0]) {
      optgroupLabel = items[index].split('=')[0];
      optgroup = document.createElement("optgroup");
      optgroup.setAttribute('label', optgroupLabel.toUpperCase())
    }
    let option = document.createElement("option");
    option.value = items[index];
    option.text = items[index];
    if(optgroup) {
      optgroup.appendChild(option);
      selectList.appendChild(optgroup);
    } else selectList.appendChild(option);
  }
  return selectList;
}

function createSubTable(data, i) {

  const param_table = document.createElement("table");
  param_table.setAttribute('class', 'sub-table');
  param_table.setAttribute('id', 'table_' + i);

  let index = 0;
  const paramList = getCommandParam(inspectElementList[i].command);      // find command param list

  for (let key in data) {
    createSubTableRow(param_table, paramList[index], key, data[key], i, false);
    index++;
  }
  return param_table;
}

function tableFromJson() {
  let i;
  let col = [];
  for (i = 0; i < inspectElementList.length; i++) {
    for (let key in inspectElementList[i]) {
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
  let head = table.createTHead();
  let tr = head.insertRow(-1);                    // table row.
  // tr.setAttribute('style','d-flex');

  // table header.
  for (i = 0; i < col.length; i++) {
    let heading = col[i] === 'command' ? 'command (web)' :
                  col[i] === 'param' ? 'parameters' :
                  col[i] === 'step' ? '#' :
                  col[i];
    let th = document.createElement("th");
    th.innerHTML = heading;
    tr.appendChild(th);
  }

  let body = table.createTBody();
  // add json data to the table as rows.
  for (i = 0; i < inspectElementList.length; i++) {

    tr = body.insertRow(-1);

    for (let j = 0; j < col.length; j++) {
      let tabCell = tr.insertCell(-1);
      if (col[j] === "actions") {
        tabCell.appendChild(createEditButton(i));
        tabCell.appendChild(createDeleteButton(i));
        tabCell.appendChild(createSaveButton(i));
        tabCell.appendChild(createCloseButton(i));
      } else if(col[j] === "param") {
        const sub_table = createSubTable(inspectElementList[i][col[j]], i);
        tabCell.appendChild(sub_table);
      } else if (col[j] === "command") {
        const cmdDropdown = createSelectElement(cmd, false)
        cmdDropdown.setAttribute('id', (col[j] + '_' + i))
        cmdDropdown.value = inspectElementList[i][col[j]];
        tabCell.appendChild(cmdDropdown);
      } else {
        tabCell.innerHTML = inspectElementList[i][col[j]];
      }
    }
  }

  // Now, add the newly created table with json data, to a container.
  let divShowData = document.getElementById('showData');
  divShowData.innerHTML = "";
  divShowData.appendChild(table);
}
