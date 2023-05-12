const STATUS_START = 'start';
const STATUS_PAUSE = 'paused';
const STATUS_STOP = 'stop';
const STATUS_CLEAR = 'clear';
const clickEvt = 'click';
const STATUS_MIDDLE_START = 'middle_start';

function createSelectElement(items, id, editable = true) {
	// Create and append select list
	let selectList = document.createElement('select');
	selectList.setAttribute('class', 'form-control selectElement');
	selectList.setAttribute('id', id);


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

		if (optionText && optionText.startsWith('user defined locator=')) {
			optionText = optionText.split("=")[1];
		}
		option.value = optionText;
		option.text = optionText;

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
