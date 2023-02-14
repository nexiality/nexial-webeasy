/* Declare variables */
let isClick = 1;
let focusedInput = null;
let step = null;
const HAS_ATTRIBUTES = ['name', 'id', 'aria-label', 'placeholder', 'title', 'alt', 'class', 'value', 'type']; //Order priority wise
const CLICKABLE_ELEMENT = [
	'button',
	'a',
	'li',
	'path',
	'svg',
	'i',
	'span',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'label',
	'img',
];
const FIND_CLICKED_ELEMENT_PARENT = ['path', 'svg', 'i', 'span'];
const FIND_PARENTS = ['form', 'header', 'main', 'section', 'footer', 'div'];
const INNER_TEXT_LENGTH = 100;
const NODE_LIST_HAS_TEXT = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const INPUT_TAGS = ['INPUT', 'TEXTAREA'];
const INPUT_TYPE_ELEMENT = ['text', 'number', 'email', 'password', 'search', 'tel', 'url'];
const INPUT_CLICKABLE_TYPES = ['submit', 'reset', 'image', 'button'];
const INPUT_TOGGLE_TYPES = ['radio', 'checkbox'];
const HAS_PARENT = ['label', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button']; //, "div", "span"]; // placed Orderwise
const ATTRIB_HUMAN_READABLE = ['aria-label', 'placeholder', 'title', 'alt'];
let localStore = chrome?.storage?.local;
let varNameForWaitTime;
let waitTimeSetInPreference;

// Append Style on hover get element and show locator window
let style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';

style.href = chrome.runtime.getURL('resources/style/nexial.css');
(document.head || document.documentElement).appendChild(style);

/**
 * To start inspecting
 * @param {*} stepValue Its a number of inspect
 */
function start(stepValue) {
	sendConsole('log', 'BROWSER RECEIVED: START INSPECTING');
	step = stepValue + 1;
	focusedInput = null;
	clickedElement = null;
	document.addEventListener('focus', handleFocus, true);
	document.addEventListener('mousedown', onClickElement);
	document.addEventListener('mouseup', onMouseUp);
	document.addEventListener('change', handleChange);

	localStore?.get(['preferences'], (result) => {
		//console.log(result);
		varNameForWaitTime = result?.preferences?.varName;
		waitTimeSetInPreference = result?.preferences?.waitTimeSetInPreference;
	});
}

/**
 * To stop inspecting
 */
function stop() {
	document.removeEventListener('focus', handleFocus, true);
	document.removeEventListener('mousedown', onClickElement);
	document.removeEventListener('change', handleChange);
}

/**
 * Focus event Handler
 * @param {*} event its a event object contains a number of properties that describe the focus event
 */
function handleFocus(event) {
	if (event === undefined) event = window.event;
	let target = 'target' in event ? event.target : event.srcElement;

	if (!INPUT_TAGS.includes(target.tagName)) return;

	if (INPUT_TYPE_ELEMENT.includes(target.type) || target.tagName === 'TEXTAREA') {
		// any previously trapped focusedInput?
		if (focusedInput) {
			sendInspectInfo('type(locator,value)', focusedInput);
		}
		focusedInput = event;
		sendConsole('log', 'INPUT FOCUS:', target);
	}

	target.addEventListener('keyup', function (event) {
		// Number 13 is the "Enter" key on the keyboard
		if (event.keyCode === 13 && focusedInput && target.tagName !== 'TEXTAREA') {
			event.preventDefault();
			focusedInput.target.value += '{ENTER}';
			sendConsole('log', 'INPUT ENTER PRESS :', focusedInput.target.value);
			sendInspectInfo('typeKeys(locator,value)', focusedInput);
			focusedInput = null;
		}
	});
}

/**
 * click event handler
 * @param {*} event its a event object contains a number of properties that describe the click event
 */
function onClickElement(event) {
	// adding 'mousemove' to track whether something is being highlighted and not clicked
	document.addEventListener('mousemove', onMoveElement);
}

function onMoveElement(event) {
	isClick = 0;
}
function onMouseUp(event) {
	// removing 'mousemove' because it's not required after user is done selecting some text
	document.removeEventListener('mousemove', onMoveElement);

	if (event === undefined) event = window.event;
	let target = 'target' in event ? event.target : event.srcElement;

	if (event.button === 2) {
		return;
	}

	if (focusedInput?.target.value) {
		sendConsole('log', 'INPUT FOCUSOUT: ', focusedInput.target);
		sendInspectInfo('waitForElementPresent(locator,waitMs)', event);
		sendInspectInfo('type(locator,value)', focusedInput);
		focusedInput = null;
	}
	if ((target.tagName === 'DIV' && target.innerText) || CLICKABLE_ELEMENT.includes(target.tagName.toLowerCase())) {
		sendConsole('log', 'CLICK: ', target.tagName);
		sendInspectInfo('waitForElementPresent(locator,waitMs)', event);
		sendInspectInfo('click(locator)', event);
		return;
	}

	if (target.tagName === 'INPUT') {
		if (INPUT_CLICKABLE_TYPES.includes(target.type)) {
			sendInspectInfo('waitForElementPresent(locator,waitMs)', event);
			sendInspectInfo('click(locator)', event);
			return;
		}
		if (INPUT_TOGGLE_TYPES.includes(target.type)) {
			sendInspectInfo(target.checked ? 'checkAll(locator,waitMs)' : 'uncheckAll(locator,waitMs)', event);
			return;
		}
	}
}

/**
 * Select element changeEvent handler
 * @param {*} event its a event object contains a number of properties that describe the change event
 */
function handleChange(event) {
	if (event === undefined) event = window.event;
	let target = 'target' in event ? event.target : event.srcElement;

	if (target.tagName === 'SELECT') {
		sendConsole('log', 'SELECT: ', target.tagName);
		sendInspectInfo('select(locator,text)', event);
	}
}

function hasNumbers(str) {
	return /\d/g.test(str);
}

/** check that there's no special character and number i.e only alphabet */
function isAcceptableClass(str) {
	return !str.startsWith('ng_') && !str.startsWith('ng-') && /^[A-Za-z][A-Za-z\_\-]+[0-9A-Za-z\_\-]$/.test(str);
}

/** trim extra space and replace new line with \n */
function updatingText(txt) {
	let replaced = txt.trim().replace(/\s+/g, ' ');
	return replaced.indexOf("'") === -1 ? "'" + replaced + "'" : "concat('" + replaced.replace(/'/g, "',\"'\",'") + "')";
}

function cssAttrSelector(name, value) {
	if (!name || !value) {
		return '';
	}

	// remove \r, escape single quotes
	let replaced = value.replace(/\r/g, '').replace(/'/g, "\\\\'");

	// simple case: no newline chars
	if (replaced.indexOf('\n') === -1) {
		return '[' + name + "='" + replaced + "']";
	}

	// complex case: found newline chars
	// split by newline and transform them into groups of [name='line']
	let parts = replaced.split('\n');
	return parts.map((part) => '[' + name + "='" + part + "']").join('');
}

/**
 * creating list of base and relative path of css and xpath selectors
 * @param {*} el its element's target
 * @param {*} baseXpathNode base xpath of element
 * @param {*} baseCssPath base css path of element
 * @param {*} isFiltered its having boolean to inform path is filteres or not
 * @returns create path list
 */
function createPaths(el, baseXpathNode, baseCssPath, isFiltered) {
	let res = {
		xpath: [],
		css: [],
	};

	if (baseXpathNode) baseXpathNode = baseXpathNode.replace('xpath=', '');

	if (baseCssPath && !isFiltered) {
		baseCssPath = baseCssPath.replace('css=', ' > ');
	} else {
		baseCssPath = baseCssPath.replace('css=', ' ');
	}

	for (const attr in el.attribute) {
		let value = el.attribute[attr];
		if (attr === 'class') {
			if (res['xpath'].length) return res;
			const classList = el.attribute['class'];
			for (let j = 0; j <= classList.length - 1; j++) {
				if (isAcceptableClass(classList[j])) {
					res['xpath'].push('xpath=//' + el.node + `[contains(@class,'${classList[j]}')]` + baseXpathNode);
					res['css'].push('css=' + el.node + `.${classList[j]}` + baseCssPath);
				}
			}
		} else {
			if (attr === 'for') break;
			res['xpath'].push('xpath=//' + el.node + `[@${attr}='${value}']` + baseXpathNode);
			res['css'].push('css=' + el.node + (attr === 'id' ? `#${value}` : `[${attr}='${value}']`) + baseCssPath);

			// special treatment for input element
			if (el.node === 'input' && attr !== 'type' && el.attribute.hasOwnProperty('type')) {
				res['xpath'].push(
					'xpath=//' + el.node + `[@${attr}='${value}' and @type='${el.attribute['type']}']` + baseXpathNode
				);
				res['css'].push(
					'css=' +
					el.node +
					(attr === 'id' ? `#${value}` : `[${attr}='${value}']`) +
					`[type='${el.attribute['type']}']` +
					baseCssPath
				);
			}
		}
	}
	return res;
}

/**
 * Take three parameter and to find locator of active element
 * @param {*} e its refer event.target
 * @param {*} paths its a active element's dom path lsit
 * @param {*} isFiltered its having boolean value is path is filtered or not
 * @returns
 */
function getLocator(e, paths, isFiltered) {
	let locator = [],
		xpath = [],
		css = [],
		selectedLocator = null;
	// console.log(paths);
	const activeElnode = paths[paths.length - 1].node;

	if (e.id) locator.push('id=' + e.id);
	if (e.name) locator.push('name=' + e.name);

	for (let i = paths.length - 1; i >= 0; i--) {
		const el = paths[i];
		if (el.attribute['class']) {
			el.attribute['class'] = el.attribute['class'].split(' ');
		}
		if (i === paths.length - 1) {
			// Main Element with all attribute
			// Xpath=//tagname[@attribute='value']
			let path = createPaths(el, '', '', isFiltered);
			if (path) {
				xpath = path.xpath;
				css = path.css;
			}

			if (el.node === 'label' && el.attribute?.for) {
				path = createPaths(el.attribute['for'], '', '', isFiltered);
				xpath.concat(path.xpath);
				css.concat(path.css);
			}

			if (el.innerText?.length <= INNER_TEXT_LENGTH) {
				let compareText = updatingText(el.innerText);
				// use `text()` when possible for added accuracy
				let xpathViaText =
					'xpath=//' +
					el.node +
					(!el.children || el.children.length < 1
						? `[normalize-space(text())=${compareText}]`
						: `[normalize-space(string(.))=${compareText}]`);
				xpath.push(xpathViaText);
				// if (NODE_LIST_HAS_TEXT.includes(el.node)) { selectedLocator = xpathViaText; }
				if (!selectedLocator || (selectedLocator.length > xpathViaText.length && !selectedLocator.startsWith('css='))) {
					selectedLocator = xpathViaText;
				}
			}
		} else {
			// Relative XPath: //div[@class='something']//h4[1]//b[1]
			let activeElxpath = xpath[0] ? xpath[0] : 'xpath=//' + activeElnode;
			let activeElcss = css[0] ? css[0] : 'css=' + activeElnode;

			const relativePaths = createPaths(el, activeElxpath, activeElcss, isFiltered);
			if (relativePaths) {
				xpath = xpath.concat(relativePaths.xpath);
				css = css.concat(relativePaths.css);
			}
		}
	}

	locator = locator.concat(css, xpath);
	if (!selectedLocator) {
		selectedLocator = locator[0];
	}

	return {
		locator: locator,
		selectedLocator: selectedLocator,
	};
}

/**
 * create and return object having element properties(i.e id, class, and so on)
 * @param {*} el its element value
 * @returns created element property object
 */
function createNode(el) {
	let node = {};
	node['node'] = el.nodeName.toLowerCase();
	node['innerText'] = el.textContent || el.text || el.innerText;
	node['attribute'] = [];
	if (el.hasAttributes()) {
		for (let i = 0; i <= HAS_ATTRIBUTES.length - 1; i++) {
			const attr = el.attributes[`${HAS_ATTRIBUTES[i]}`];
			if (attr?.name && attr.value) node['attribute'][attr.name] = attr.value;
		}
	}
	// special case for label: label often has a target (attribute:for). we can use the target to derive locators
	if (node['node'] === 'label' && el.attributes?.for) {
		const labelFor = el.attributes['for'].value;
		const labelEl = document.getElementById(labelFor);
		node['attribute']['for'] = createNode(labelEl);
	}
	return node;
}

/**
 * collecting dom path of active element
 * @param {*} el collecting path of el
 * @returns path of el
 */
function getDomPath(el) {
	// sendConsole("group", "DOM PATH LIST");
	let stack = [];
	while (el.parentNode != null) {
		if (['html', 'body'].includes(el.nodeName.toLowerCase())) {
			el = el.parentNode;
			continue;
		}
		stack.unshift(createNode(el));
		// sendConsole("log", "ENTRY NODE : ", node["node"]);
		el = el.parentNode;
	}
	// sendConsole("groupEnd", "");
	// console.log("stack in DOm path", stack);
	return stack;
}

/**
 * filtering dom path's to find main parent and ansestor
 * @param {*} el
 * @returns filter dom path list
 */
function filterDomPath(el) {
	let domPathList = getDomPath(el);
	let domFilterList = [];

	for (let i = 0; i < HAS_PARENT.length; i++) {
		const index = domPathList.findIndex((x) => x.node === HAS_PARENT[i]);
		// console.log(HAS_PARENT[i], index);
		if (index !== -1) {
			domPathList.length = index + 1;
			break;
		}
	}
	// sendConsole("log", "DOM PATH FILTER : ", domPathList);
	for (let index = 0; index < domPathList.length; index++) {
		const node = domPathList[index];
		// console.log(node['node'])
		if (FIND_PARENTS.includes(node['node']) || index === domPathList.length - 1) {
			if (node['node'] === 'div') {
				if (node.attribute?.id || node.attribute?.class) {
					domFilterList.push(node);
				}
			} else domFilterList.push(node);
		}
	}

	if (domFilterList.length > 1)
		return {
			domPaths: domFilterList,
			isFiltered: true,
		};
	return {
		domPaths: domPathList,
		isFiltered: false,
	};
}

/**
 * finding xpath selector after validation if no locator left
 * @param {*} element el is element
 * @returns return xpath of provided element
 */
function getXPath(element) {
	//Todo: sort in simple form
	if (element.id !== '') return '//*[@id="' + element.id + '"]';
	if (element === document.body) return element.tagName.toLowerCase();

	let ix = 0;
	let siblings = element.parentNode.childNodes;
	for (let i = 0; i < siblings.length; i++) {
		let sibling = siblings[i];
		if (sibling === element)
			return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
		if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
			ix++;
		}
	}
}

/**
 * finding css selector after validation if no locator left
 * @param {*} el its element
 * @returns css path of provided element
 */
function getCssPath(el) {
	//Todo: sort in simple form
	if (!(el instanceof Element)) return;

	let path = [];
	while (el.nodeType === Node.ELEMENT_NODE) {
		let selector = el.nodeName.toLowerCase();
		if (el.id) {
			selector += '#' + el.id;
			path.unshift(selector);
			break;
		} else {
			let sib = el,
				nth = 1;
			while ((sib = sib.previousElementSibling)) {
				if (sib.nodeName.toLowerCase() === selector) nth++;
			}
			selector += ':nth-of-type(' + nth + ')';
		}
		path.unshift(selector);
		el = el.parentNode;
	}
	return path.join(' > ');
}

// test locators; remove invalid ones
/**
 * Its validate Locator list, on base of css, xpath, id and name and return validated ones
 * @param {*} locatorList  its locator list
 */
function validateLocators(locatorList) {
	let filtered = locatorList.locator.filter((locator) => {
		if (locator.startsWith('css=')) {
			let css = locator.substring(4);
			let matches = document.querySelectorAll(css);
			// sendConsole("log", "testing css selector " + css, matches);
			return matches?.length === 1;
		}
		if (locator.startsWith('xpath=')) {
			let xpath = locator.substring(6);
			let matches = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
			// sendConsole("log", "testing xpath selector " + xpath, matches);
			// must return exactly 1 result
			if (matches?.resultType === 4) {
				if (!matches.iterateNext()) return false;
				return !matches.iterateNext();
			} else {
				return false;
			}
		}
		if (locator.startsWith('name=')) {
			let name = locator.substring(5);
			let matches = document.getElementsByName(name);
			return matches?.length === 1;
		}
		if (locator.startsWith('id=')) {
			return document.getElementById(locator.substring(3));
		}
		return true;
	});
	// console.log(locatorList);
	locatorList.locator = filtered;

	if (filtered && (!locatorList.selectedLocator || !filtered.includes(locatorList.selectedLocator))) {
		locatorList.selectedLocator = filtered[0];
	}

	if (filtered) {
		let xpathLocators = [], cssLocators = [], idLocators = [], nameLocators = []
		filtered.forEach((item) => {
			if (item.startsWith('id=')) {
				idLocators.push(item);
			}
			else if (item.startsWith('css=')) {
				cssLocators.push(item);
			}
			else if (item.startsWith('xpath=')) {
				xpathLocators.push(item);
			}
			else if (item.startsWith('name=')) {
				nameLocators.push(item);
			}
		})

		locatorList.cssSelector = cssLocators.length > 0 ? cssLocators[0] : "";
		locatorList.xpathLocator = xpathLocators.length > 0 ? xpathLocators[0] : "";
		locatorList.idLocator = idLocators.length > 0 ? idLocators[0] : "";
		locatorList.nameLocator = nameLocators.length > 0 ? nameLocators[0] : "";

	}
}

/**
 * creating all possible locator's list
 * @param {*} event its a event object contains a number of properties that describe the event that passed to this function on its occurrence
 * @returns created locator list after filter
 */
function getLocatorList(event) {
	const paths = filterDomPath(event.target);

	const locatorList = getLocator(event.target, paths.domPaths, paths.isFiltered);

	// sendConsole("log", "DOM PATH LIST : ", paths.domPaths);
	// sendConsole("log", "IS DOM-PATH-LIST FILTERED : ", paths.isFiltered);
	// sendConsole('log', 'LOCATOR LIST (filtered? ' + paths.isFiltered + '): ', locatorList);

	validateLocators(locatorList);
	if (!locatorList.locator.length) {
		locatorList.locator = ['css=' + getCssPath(event.target), 'xpath=' + getXPath(event.target)];
		locatorList.selectedLocator = null;
	}
	return locatorList;
}

/**
 * get command and event and send payload to background (chrome Extension file)
 * Its creating locator(css and xpath) list
 * @param {*} command its a nexial web command
 * @param {*} event its a event object contains a number of properties that describe the event that passed to this function on its occurrence
 */
function sendInspectInfo(command, event) {
	let locatorList = getLocatorList(event);
	let locator = locatorList.locator;
	let selectedLocator = locatorList.selectedLocator;
	let data = {
		step: step++,
		command: command,
		param: {},
		actions: {
			selectedLocator: selectedLocator,
			cssSelector: locatorList.cssSelector,
			xpathLocator: locatorList.xpathLocator,
			idLocator: locatorList.idLocator
		},
	};



	switch (command) {
		case 'click(locator)':
		case 'assertElementPresent(locator)':
		case 'assertChecked(locator)':
		case 'assertNotChecked(locator)':
			data.param['locator'] = locator;
			break;
		case 'type(locator,value)':
		case 'typeKeys(locator,value)':
		case 'assertValue(locator,value)':
			data.param['locator'] = locator;
			data.param['value'] = event.target.value || '(empty)';
			break;
		case 'assertText(locator,text)':
			data.param['locator'] = locator;
			if (event.target.tagName === 'SELECT') data.param['text'] = event.target[event.target.selectedIndex].text;
			else data.param['text'] = event.target.textContent || event.target.innerText || '<MISSING>';
			break;
		case 'select(locator,text)':
			data.param['locator'] = locator;
			data.param['text'] = event.target[event.target.selectedIndex].text;
			break;
		case 'assertTextPresent(text)':
		case 'waitForTextPresent(text)':
			data.param['text'] = selectionText || event.target.innerText || '<MISSING>';
			break;
		case 'waitForElementTextPresent(locator,text)':
			data.param['locator'] = locator;
			data.param['text'] = selectionText || event.target.innerText || '<MISSING>';
			break;
		case 'waitForElementPresent(locator,waitMs)':
		case 'waitUntilVisible(locator,waitMs)':
		case 'waitUntilEnabled(locator,waitMs)':
			data.param['locator'] = locator;
			data.param['waitMs'] = varNameForWaitTime ? '${' + varNameForWaitTime + '}' : '25000';
			break;
		case 'checkAll(locator,waitMs)':
		case 'uncheckAll(locator,waitMs)':
			data.param['locator'] = locator;
			data.param['waitMs'] = '<MISSING>';
			break;
	}


	// ToDo: for payload create user define datatype
	const payload = {
		cmd: 'inspecting',
		value: data,
	};

	if (!chrome || !chrome.runtime || !payload) return;
	sendConsole('log', 'SEND PAYLOAD :', payload);

	chrome.runtime.sendMessage(payload);
}

document.addEventListener(
	'contextmenu',
	function (event) {
		clickedElement = event;
	},
	true
);

/**
 * Chrome Extension API
 * here used to communicate with background
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.action) {
		case 'getContextMenuElement':
			selectionText = request.selectionText;
			if (!clickedElement) {
				console.error('No element found');
				break;
			}
			sendInspectInfo(request.command, clickedElement);
			clickedElement = null;
			break;
		case STATUS_START:
			start(request.startStep);
			break;
		case STATUS_STOP:
			stop();
			step = null;
			focusedInput = null;
			clickedElement = null;
			break;
		case STATUS_PAUSE:
			stop();
			break;
		case 'findLocator':
			if (!clickedElement) {
				console.error('No element found');
				break;
			}
			createUI(getLocatorList(clickedElement).locator);
			clickedElement = null;
			break;
	}
	sendConsole('info', `BROWSER : ${request.action} INSPECTING`);
	// }
	sendResponse();
	return true;
});
