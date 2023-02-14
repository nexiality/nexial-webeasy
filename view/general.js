const STATUS_START = 'start';
const STATUS_PAUSE = 'paused';
const STATUS_STOP = 'stop';
const STATUS_CLEAR = 'clear';
const clickEvt = 'click';

function createSelectElement(items, id, editable = true) {
	// Create and append select list
	let selectList = document.createElement('select');
	selectList.setAttribute('class', 'form-control');
	selectList.setAttribute('id', id);
	// console.log(id, items);
	//localStore?.get(["selectorsPreferences"], (result) => {
	//preferredSelectors = result?.selectorsPreferences ? result?.selectorsPreferences : "";

	if (!editable) {
		selectList.setAttribute('disabled', 'true');
	}

	//Create and append the options
	let optgroup = '',
		optgroupLabel = '';
	for (let index = 0; index < items.length; index++) {
		if (items[index]) {
			if (items[index].includes('=') && optgroupLabel !== items[index].split('=')[0]) {
				optgroupLabel = items[index].split('=')[0];
				optgroup = document.createElement('optgroup');
				optgroup.setAttribute('label', optgroupLabel.toUpperCase());
			}
		}

		let optionText = items[index];
		let option = document.createElement('option');
		// remove `xpath=` here so that we can copy a more efficient/shorter locator to Nexial script
		if (optionText && optionText.startsWith('xpath=')) {
			optionText = optionText.substring(6);
		}
		option.value = optionText;
		option.text = optionText;
		// console.log(optgroup);
		if (id.indexOf('locator') > -1) {
			if (preferredSelectors?.indexOf(optgroupLabel) == -1) {
				optgroup?.setAttribute('style', 'display:none;');
			}
		}

		if (optgroup) {
			optgroup.appendChild(option);
			selectList.appendChild(optgroup);
		} else {
			selectList.appendChild(option);
		}

	}
	//});
	return selectList;
}
