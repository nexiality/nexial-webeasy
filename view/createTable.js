let table = null;
let currentStep = 0;
let editMode = false;
let newRowPosition;
let isClickedOnNewButton = false;
let localStore = chrome?.storage?.local;
/**
 * Update changes to background
 */
function updateBackground() {
	localStore?.get(['inspectList'], (result) => {
		if (result?.inspectList) {
			localStore?.set({ 'inspectList': result?.inspectList }, () => { });
		} else {
			localStore?.set({ 'inspectList': [] }, () => { });
		}
	});
}

/**
 * @param {*} step its take step value as input
 * @param inspectElementList
 * @returns Its returns inspected object from inspected table.
 */
function getCurrentInspectObject(step, inspectElementList) {
	let inspectObj = {
		step: step,
		command: '',
		param: {},
		actions: {},
	};
	inspectObj.command = document.getElementById('command_' + step).value;
	const paramArr = getCommandParam(inspectObj.command);
	for (let index = 0; index < paramArr.length; index++) {
		if (paramArr[index] === 'locator') {
			inspectObj.param[paramArr[index]] = getInspectListObject(step, inspectElementList).param.locator;
			inspectObj.actions['selectedLocator'] = document.getElementById(paramArr[index] + '_' + step).value;
		} else inspectObj.param[paramArr[index]] = document.getElementById(paramArr[index] + '_' + step).value;
	}
	if (inspectObj.param.locator === undefined) {
		inspectObj.param.locator = [inspectObj.actions.selectedLocator];
	}
	return inspectObj;
}

/**
 * Its find array of objects, which property matches step value
 * @param {*} step Its a property of inspect object
 * @param inspectList
 * @returns the value of the object in the inspectElementList array, otherwise undefined is returned
 */
function getInspectListObject(step, inspectList) {
	return inspectList?.find((obj) => obj.step === step);
}

/**
 * Toggle element enable and disable
 * @param {*} element Its element on which toggle performed
 * @param {*} enable Its contain boolean value to toggle element
 */
function toggleElement(element, enable) {
	if (enable) {
		element.removeAttribute('disabled');
	} else {
		element.setAttribute('disabled', 'true');
	}
}

/**
 * delete sub table whose index is passed as parameter
 * @param {*} tableIndex Its a sub table index
 */
function deleteSubTable(tableIndex) {
	let inspectTable = document.getElementById('table_' + tableIndex);
	while (inspectTable.hasChildNodes()) {
		inspectTable.removeChild(inspectTable.firstChild);
	}
}

/**
 * delete sub table's row whose table and row index are passed as parameter
 * @param {*} tableIndex Its a sub table index
 * @param {*} rowIndex Its a sub table's row index
 */
function deleteSubTableRow(tableIndex, rowIndex) {
	document.getElementById('table_' + tableIndex).deleteRow(rowIndex);
}

/**
 * Delete table from main inspect table
 * @param {*} rowIndex Its a main table's row index
 */
function deleteParentTableRow(rowIndex) {
	table.deleteRow(rowIndex);
}

/**
 * create row in sub table
 * @param {*} param_table Its sub table's target
 * @param {*} key Its a command param value
 * @param {*} data Its row data
 * @param {*} step Its a number of inspected action
 * @param {*} editable Its a boolean value to make row's enable and disable
 */
function createSubTableRow(param_table, key, data, step, editable) {
	let tr = param_table.insertRow(-1);
	let td = tr.insertCell(-1);
	let element = '';
	let selectedLocator = "";
	const id = key + '_' + step;
	td.setAttribute('title', key);
	if (key === 'locator' && data && Array.isArray(data)) {
		element = createSelectElement(data, id, editable);
		chrome?.storage?.local?.get(['inspectList'], (result) => {

			const inspectListObject = getInspectListObject(step, result?.inspectList);
			if (inspectListObject?.actions?.userSavedCustomLocator == undefined || inspectListObject?.actions?.userSavedCustomLocator == null) {
				$('#sortable').children().each(function () {
					let preferedOption = $(this).text();
					if (selectedLocator == "") {

						if (preferedOption?.trim() == 'Id' && inspectListObject?.actions['idLocator']?.length > 0) {
							selectedLocator = inspectListObject?.actions['idLocator'][0];
						}

						if (preferedOption?.trim() == 'Css' && inspectListObject?.actions['cssSelector']?.length > 0) {
							selectedLocator = inspectListObject?.actions['cssSelector'][0];
						}

						if (preferedOption?.trim() == 'Xpath' && inspectListObject?.actions['xpathLocator']?.length > 0) {
							selectedLocator = inspectListObject?.actions['xpathLocator'][0];
						}

						if (preferedOption?.trim() == 'Name' && inspectListObject?.actions['nameLocator']?.length > 0) {
							selectedLocator = inspectListObject?.actions['nameLocator'][0];
						}
					}
				})

				if (selectedLocator == "") {

					selectedLocator = inspectListObject?.actions['selectedLocator'];
				}

				if (selectedLocator != "" && selectedLocator != null) {

					element.value = selectedLocator.replace(/^xpath=/g, '');
				}
			}
			else {


				element.value = inspectListObject?.actions?.userSavedCustomLocator.replace(/^xpath=/g, '');

			}
			element.setAttribute('title', element.value);
		});
	} else if (key === 'locator' && !data) {
		element = createInspectElement(key, step);
	} else {
		element = createInputBox(data, id, editable, key);
	} // param is other than locator

	// element.setAttribute("id", key + "_" + step);
	td.appendChild(element);
	td.appendChild(createCopyIcon('param'));

	if ($(td).find('select').length > 0) {
		td.appendChild(createCustomOption('param', step));
	}

}

/**
 * To fetch command's param
 * @param {*} str its a command string
 * @returns Its return commands' param in array
 */
function getCommandParam(str) {
	if (!str || str === '') return [];

	let indexParamStart = str.lastIndexOf('(');
	if (indexParamStart === -1) return [];

	let indexParamEnd = str.lastIndexOf(')');
	if (indexParamEnd === -1) return [];

	let arr = str.substring(indexParamStart + 1, indexParamEnd).split(',');
	if (!arr) return [];
	if (arr[0] === '') return [];
	return arr;
}

/**
 * Update parameter cell of active row
 * @param {*} step its a inspectObject key to find object from inspectElementList
 */
function updateParamCell(step) {
	const paramArr = getCommandParam(document.getElementById('command_' + step).value);
	chrome?.storage?.local?.get(['inspectList'], (result) => {
		const inspectListObj = getInspectListObject(step, result?.inspectList).param;
		for (let index = 0; index < paramArr.length; index++) {
			createSubTableRow(
				document.getElementById('table_' + step),
				paramArr[index],
				paramArr[index] === 'locator' ? inspectListObj['locator'] : [],
				step,
				true
			);
		}
	});
}

/**
 * its allow to edit inspecting table row
 * @param {*} step its an inspected object key that refer object on which edit action is performed in inspectElementList
 */
function editRow(step) {
	toggleEditable(step, true);
	document.getElementById('command_' + step).onchange = function (e) {
		document.getElementById('command_link_' + step).href = `${APP_DOC_URL}/${e.target.value}`;
		deleteSubTable(step);
		updateParamCell(step);
	};
}

/**
 * its update current row object in inspectElementList
 * @param {*} step its an inspect object key that refer object on which save action is performed in inspectElementList
 */
function saveRow(step) {
	localStore?.get(['inspectList'], (result) => {
		toggleEditable(step, false);
		inspectElementList = result?.inspectList;
		let objIndex = inspectElementList.findIndex((obj) => obj.step === step);
		document.getElementById('locator_' + step).setAttribute('title', document.getElementById('locator_' + step).value);
		inspectElementList[objIndex] = getCurrentInspectObject(step, inspectElementList);
		localStore?.set({ 'inspectList': inspectElementList }, () => { });
		updateBackground();
	});
}

/**
 * Making row editable or disable according to enable parameter value
 * @param {*} step its an inspect object key
 * @param {*} enable its a boolean value to perform enable and disable
 */
function toggleEditable(step, enable) {
	const paramArr = getCommandParam(document.getElementById('command_' + step).value);
	toggleElement(document.getElementById('command_' + step), enable);
	toggleActions(step, !enable);
	for (let index = 0; index < paramArr.length; index++) {
		const paramElement = document.getElementById(paramArr[index] + '_' + step);
		if (!paramElement.value && !enable) paramElement.value = '<MISSING>';
		toggleElement(paramElement, enable);
	}
}

/**
 * Its help to enable action field buttons
 * @param {*} i its a step
 * @param {*} enable
 */
function toggleActions(/*Number*/ i, /*Boolean*/ enable) {
	document.getElementById('delete_' + i).style.display = enable ? 'inline-block' : 'none';
	document.getElementById('edit_' + i).style.display = enable ? 'inline-block' : 'none';
	document.getElementById('addNew_' + i).style.display = enable ? 'inline-block' : 'none';
	document.getElementById('duplicate_' + i).style.display = enable ? 'inline-block' : 'none';
	document.getElementById('up_' + i).style.display = enable ? 'inline-block' : 'none';
	document.getElementById('down_' + i).style.display = enable ? 'inline-block' : 'none';
	document.getElementById('save_' + i).style.display = enable ? 'none' : 'inline-block';
	document.getElementById('close_' + i).style.display = enable ? 'none' : 'inline-block';


}

/**
 * It creates 'Add below' button for action field to add new row below the active row
 * @param {*} step
 * @returns
 */
function createAddNewButton(step) {
	let button = document.createElement('button');
	button.setAttribute('class', 'btn text-dark');
	button.setAttribute('id', 'addNew_' + step);
	button.setAttribute('title', 'Add below');
	button.setAttribute('data-toggle', 'modal');
	button.setAttribute('data-target', '#exampleModal');

	button.innerHTML = '<i class="fas fa-plus"></i>';
	currentStep = step;
	button.onclick = function (e) {

		$("#inspectAddInMiddle").click(function () {
			$('#exampleModal').modal('toggle');
			localStore?.get(['inspectList'], (result) => {
				localStore?.set({ isInspectInMiddle: "true" }, () => { });
				chrome?.runtime?.sendMessage({ cmd: STATUS_MIDDLE_START, url: result?.inspectList[0]?.param?.url, step: step }, (response) => { });
			});
		});

		$("#manualStepAddInMiddle").click(function () {
			$('#exampleModal').modal('toggle');
			let noOfSteps = $("#inputForManualStepAdd").val() ? $("#inputForManualStepAdd").val() : 1;
			let manuallyAddedSteps = [];

			localStore?.get(['inspectList'], function (result) {
				let inspectElementList = result?.inspectList;
				let payload = {
					step: '',
					command: '',
					param: {},
					actions: {},
				};

				for (let index = 0; index < noOfSteps; index++) {
					const indexAt = step - 1;
					newRowPosition = step;
					isClickedOnNewButton = true;
					payload.step = step;
					inspectElementList.splice(step, 0, payload);
					manuallyAddedSteps.push(payload);
					addRow(payload, indexAt, false);
					step = step + 1;
				};

				chrome?.storage?.local.set({ 'inspectList': inspectElementList }, () => {
					resetIdsOfTables();
				});

			});

			updateTableRow();
			$('#url_1').next().css('left', '7%');
			$('.selectElement').parent().parent().next().find('input').css('width', '95%');
		});


	}
	return button;
}

/**
 * It creates duplicate button for action field to append duplicate row of active row
 * @param {*} step
 * @returns
 */
function createDuplicateButton(step) {
	let button = document.createElement('button');
	button.setAttribute('class', 'btn text-dark');
	button.setAttribute('id', 'duplicate_' + step);
	button.setAttribute('title', 'Duplicate');
	button.innerHTML = '<i class="fas fa-clone"></i>';
	button.onclick = function (e) {
		const indexAt = document.getElementById('step_' + step).rowIndex;
		chrome?.storage?.local?.get(['inspectList'], (result) => {
			let payload = Object.assign({}, getInspectListObject(step, result?.inspectList));
			let inspectElementList = result?.inspectList;
			payload.step = indexAt + 1;
			inspectElementList.splice((indexAt - 1), 0, payload);
			inspectElementList.forEach((item, index) => {
				item.step = index + 1;
			});
			addRow(payload, indexAt, true);
			chrome?.storage?.local.set({ 'inspectList': inspectElementList }, () => {
				resetIdsOfTables();
			});
		});
	};
	return button;
}

/**
 * It creates delete button for action field to delete active row
 * @param {*} step
 * @returns
 */
function createDeleteButton(step) {
	let button = document.createElement('button');
	button.setAttribute('class', 'btn text-dark delete-button ripple-surface');
	button.setAttribute('id', 'delete_' + step);
	button.setAttribute('title', 'Delete');
	button.innerHTML = '<i class="fa fa-trash"></i>';
	button.onclick = function (e) {
		document.getElementById('step_' + step).remove();
		localStore?.get(['inspectList'], (result) => {
			inspectElementList = result?.inspectList;
			let index = inspectElementList.findIndex((item) => item.step === step);
			if (index !== -1) inspectElementList.splice(index, 1);
			localStore?.set({ 'inspectList': inspectElementList }, () => {
				resetIdsOfTables();
			});
		});
	};
	return button;
}

/**
 * It creates edit button for action field to edit active row
 * @param {*} step
 * @returns
 */
function createEditButton(step) {
	let button = document.createElement('button');
	button.setAttribute('class', 'btn text-dark');
	button.setAttribute('id', 'edit_' + step);
	button.setAttribute('title', 'Edit');
	button.innerHTML = '<i class="fa fa-edit"></i>';
	button.onclick = function (e) {
		if (editMode) return;
		editMode = true;
		editRow(step);
	};
	return button;
}

/**
 * It creates save button for action field
 * @param {*} step
 * @returns
 */
function createSaveButton(step) {
	let button = document.createElement('button');
	button.setAttribute('class', 'btn text-dark');
	button.setAttribute('id', 'save_' + step);
	button.setAttribute('title', 'Save');
	button.setAttribute('style', 'display: none');
	button.innerHTML = '<i class="fa fa-check"></i>';
	button.onclick = function (e) {
		editMode = false;
		saveRow(step);
	};
	return button;
}

/**
 * To create close button for action field
 * @param {*} step
 * @returns
 */
function createCloseButton(step) {
	let button = document.createElement('button');
	button.setAttribute('class', 'btn text-dark');
	button.setAttribute('id', 'close_' + step);
	button.setAttribute('title', 'Close');
	button.setAttribute('style', 'display: none');
	button.innerHTML = '<i class="fa fa-times"></i>';
	button.onclick = function (e) {
		chrome?.storage?.local.get(['inspectList'], (result) => {
			inspectElementList = result?.inspectList;
			editMode = false;
			const rowIndex = document.getElementById('step_' + step).rowIndex;
			deleteParentTableRow(rowIndex);
			addRow(getInspectListObject(step, inspectElementList), rowIndex - 1, true);
			updateTableRow();
			$('#url_1').next().css('left', '7%');
			$('.selectElement').parent().parent().next().find('input').css('width', '95%');
		});

	};
	return button;
}

/**
 * To create either up or down button for action field
 * @param {*} step
 * @param {*} direction number value to indicate button property
 * @returns
 */
function createUpDownButton(step, direction) {
	let button = document.createElement('button');
	button.setAttribute('class', 'btn text-dark');
	if (direction === 1) {
		// create Down button
		button.innerHTML = '<i class="fas fa-arrow-down"></i>';
		button.setAttribute('title', 'Down');
		button.setAttribute('id', 'down_' + step);
	} else {
		button.innerHTML = '<i class="fas fa-arrow-up"></i>';
		button.setAttribute('title', 'Up');
		button.setAttribute('id', 'up_' + step);
	}

	button.onclick = function (e) {
		let row = $(this).closest('tr');
		const indexAt = document.getElementById('step_' + step).rowIndex;
		const totalRowCount = table.tBodies[0].rows.length;

		if (direction === 1 && indexAt !== totalRowCount) {
			row.next().find('td').eq(0).text(indexAt);
			row.next().after(row);
			row
				.find('td')
				.eq(0)
				.text(indexAt + 1);
			swapUpOrDownItemInArrow(indexAt, direction);
		} else if (direction !== 1 && indexAt !== 1) {
			row.prev().find('td').eq(0).text(indexAt);
			row.prev().before(row);
			row
				.find('td')
				.eq(0)
				.text(indexAt - 1);
			swapUpOrDownItemInArrow(indexAt, direction);
		} else {
			console.log('return');
		}
		// updateTableRow();

	};
	return button;
}

/**
 * It's a combination of input and button to create custom element
 * @param {*} key Its a command's parameter value
 * @param {*} step Its hold step value of object in which inspectElement added
 * @returns
 */
function createInspectElement(key, step) {
	let inspectElement = document.createElement('div');
	inspectElement.setAttribute('class', 'input-group');
	inspectElement.appendChild(createInputBox('', key + '_' + step, true, key));

	let subDiv = document.createElement('div');
	subDiv.setAttribute('class', 'input-group-append');

	let button = document.createElement('button');
	button.setAttribute('class', 'btn text-dark input-group-text');
	button.setAttribute('id', 'inspectBtn_' + step);
	button.innerHTML = '<i class="fas fa-search-plus"></i>';
	button.onclick = function (e) { };

	subDiv.appendChild(button);

	inspectElement.appendChild(subDiv);
	return inspectElement;
}

/**
 * Its frame multiple line data form input box value
 * @param {*} inputValue
 * @returns
 */
function handleMultiline(inputValue) {
	if (!inputValue) {
		return '';
	}
	return Array.isArray(inputValue) ? inputValue : inputValue.replaceAll('\r', '').replaceAll('\n', '(eol)');
}

/**
 * create input box for param field in sub table
 * @param {*} data  Its a value for input box
 * @param {*} id id attribute value
 * @param {*} editable Its boolean to set disable value of input box
 * @returns
 */
function createInputBox(data, id, editable = true, key) {
	let input = document.createElement('INPUT');
	input.setAttribute('type', 'text');
	input.setAttribute('class', 'form-control inputBox');
	input.setAttribute('id', id);
	input.setAttribute('value', handleMultiline(data));
	if (!editable) input.setAttribute('disabled', 'true');
	return input;
}

/**
 * create link icon to open web document
 * @param {*} searchString Its contain url of web command
 * @param {*} step Its a step key of object in which icon will append
 * @returns
 */
function createDocLink(searchString, step) {
	const docLink = document.createElement('A');
	docLink.setAttribute('class', 'command-link');
	docLink.setAttribute('id', 'command_link_' + step);
	docLink.setAttribute('title', `documentation for ${searchString}`);
	docLink.innerHTML = `<i class="fas fa-external-link-alt"></i>`;

	docLink.onclick = function () {
		openDocLink(`${APP_DOC_URL}/${searchString}`);
	};
	return docLink;
}

/**
 * Its is used to update row of inspect table
 */
function updateTableRow() {
	const rows = table.tBodies[0].rows;

	for (let i = 0; i < rows.length; i++) {
		rows[i].cells[0].innerHTML = i + 1; // Update step cell

		// update the ids for row

		rows[i].setAttribute('id', 'step_' + (parseInt(i) + 1));

		// Make first row's up and last row's down disable
		const step = rows[i].getAttribute('id').split('_')[1];
		if (document.getElementById('up_' + step) !== undefined) {
			document.getElementById('up_' + step).disabled = false;
		}

		if (document.getElementById('up_' + step) !== undefined) {
			document.getElementById('up_' + step).disabled = false;
		}

		if (i === 0 && document.getElementById('up_' + step) !== undefined) {
			document.getElementById('up_' + step).disabled = true;
		} else if (i === rows.length - 1 && document.getElementById('down_' + step) !== undefined) {
			document.getElementById('down_' + step).disabled = true;
		}

	}
}

/**
 * Create sub Table in param cell of inspect table
 * @param {*} data Its hold value of row's cell
 * @param {*} step Its step key of inserted object
 * @returns
 */
function createSubTable(data, step) {
	const param_table = document.createElement('table');
	param_table.setAttribute('class', 'sub-table');
	param_table.setAttribute('id', 'table_' + step);

	for (let key in data) {
		createSubTableRow(param_table, key, data[key], step, false);
	}
	return param_table;
}

/**
 * Its add row in inspect table and add different action's button (edit, delete and so on)
 * @param {*} data Its hold value of row's cell (like step, command, param)
 * @param {*} indexAt Its a rowIndex property That tell the position of a row in the rows of an inspect table
 * @param swapColumns
 */
function addRow(data, indexAt = -1, swapColumns) {
	let tr = table.tBodies[0].insertRow(indexAt);
	if (!data['step']) {
		data['step'] = newRowPosition + 1;

		localStore?.get(['inspectList'], (result) => {
			inspectElementList = result?.inspectList;
			inspectElementList.splice(newRowPosition, 0, data);
			if (isClickedOnNewButton) {
				inspectElementList.forEach((item, index) => {
					item.step = index + 1;
				});

				localStore?.set({ 'inspectList': inspectElementList }, () => { });
			}
		});
	}
	currentStep = data['step'];
	tr.setAttribute('id', 'step_' + currentStep);
	let keys = Object.keys(data);
	if (swapColumns) {
		[keys[3], keys[0]] = [keys[0], keys[3]];
	}

	for (let i = 0; i < keys.length; i++) {
		let key = keys[i];
		let cell = tr.insertCell(-1);
		if (key === 'actions') {
			cell.appendChild(createEditButton(currentStep));
			cell.appendChild(createDeleteButton(currentStep));
			cell.appendChild(createSaveButton(currentStep));
			cell.appendChild(createCloseButton(currentStep));
			cell.appendChild(createDuplicateButton(currentStep));
			cell.appendChild(createAddNewButton(currentStep));
			cell.appendChild(createUpDownButton(currentStep, 1)); //down
			cell.appendChild(createUpDownButton(currentStep, -1)); // up
			// cell.appendChild(createInspectButton(currentStep));
		} else if (key === 'param') {
			const sub_table = createSubTable(data['param'], currentStep);
			cell.appendChild(sub_table);
		} else if (key === 'command') {
			const id = key + '_' + currentStep;
			const cmdDropdown = createSelectElement(cmd, id, false);
			cmdDropdown.setAttribute('class', 'form-control command');
			cmdDropdown.value = data[key];
			cell.appendChild(cmdDropdown);
			cell.appendChild(createDocLink(data[key], currentStep));
			cell.appendChild(createCopyIcon('command'));
		} else {
			cell.innerHTML = currentStep;
		}
	}
}

/**
 * Its creates table structure from inspectElementList
 */
function tableFromJson() {
	let i;
	let col = [];
	let inspectElementList = [];

	localStore?.get(['inspectList'], (result) => {
		inspectElementList = result?.inspectList;
		inspectElementList.forEach((item, index) => {
			item.step = index + 1;
		});

		localStore?.set({ 'inspectList': inspectElementList }, () => {
			for (i = 0; i < inspectElementList.length; i++) {
				for (let key in inspectElementList[i]) {
					if (col.indexOf(key) === -1) {
						col.push(key);
					}
				}
			}

			// Create a table.
			table = document.createElement('table');
			table.setAttribute('class', 'table table-hover');
			table.setAttribute('id', 'inspect_table');
			table.setAttribute('cellspacing', '0');
			const showDataDiv = document.getElementById('showData');
			$(showDataDiv).hide();
			showDataDiv.appendChild(table);

			// Create table header row using the extracted headers above.
			let head = table.createTHead();
			let tr = head.insertRow(-1);

			// swapped columns as action column should come as last column.
			[col[3], col[0]] = [col[0], col[3]];

			// table header.
			for (i = 0; i < col.length; i++) {
				let heading =
					col[i] === 'command' ? 'command (web)' : col[i] === 'param' ? 'parameters' : col[i] === 'step' ? '#' : col[i];
				let th = document.createElement('th');
				th.innerHTML = heading;
				tr.appendChild(th);
			}

			const body = table.createTBody();

			// add json data to the table as rows.
			for (i = 0; i < inspectElementList.length; i++) {
				addRow(inspectElementList[i], -1, true);
			}

			updateTableRow();
			$(showDataDiv).show();
			$('#url_1').next().css('left', '7%');
			$('.selectElement').parent().parent().next().find('input').css('width', '95%');
		});
	});
}

/* function which swaps items up and down in table */
function swapUpOrDownItemInArrow(index, direction) {
	let isList = [];
	localStore?.get(['inspectList'], (result) => {
		isList = result?.inspectList;
		if (direction === 1) {
			[isList[index], isList[index - 1]] = [isList[index - 1], isList[index]];
			isList[index].step = index + 1;
			isList[index - 1].step = index;
		} else {
			[isList[index - 2], isList[index - 1]] = [isList[index - 1], isList[index - 2]];
			isList[index - 2].step = index - 2;
			isList[index - 1].step = index - 1;
		}
		localStore?.set({ 'inspectList': isList }, () => {
			resetIdsOfTables();
		});

	});
}

/**
 * create copy icon to copy web command and param
 * @returns
 */
function createCopyIcon(type) {
	const copyIcon = document.createElement('SPAN');
	copyIcon.innerHTML = `<i class="fas fa-copy"></i>`;
	copyIcon.setAttribute('title', 'copy');
	copyIcon.setAttribute('class', type === 'param' ? 'copyParamIcon' : 'copyicon');
	copyIcon.onclick = function (e) {
		let dummy = document.body.appendChild(document.createElement('textarea'));
		if (type === 'param') {
			copyIcon.setAttribute('class', 'copyParamIcon');
			dummy.value = $(e.currentTarget).prev().val();
		} else {
			dummy.value = $(e.currentTarget).prev().prev().val();
		}
		document.body.appendChild(dummy);
		dummy.focus();
		dummy.select();
		document.execCommand('copy');
		document.body.removeChild(dummy);
	};
	return copyIcon;
}

/**
 * create copy icon to copy web command and param
 * @returns
 */
function createCustomOption(type, step) {
	const customPathIcon = document.createElement('SPAN');
	customPathIcon.innerHTML = `<i class="fas fa-user-edit"></i>`;
	customPathIcon.setAttribute('title', 'Set Custom Locator');
	customPathIcon.setAttribute('class', 'customPathIcon');
	customPathIcon.onclick = function (e) {
		let flagToEdit = false, count = 0;
		let oldValueOfUserDefinedLocator = "";
		locatorCategory = $('#locator_' + step).find('option[value= "' + $('#locator_' + step).val() + '"]').parent().attr('label');
		customPathIcon.setAttribute('data-toggle', 'modal');
		customPathIcon.setAttribute('data-target', '#customLocator');
		
		if (locatorCategory == 'CSS' || locatorCategory == 'ID' || locatorCategory == 'XPATH') {
			$('#customLocatorSave').css('display', 'none');
			$('#customLocatorDelete').css('display', 'none');
		} else {
			$('#customLocatorSaveAs').css('display', 'block');
			$('#customLocatorSave').css('display', 'block');
			$('#customLocatorDelete').css('display', 'block');
		}
		$('#locator_' + step).find('option').each(function (index, item) {

			if (item.value == $('#locator_' + step).val()) {
				
				if ($(item).parent().attr('label').toLowerCase() == "user defined locator=") {
					oldValueOfUserDefinedLocator = $('#locator_' + step).val();
					$('#customLocatorInput').val($('#locator_' + step).val());
					count++;
				}
				else {
					oldValueOfUserDefinedLocator = $('#locator_' + step).val();
					$('#customLocatorInput').val($('#locator_' + step).val());
				}

			}
		})

		if (count > 0) {
			flagToEdit = true;
		}
		$("#customLocatorSave").unbind('click').click(function (e) {

			chrome?.storage?.local?.get(['inspectList'], (result) => {
				const inspectElementListObj = result?.inspectList;
				const indexOfLocator = inspectElementListObj[step - 1].param['locator']?.indexOf("user defined locator=" + oldValueOfUserDefinedLocator);

				$('#locator_' + step).find('option[value= "' + oldValueOfUserDefinedLocator + '"]').attr('value', $('#customLocatorInput').val());
				$('#locator_' + step).find('option[value="' + $('#customLocatorInput').val() + '"]').html($('#customLocatorInput').val());
				inspectElementListObj[step - 1].param['locator'][indexOfLocator] = "user defined locator=" + $('#customLocatorInput').val();
				inspectElementListObj[step - 1].actions.userSavedCustomLocator = $('#customLocatorInput').val();
				$('#locator_' + step).val($('#customLocatorInput').val());
				$('#locator_' + step).attr('title',$('#customLocatorInput').val());
				localStore?.set({ 'inspectList': inspectElementListObj }, () => {
				});

			});

		});

		$("#customLocatorSaveAs").unbind('click').click(function (e) {
			chrome?.storage?.local?.get(['inspectList'], (result) => {
				const inspectElementListObj = result?.inspectList;
				let userDefinedLocator;
				let selectedValue = $('#customLocatorInput').val();
				userDefinedLocator = "user defined locator=" + selectedValue;
				inspectElementListObj[step - 1].param['locator'].push(userDefinedLocator);
				inspectElementListObj[step - 1].actions.userSavedCustomLocator = selectedValue;

				if ($('#locator_' + step).find('optgroup[label="USER DEFINED LOCATOR"]').length > 0) {

					if ($('#locator_' + step).find('optgroup[label="USER DEFINED LOCATOR"]').find('option[value= "' + selectedValue + '"]').length == 0) {
						let option = document.createElement('option');
						option.value = selectedValue;
						option.text = selectedValue;
						$('#locator_' + step).find('optgroup[label="USER DEFINED LOCATOR"]').append(option);
						$('#locator_' + step).val(selectedValue);
						$('#locator_' + step).attr('title',selectedValue);
					}
				}
				else {
					let optgroup = document.createElement('optgroup');
					optgroup.setAttribute('label', 'USER DEFINED LOCATOR');
					let option = document.createElement('option');
					option.value = selectedValue;
					option.text = selectedValue;
					optgroup.appendChild(option);
					$('#locator_' + step).append(optgroup);
					$('#locator_' + step).val(selectedValue);
					$('#locator_' + step).attr('title',selectedValue);
				}


				localStore?.set({ 'inspectList': inspectElementListObj }, () => {
				});


			});
		});

		$("#customLocatorDelete").unbind('click').click(function (e) {
			chrome?.storage?.local?.get(['inspectList'], (result) => {
				const inspectElementListObj = result?.inspectList;
				const locator = (oldValueOfUserDefinedLocator.indexOf("user defined locator=") > 0 ? oldValueOfUserDefinedLocator : ("user defined locator=" + oldValueOfUserDefinedLocator));
				const indexOfLocator = inspectElementListObj[step - 1].param['locator']?.indexOf(locator);
				inspectElementListObj[step - 1].param['locator'].splice(indexOfLocator, 1);
				$('#locator_' + step).find('option[value= "' + oldValueOfUserDefinedLocator + '"]').remove();
				inspectElementListObj[step - 1].actions.userSavedCustomLocator = undefined;
				localStore?.set({ 'inspectList': inspectElementListObj }, () => {
				});
			});
		});
	};
	return customPathIcon;
}

/* to Reset all ids of table and it's sub tables duplicate/sort/delete the steps */

function resetIdsOfTables() {
	if (document.getElementById('inspect_table') != null) {
		document.getElementById('inspect_table').remove();
	}
	tableFromJson();
}


