let table, updatedObject = {}, currentStep = 0, editMode = false;

function getInspectListObject(step) {
  return inspectElementList.find(obj => obj.step === step);
}

function updateInspectList(step) {
  let oldObject = inspectElementList.find(obj => obj.step === step)
  oldObject.command = updatedObject.command;
  oldObject.param = updatedObject.param;
}

function toggleElement(element, enable) {                            // Enable disable Element
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

  if(editMode) updatedObject.param[key] = data;

  let element = '';
  if (key === 'locator' && data) {                                      // param is locator
    element = createSelectElement(data, editable)
    element.onchange = function (e) {
      // ToDO: 
    }
  } else if (key === 'locator' && !data) {
    element = createInspectElement(key, step)
  } else {                                            // param is other than locator
    element = createInputBox(data, editable);
    element.focusout = function(e) {
      updatedObject.param[key] = [element.value];
    };
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
  const inspectListObj = getInspectListObject(step)
  if (inspectListObj.command !== updatedObject.command) {
    isCommandChanged = true;
    updatedObject.param = {};
    deleteSubTable(step);
  }
  
  for (let index = 0; index < (parameterArr.length); index++) {
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

function saveRow(step) {
  toggleRow(step, true);

  let cmdElement = document.getElementById('command_' + step);
  cmdElement.setAttribute("disabled", "true");

  const paramList = getCommandParam(cmdElement.value);               // Update inspectElementList's param
  (paramList).forEach(element => {
    const paramElement = document.getElementById(element + '_' + step);
    toggleElement(paramElement, false)
  });

  updateInspectList(step);
}

function toggleRow(/*Number*/i, /*Boolean*/enable) {
  document.getElementById("delete_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("edit_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("addNew_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("duplicate_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("up_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("down_" + i).style.display = enable ? "inline-block" : "none";
  document.getElementById("save_" + i).style.display = enable ? "none" : "inline-block";
  document.getElementById("close_" + i).style.display = enable ? "none" : "inline-block";
}

function createAddNewButton(step) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark');
  button.setAttribute('id',('addNew_' + step));
  button.setAttribute('title', 'Add below');
  button.innerHTML = '<i class="fas fa-plus"></i>';
  button.onclick = function (e) {
    const indexAt = document.getElementById('step_' + step).rowIndex;
    const payload = {
      step   : '',
      command: '',
      param:   {},
      actions: {}
    }
    addRow(payload, indexAt + 1);
    updateTableRow();
  };
  return button;
}

function createDuplicateButton(step) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark delete-button ripple-surface')
  button.setAttribute('id',('duplicate_' + step));
  button.setAttribute('title', 'Duplicate');
  button.innerHTML = '<i class="fas fa-clone"></i>';
  button.onclick = function (e) {
    let payload = Object.assign({}, getInspectListObject(step));
    payload.step = '';
    addRow(payload);
    updateTableRow();
  };
  return button;
}

function createDeleteButton(step) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark delete-button ripple-surface')
  button.setAttribute('id',('delete_' + step));
  button.setAttribute('title', 'Delete');
  button.innerHTML = '<i class="fa fa-trash"></i>';
  button.onclick = function (e) {
    // Todo Update background.js
    // TODO Update inspectElementList
    document.getElementById("step_" + step).remove();
    updateTableRow();
  };
  return button;
}

function createEditButton(step) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id',('edit_' + step));
  button.setAttribute('title', 'Edit');
  button.innerHTML = '<i class="fa fa-edit"></i>';
  button.onclick = function (e) {
    if (editMode) return;
    editMode = true;
    const obj = getInspectListObject(step)
    updatedObject.command = obj.command;
    updatedObject.param = obj.param;
    editRow(step);
  };
  return button;
}

function createSaveButton(step) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id', ('save_' + step));
  button.setAttribute('title', 'Save');
  button.setAttribute('style', ('display: none'));
  button.innerHTML = '<i class="fa fa-check"></i>';
  button.onclick = function (e) {
    editMode = false;
    saveRow(step)
  };
  return button;
}

function createCloseButton(step) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  button.setAttribute('id', ('close_' + step));
  button.setAttribute('title', 'Close');
  button.setAttribute('style', ('display: none'));
  button.innerHTML = '<i class="fa fa-times"></i>';
  button.onclick = function (e) {
    editMode = false;
    // Undo Command value and make it disable
    const oldObject = getInspectListObject(step);
    console.log(oldObject, '+++++++++++++++++++++++++++++++===')
    document.getElementById('command' + '_' + step).value = oldObject.command;
    toggleElement(document.getElementById('command' + '_' + step), false)

    deleteSubTable(step);                                            // clear param table

    const data = oldObject.param, paramList = getCommandParam(oldObject.command);
    for (let key in data) {
      createSubTableRow(document.getElementById('table_' + step), key, data[key], step, false);
    }
    toggleRow(step, true);
  };
  return button;
}

function createUpDownButton(step, direction) {
  let button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark')
  if(direction === 1) {
    // create Down button
    button.innerHTML = '<i class="fas fa-arrow-down"></i>';
    button.setAttribute('title', 'Down');
    button.setAttribute('id', ('down_' + step));
  } else {
    button.innerHTML = '<i class="fas fa-arrow-up"></i>'
    button.setAttribute('title', 'Up');
    button.setAttribute('id', ('up_' + step));
  }
  button.onclick = function (e) {
    var row = $(this).closest('tr');
    const indexAt = document.getElementById('step_' + step).rowIndex;
    const totalRowCount = table.tBodies[0].rows.length;

    if(direction === 1 && indexAt !== totalRowCount) row.next().after(row);
    else if(direction !== 1 && indexAt !== 1) row.prev().before(row);
    else console.log("return")

    updateTableRow();
  };
  return button;
}

function createInspectElement(inspectFor, step) {

  let inspectElement = document.createElement("div"),
      subDiv = document.createElement("div"),
      button = document.createElement('button');

  inspectElement.setAttribute('class', 'input-group');
  inspectElement.appendChild(createInputBox(''));

  subDiv.setAttribute('class', 'input-group-append');

  button.setAttribute('class', 'btn text-dark input-group-text')
  button.setAttribute('id', ('inspectBtn_' + step));
  button.innerHTML = '<i class="fas fa-search-plus"></i>';
  button.onclick = function (e) {
    console.log('INSPECT ELEMENT CLICK')
  };
  subDiv.appendChild(button);
  inspectElement.appendChild(subDiv);
  return inspectElement;
}

function createSelectElement(items, editable = true) {
  // Create and append select list
  let selectList = document.createElement("select");
  selectList.setAttribute('class', 'form-control')
  if (!editable) selectList.setAttribute('disabled', 'true')

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
  input.setAttribute("value", data ? data: '');
  if (!editable) input.setAttribute('disabled', 'true')
  return input;
}

function updateTableRow() {
  const rows = table.tBodies[0].rows;

  for (i = 0; i < rows.length; i++) {
    rows[i].cells[0].innerHTML = i + 1;    // Update step cell

    // Make first row's up and last row's down disable
    const step = rows[i].getAttribute("id").split('_')[1];
    document.getElementById("up_" + step).disabled = false;
    document.getElementById("down_" + step).disabled = false;
    if(i === 0) document.getElementById("up_" + step).disabled = true;
    else if(i === rows.length - 1) document.getElementById("down_" + step).disabled = true;
  }
}

function createSubTable(data, step) {

  const param_table = document.createElement("table");
  param_table.setAttribute('class', 'sub-table');
  param_table.setAttribute('id', 'table_' + step);

  for (let key in data) {
    createSubTableRow(param_table, key, data[key], step, false);
  }
  return param_table;
}

function addRow(data, indexAt = -1) {
  let tr = table.tBodies[0].insertRow(indexAt);
  if (!data['step']) {
    data['step'] = currentStep + 1;
    inspectElementList.push(data)
  }
  currentStep = data['step'];
  tr.setAttribute('id', ('step_' + currentStep));
  for (let key in data) {
    let cell = tr.insertCell(-1);
    if (key === "actions") {
      cell.appendChild(createEditButton(currentStep));
      cell.appendChild(createDeleteButton(currentStep));
      cell.appendChild(createSaveButton(currentStep));
      cell.appendChild(createCloseButton(currentStep));
      cell.appendChild(createDuplicateButton(currentStep));
      cell.appendChild(createAddNewButton(currentStep));
      cell.appendChild(createUpDownButton(currentStep, 1)); //down
      cell.appendChild(createUpDownButton(currentStep, -1)); // up
    } else if(key === "param") {
      const sub_table = createSubTable(data['param'], currentStep);
      cell.appendChild(sub_table);
    } else if (key === "command") {
      const cmdDropdown = createSelectElement(cmd, false)
      cmdDropdown.setAttribute('id', (key + '_' + currentStep))
      cmdDropdown.value = data[key];
      cell.appendChild(cmdDropdown);
    } else {
      cell.innerHTML = currentStep;
      // cell.innerHTML = (table.tBodies[0].rows.length);
    }
  }
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
  let tr = head.insertRow(-1);                                       // table row.


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

  const body = table.createTBody();
  // add json data to the table as rows.
  for (i = 0; i < inspectElementList.length; i++) {
    addRow(inspectElementList[i]);
  }

  // Now, add the newly created table with json data, to a container.
  let divShowData = document.getElementById('showData');
  divShowData.innerHTML = "";
  divShowData.appendChild(table);
  updateTableRow();
}
