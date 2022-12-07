let inspectElementList = [];
let height = '98px';

function resizePopupWindow() {
	if (window.innerHeight < 150) {
		document.getElementById('nexial-container').style.height = '350px';
	}
}

function openDocLink(url) {
	chrome.tabs.create({ 'url': url }, (tab) => { });
}

function info(title, text) {
	document.getElementById('infoModalLabel').innerHTML = title;
	document.getElementById('infoModelBody').innerHTML = text;
}

function clear() {
	let table = document.getElementById('inspect_table');
	while (table && table.hasChildNodes()) {
		table.removeChild(table.firstChild);
	}
	inspectElementList = [];
	document.getElementById('inspectDataOption').style.display = 'none';
	chrome.runtime.sendMessage({ cmd: STATUS_CLEAR }, (response) => { });
}

function createScript() {
	let delim = '\t';
	let script = '';

	for (let i = 0; i < inspectElementList.length; i++) {
		script += 'web' + delim + inspectElementList[i].command + delim;
		for (let parameter in inspectElementList[i].param) {
			const el = document.getElementById(parameter + '_' + inspectElementList[i].step);
			if (el && el.tagName && el.tagName === 'SELECT') {
				script += (el.selectedOptions ? el.selectedOptions[0].text : el.options[0].text) + delim;
			} else {
				script += (el && el.value ? el.value : '<MISSING>') + delim;
			}
		}
		script += '\n';
	}
	return script;
}

function validURL(myURL) {
	let pattern = new RegExp(
		'^(http(s)?://.)' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + //port
		'(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$',
		'i'
	);
	return pattern.test(myURL);
}

function start() {
	document.getElementById('stopOption').style.display = 'block';
	document.getElementById('showStatus').style.display = 'block';
	document.getElementById('startOption').style.display = 'none';
	document.getElementById('showData').style.display = 'none';
	document.getElementById('inspectDataOption').style.display = 'none';
}

function stop() {
	document.getElementById('startOption').style.display = 'flex';
	document.getElementById('showData').style.display = 'none';
	document.getElementById('inspectDataOption').style.display = 'none';
	document.getElementById('stopOption').style.display = 'none';
	document.getElementById('showStatus').style.display = 'none';

	chrome.storage?.local?.get(['inspectList'], (result) => {
		if (result?.inspectList?.length > 0) {
			document.getElementById('showData').style.display = 'block';
			document.getElementById('inspectDataOption').style.display = 'block';
			tableFromJson();
		}
	});
}

function pause() {
	start();
	pauseInspect.value = 'Resume';
}

function setClasses(/*String*/ id, /*String*/ classes) {
	document.getElementById(id).setAttribute('class', classes);
}

let maximizePopup = document.getElementById('maximizePopup');
let closePopup = document.getElementById('closePopup');
let startInspect = document.getElementById('startInspect');
let nowInspect = document.getElementById('nowInspect');
let pauseInspect = document.getElementById('pauseInspect');
let stopInspect = document.getElementById('stopInspect');
let showHelp = document.getElementById('showHelp');
let copyToNexial = document.getElementById('copyToNexial');
let clearInspection = document.getElementById('clear');

pauseInspect.addEventListener(
	clickEvt,
	function () {
		pauseInspect.classList.toggle('btn-default');
		pauseInspect.classList.toggle('btn-primary');
		if (pauseInspect.value === 'Pause') {
			pauseInspect.value = 'Resume';
			chrome.runtime.sendMessage({ cmd: STATUS_PAUSE }, (response) => { });
		} else {
			pauseInspect.value = 'Pause';
			start();
			chrome.runtime.sendMessage({ cmd: STATUS_START }, (response) => { });
		}
	},
	false
);

startInspect.addEventListener(clickEvt, function () {
	let url = document.getElementById('url').value.trim();
	if (!validURL(url)) {
		let validFeedback = document.getElementsByClassName('valid-feedback')[0];
		validFeedback.classList.add('d-block');
		document.getElementById('url').value = '';
		return;
	}
	start();
	chrome.runtime.sendMessage({ cmd: STATUS_START, url }, (response) => { });
});
startInspect.addEventListener('mouseover', () => setClasses('startInspectInfo', 'badge badge-focus'));
startInspect.addEventListener('mouseout', () => setClasses('startInspectInfo', 'badge'));

nowInspect.addEventListener(
	clickEvt,
	function () {
		chrome?.storage?.local.get(['inspectList'], (result) => {
			if (result?.inspectList?.length > 0) {
				const response = confirm(
					'There are some steps already captured once you start inspecting it will clear previous steps.?'
				);
				if (response) {
					start(null);
					$('#inspect_table').remove();
					chrome.runtime.sendMessage({ cmd: STATUS_START }, (response) => { });
				}
			} else {
				start(null);
				chrome.runtime.sendMessage({ cmd: STATUS_START }, (response) => { });
			}
		});
	},
	false
);
nowInspect.addEventListener('mouseover', () => setClasses('nowInspectInfo', 'badge badge-focus'));
nowInspect.addEventListener('mouseout', () => setClasses('nowInspectInfo', 'badge'));

stopInspect.addEventListener(clickEvt, function () {
	stop();
	chrome.runtime.sendMessage({ cmd: STATUS_STOP }, (response) => { });
});

showHelp.addEventListener(
	clickEvt,
	function () {
		openDocLink(`${HELP_URL}`);
	},
	false
);

maximizePopup.addEventListener(clickEvt, async () => {
	await chrome.tabs.create({ url: chrome.runtime.getURL('NexialWebEZ.html') });
});

closePopup.addEventListener(
	clickEvt,
	function () {
		window.close();
	},
	false
);

copyToNexial.addEventListener(
	clickEvt,
	function () {
		let dummy = document.body.appendChild(document.createElement('textarea'));
		chrome?.storage?.local.get(['inspectList'], (result) => {
			inspectElementList = result?.inspectList;
			dummy.value = createScript();
			document.body.appendChild(dummy);
			dummy.focus();
			dummy.select();
			document.execCommand('copy');
			document.body.removeChild(dummy);
		});
	},
	false
);
copyToNexial.addEventListener('mouseover', () => setClasses('copyToNexialInfo', 'badge badge-focus'));
copyToNexial.addEventListener('mouseout', () => setClasses('copyToNexialInfo', 'badge'));

clearInspection.addEventListener(clickEvt, clear);
clearInspection.addEventListener('mouseover', () => setClasses('clearInfo', 'badge badge-focus'));
clearInspection.addEventListener('mouseout', () => setClasses('clearInfo', 'badge'));

document.getElementById('startInspectInfo').addEventListener(
	clickEvt,
	function () {
		resizePopupWindow();
		info(
			'Inspect',
			'Enter a valid URL and click on this button to start the WebEZ inspection ' +
			'process on the specified URL . WebEZ will capture and inspect your mouse ' +
			'clicks and keyboard inputs (when interacting with a form). Additionally, ' +
			'you may add waits ' +
			'and assertions via the context menu. When you are ' +
			'done interacting with your browser, return back to WebEZ and click on ' +
			'"Stop".' +
			'<div style="text-align: center"><img' +
			' src="https://nexiality.github.io/documentation/webez/image/inspect.gif"' +
			' alt="HOWTO: Inspect" style="width:90%;margin:5px 0"/></div>'
		);
	},
	false
);

document.getElementById('nowInspectInfo').addEventListener(
	clickEvt,
	function () {
		resizePopupWindow();
		info(
			'Inspect Current Page',
			'Click this button to start the WebEZ inspection process on the current ' +
			'web page. WebEZ will capture and inspect your mouse clicks and keyboard ' +
			'inputs (when interacting with a form). Additionally, you may add waits ' +
			'and assertions via the context menu. When you are done interacting with ' +
			'your browser, return back to WebEZ and click on "Stop".' +
			'<div style="text-align: center"><img' +
			' src="https://nexiality.github.io/documentation/webez/image/inspect-now.gif"' +
			' alt="HOWTO: Inspect Now" style="width:90%;margin:5px 0"/></div>'
		);
	},
	false
);

document.getElementById('clearInfo').addEventListener(
	clickEvt,
	function () {
		info(
			'Clear',
			'Use this button to clear away all the captured steps. Please note that ' +
			'there is no Undo for this functionality.'
		);
	},
	false
);

document.getElementById('copyToNexialInfo').addEventListener(
	clickEvt,
	function () {
		resizePopupWindow();
		info(
			'Copy to Nexial script',
			'Use this button to copy the current steps and commands to clipboard. ' +
			'Open up the test scenario of your choosing, then perform Paste (' +
			'<code>CTRL+v</code> for Windows, <code>COMMAND+v</code> for Mac) on a ' +
			'"cmd type" cell. Edit the copied steps as needed. Be sure to set your ' +
			'browser type via <code>nexial.browser</code> System variable before ' +
			'running the script' +
			'<div style="text-align: center"><img' +
			' src="https://nexiality.github.io/documentation/webez/image/copy-to-nexial.gif"' +
			' alt="HOWTO: Copy to Nexial" style="width:90%;margin:5px 0"/></div>'
		);
	},
	false
);

window.onload = function () {
	chrome.storage?.local?.get(['inspectStatus'], (result) => {
		let inspectStatus = result?.inspectStatus;
		if (inspectStatus === STATUS_START) start();
		else if (inspectStatus === STATUS_PAUSE) pause();
		else if (inspectStatus === STATUS_STOP) stop();
	});
};
