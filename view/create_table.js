let table = null,  currentStep = 0,  editMode = false;

function updateBackground() {
  chrome.runtime.getBackgroundPage((background) => {
    background.inspectElementList = inspectElementList;
  });
}

function getCurrentInspectObject(step) {
  let inspectObj = {
    step   : step,
    command: "",
    param:   {},
    actions: {}
  };
  inspectObj.command = document.getElementById("command_" + step).value;
  const paramArr = getCommandParam(inspectObj.command);
  for (let index = 0; index < paramArr.length; index++) {
    if(paramArr[index] === 'locator') {
      inspectObj.param[paramArr[index]] = getInspectListObject(step).param.locator;
      inspectObj.actions['selectedLocator'] = document.getElementById(paramArr[index] + "_" + step).value;
    } else inspectObj.param[paramArr[index]] = document.getElementById(paramArr[index] + "_" + step).value
  }
  return inspectObj;
}

function getInspectListObject(step) {
  return inspectElementList.find((obj) => obj.step === step);
}

function toggleElement(element, enable) {
  if (enable) {
    element.removeAttribute("disabled");
  } else {
    element.setAttribute("disabled", "true");
  }
}

function deleteSubTable(tableIndex) {
  let inspectTable = document.getElementById('table_' + tableIndex);
  while (inspectTable.hasChildNodes()) { inspectTable.removeChild(inspectTable.firstChild); }
}

function deleteSubTableRow(tableIndex, rowIndex) { document.getElementById('table_' + tableIndex).deleteRow(rowIndex); }

function deleteParentTableRow(rowIndex) { table.deleteRow(rowIndex); }

function createSubTableRow(param_table, key, data, step, editable) {
  let tr = param_table.insertRow(-1);
  let td = tr.insertCell(-1);
  let element = "";
  const id = key + "_" + step;
  td.setAttribute("title", key);

  if (key === "locator" && data) {
    element = createSelectElement(data, id, editable);
    const inspectListObject = getInspectListObject(step);
    if(inspectListObject.actions['selectedLocator'])
      element.value = inspectListObject.actions['selectedLocator'];
      element.onchange = function (e) {
        // ToDO:
      };
  } else if (key === "locator" && !data) element = createInspectElement(key, step);
  else element = createInputBox(data, id, editable); // param is other than locator

  // element.setAttribute("id", key + "_" + step);
  td.appendChild(element);
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
  const paramArr = getCommandParam(document.getElementById("command_" + step).value);
  const inspectListObj = getInspectListObject(step).param;
  for (let index = 0; index < paramArr.length; index++) {
    createSubTableRow(
      document.getElementById("table_" + step),
      paramArr[index],
      paramArr[index] === "locator" ? inspectListObj["locator"] : [],
      step,
      true
    );
  }
}

function editRow(step) {
  toggleEditable(step, true);
  document.getElementById("command_" + step).onchange = function (e) {
    document.getElementById("command_link_" + step).href = `${APP_DOC_URL}/${e.target.value}`;
    deleteSubTable(step);
    updateParamRow(step);
  };
}

function saveRow(step) {
  toggleEditable(step, false);
  let objIndex = inspectElementList.findIndex((obj) => obj.step === step);
  inspectElementList[objIndex] = getCurrentInspectObject(step);
  updateBackground();
  // console.log("AFTER SAVE : ", inspectElementList);
}

function toggleEditable(step, enable) {
  const paramArr = getCommandParam(document.getElementById("command_" + step).value);
  toggleElement(document.getElementById("command_" + step), enable);
  toggleActions(step, !enable);
  for (let index = 0; index < paramArr.length; index++) {
    const paramElement = document.getElementById(paramArr[index] + "_" + step);
    if(!paramArr.value) paramElement.value = '<MISSING>';
    toggleElement(paramElement, enable);
  }
}

function toggleActions(/*Number*/ i, /*Boolean*/ enable) {
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
    };
    addRow(payload, indexAt);
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
    const indexAt = document.getElementById('step_' + step).rowIndex;
    let payload = Object.assign({}, getInspectListObject(step));
    payload.step = '';
    addRow(payload, indexAt);
    updateTableRow();
    updateBackground();
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
    document.getElementById("step_" + step).remove();
    let index = inspectElementList.findIndex(stepIndex => stepIndex === step)
    if (index !== -1) inspectElementList.splice(index, 1);
    updateTableRow();
    updateBackground();
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
    saveRow(step);
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
    const rowIndex = document.getElementById('step_' + step).rowIndex;
    deleteParentTableRow(rowIndex);
    addRow(getInspectListObject(step), rowIndex - 1);
    updateTableRow();
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
    let row = $(this).closest('tr');
    const indexAt = document.getElementById('step_' + step).rowIndex;
    const totalRowCount = table.tBodies[0].rows.length;

    if(direction === 1 && indexAt !== totalRowCount) row.next().after(row);
    else if(direction !== 1 && indexAt !== 1) row.prev().before(row);
    else console.log("return")

    updateTableRow();
  };
  return button;
}

function createInspectElement(key, step) {
  let inspectElement = document.createElement("div"),
      subDiv = document.createElement("div"),
      button = document.createElement('button');

  inspectElement.setAttribute('class', 'input-group');
  inspectElement.appendChild(createInputBox('', key + "_" + step));

  subDiv.setAttribute('class', 'input-group-append');

  button.setAttribute('class', 'btn text-dark input-group-text')
  button.setAttribute('id', ('inspectBtn_' + step));
  button.innerHTML = '<i class="fas fa-search-plus"></i>';
  button.onclick = function (e) {
    // console.log('INSPECT ELEMENT CLICK')
  };
  subDiv.appendChild(button);
  inspectElement.appendChild(subDiv);
  return inspectElement;
}

function createInputBox(data, id, editable = true) {
  let input = document.createElement("INPUT");
  input.setAttribute("type", "text");
  input.setAttribute("class", "form-control");
  input.setAttribute("id", id);
  input.setAttribute("value", data ? data: '');
  if (!editable) input.setAttribute('disabled', 'true')
  return input;
}

function createDocLink(searchString, step) {
  const docLink = document.createElement("A");
  docLink.setAttribute("class", "command-link");
  docLink.setAttribute('id', ('command_link_' + step));
  docLink.innerHTML = `<i class="fas fa-external-link-alt"></i>`;
  
  docLink.onclick = function () {
    openDocLink(`${APP_DOC_URL}/${searchString}`);
  };
  return docLink;
}

function updateTableRow() {
  const rows = table.tBodies[0].rows;

  for (let i = 0; i < rows.length; i++) {
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
      const id = key + '_' + currentStep;
      const cmdDropdown = createSelectElement(cmd, id, false);
      cmdDropdown.setAttribute("class", "form-control command");
      cmdDropdown.value = data[key];

      cell.appendChild(cmdDropdown);
      cell.appendChild(createDocLink(data[key], currentStep))
    } else {
      cell.innerHTML = currentStep;
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
  const showDataDiv = document.getElementById('showData');
  $(showDataDiv).hide();
  showDataDiv.appendChild(table);

  // Create table header row using the extracted headers above.
  let head = table.createTHead();
  let tr = head.insertRow(-1);

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

  updateTableRow();
  $(showDataDiv).show();
}
