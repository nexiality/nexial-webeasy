let table, updatedObject = {}, step = 0, editMode = false;

function getInspectListObject(step) {
  return inspectElementList.find(obj => obj.step === step);
}

function updateInspectList(i) {

}

function toggleElement(element, enable) {                                         // Enable disable Element
  if (!enable) {
    element.setAttribute("disabled", "true");
  } else {
    element.removeAttribute("disabled");
  }
}

function deleteSubTable(tableIndex) {
  let inspectTable = document.getElementById('table_' + tableIndex);
  while (inspectTable.hasChildNodes()) { inspectTable.removeChild(inspectTable.firstChild); }
}

function deleteSubTableRow(tableIndex, rowIndex) { document.getElementById('table_' + tableIndex).deleteRow(rowIndex); }

function createSubTableRow(param_table, key, data, step, editable) {

  let tr = param_table.insertRow(-1);
  let valueCell = tr.insertCell(-1);
  valueCell.setAttribute("title", key);

  let element = '';
  if (data.length <= 1) {                                 // param is other than locator
    element = createInputBox(data, editable);
  } else if (data.length > 1) {                           // param is locator
    element = createSelectElement(data, editable)
  }
  element.setAttribute('id', (key + '_' + step))
  valueCell.appendChild(element);
}

function getCommandParam(str) {
  if (!str || str === '') return [];

  let indexParamStart = str.lastIndexOf("(");
  if (indexParamStart === -1) return [];

  let indexParamEnd = str.lastIndexOf(")");
  if (indexParamEnd === -1) return [];

  let arr = str.substring(indexParamStart + 1, indexParamEnd).split(',');
  if (!arr) return [];
  if (arr[0] === '') return [];
  return arr;
}

function updateParamRow(step) {
  let parameterArr = getCommandParam(updatedObject.command), isCommandChanged = false;
  // console.log('parama array', parameterArr)
  const inspectListObj = getInspectListObject(step)
  // console.log('inspecElementList row', inspectListObj)
  if (inspectListObj.command !== updatedObject.command) {
    isCommandChanged = true;
    deleteSubTable(step);
  }
  
  for (let index = 0; index < (parameterArr.length); index++) {
    // console.log(parameterArr[index] + '_' + step)
    var data = [];
    if (parameterArr[index] === 'locator') data = inspectListObj.param['locator'];
    if (isCommandChanged) createSubTableRow(document.getElementById('table_' + step), parameterArr[index], data, step, true);
    else toggleElement(document.getElementById(parameterArr[index] + '_' + step), true)
  }
}

function editRow(step) {
  toggleRow(step, false);
  let cmd_el = document.getElementById('command_' + step);
  cmd_el.removeAttribute("disabled");
  cmd_el.onchange = function (e) {
    updatedObject.command = e.target.value;
    cmd_el.value = e.target.value;
    updateParamRow(step);
  }
  updateParamRow(step)
}

function saveRow(i) {
  toggleRow(i, true);
  const step = inspectElementList[i]['step'];
  let cmdElement = document.getElementById('command_' + step);
  toggleElement(cmdElement, false)
  inspectElementList[i].command = cmdElement.value                                // Update inspectElementList's command

  const paramList = getCommandParam(cmdElement.value);                            // Update inspectElementList's param

  (paramList).forEach(element => {
    const paramElement = document.getElementById(element + '_' + step);
    if(element === 'locator') {
      // ToDo
    } else inspectElementList[i].param[element] = [paramElement.value];
    toggleElement(paramElement, false)
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

function createDeleteButton(step) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark delete-button ripple-surface')
  button.setAttribute('id',('delete_' + step));
  button.innerHTML = '<i class="fa fa-trash"></i>';
  button.onclick = function (e) {
    // Todo Update background.js
    // TODO Update inspectElementList
    document.getElementById("step_" + step).remove()
  };
  return button;
}

function createEditButton(step) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id',('edit_' + step));
  button.innerHTML = '<i class="fa fa-edit"></i>';
  button.onclick = function (e) {
    if (editMode) return;
    // console.log(inspectElementList)
    // console.log('step -- ', step)
    editMode = true;
    const obj = getInspectListObject(step)
    updatedObject.command = obj.command;
    updatedObject.param = obj.param;
    // console.log('Update object - ', updatedObject)
    editRow(step);
  };
  return button;
}

function createSaveButton(i) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id', ('save_' + i));
  button.setAttribute('style', ('display: none'));
  button.innerHTML = '<i class="fa fa-check"></i>';
  button.onclick = function (e) {
    editMode = false;
    saveRow(i)
  };
  return button;
}

function createCloseButton(i) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id', ('close_' + i));
  button.setAttribute('style', ('display: none'));
  button.innerHTML = '<i class="fa fa-times"></i>';
  button.onclick = function (e) {
    editMode = false;
    const step = inspectElementList[i]['step']
    // Undo Command value and make it disable
    document.getElementById('command' + '_' + step).value = inspectElementList[i].command;
    toggleElement(document.getElementById('command' + '_' + step), false)

    deleteSubTable(step);                           // clear param table

    const data = inspectElementList[i].param, paramList = getCommandParam(inspectElementList[i].command);
    for (let key in data) {
      createSubTableRow(document.getElementById('table_' + step), key, data[key], i, false);
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
    if (optgroup) {
      optgroup.appendChild(option);
      selectList.appendChild(optgroup);
    } else {
      selectList.appendChild(option);
    }
  }
  return selectList;
}

function createInputBox(data, editable = true) {
  let input = document.createElement("INPUT");
  input.setAttribute("type", "text");
  input.setAttribute("class", "form-control");
  input.setAttribute("value", data[0] ? data[0]: '');
  if (!editable) input.setAttribute('disabled', 'true')
  return input;
}

function createSubTable(data, i) {

  const step = inspectElementList[i]['step'];
  const param_table = document.createElement("table");
  param_table.setAttribute('class', 'sub-table');
  param_table.setAttribute('id', 'table_' + step);

  for (let key in data) {
    createSubTableRow(param_table, key, data[key], step, false);
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
    step = inspectElementList[i]['step'];
    tr.setAttribute('id', ('step_' + step));
    for (let j = 0; j < col.length; j++) {
      let tabCell = tr.insertCell(-1);
      if (col[j] === "actions") {
        tabCell.appendChild(createEditButton(step));
        tabCell.appendChild(createDeleteButton(step));
        tabCell.appendChild(createSaveButton(step));
        tabCell.appendChild(createCloseButton(step));
      } else if(col[j] === "param") {
        const sub_table = createSubTable(inspectElementList[i]['param'], i);
        tabCell.appendChild(sub_table);
      } else if (col[j] === "command") {
        const cmdDropdown = createSelectElement(cmd, false)
        cmdDropdown.setAttribute('id', (col[j] + '_' + step))
        cmdDropdown.value = inspectElementList[i][col[j]];
        tabCell.appendChild(cmdDropdown);
      } else {
        tabCell.innerHTML = step;
      }
    }
  }

  // Now, add the newly created table with json data, to a container.
  let divShowData = document.getElementById('showData');
  divShowData.innerHTML = "";
  divShowData.appendChild(table);
}
