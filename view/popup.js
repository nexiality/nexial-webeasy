let inspectElementList = [];
let height = '98px';
// let localStore = chrome?.storage?.local;
let preferredSelectors;
function resizePopupWindow() {
	if (window.innerHeight < 150) {
		document.getElementById('nexial-container').style.height = '350px';
	}
}

function openDocLink(url) {
	chrome.tabs.create({'url': url}, (tab) => {});
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
	chrome.runtime.sendMessage({cmd: STATUS_CLEAR}, (response) => {});
}

function createScript() {
	let delim = '\t';
	let script = '';

	for (let i = 0; i < inspectElementList.length; i++) {
		script +=
			inspectElementList[i].command == 'save(var,value)'
				? 'base' + delim + inspectElementList[i].command + delim
				: 'web' + delim + inspectElementList[i].command + delim;
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
	selectPrefrences.style.display = 'none';
}

function stop() {
	document.getElementById('startOption').style.display = 'flex';
	document.getElementById('showData').style.display = 'none';
	document.getElementById('inspectDataOption').style.display = 'none';
	document.getElementById('stopOption').style.display = 'none';
	document.getElementById('showStatus').style.display = 'none';
	selectPrefrences.style.display = 'inline';

	localStore?.get(['inspectList'], function (result) {
		if (result?.inspectList?.length > 0) {
			document.getElementById('showData').style.display = 'block';
			document.getElementById('inspectDataOption').style.display = 'block';
			let inspectElementList = [];
			localStore?.get(['isInspectInMiddle'], function (result2) {
				if (result2.isInspectInMiddle == 'true') {
					localStore?.get(['middleStep'], (result3) => {
						localStore?.get(['middleStepList'], (result4) => {
							let middleStepNo = result3?.middleStep;
							let firstHalfInspectList = [];
							let secondHalfInspectList = [];
							let middleInspectedList = result4?.middleStepList;
							if (result?.inspectList != undefined) {
								inspectElementList = result?.inspectList;
							}

							// inspectElementList.splice((action?.value?.step - 1), 0, action?.value);
							firstHalfInspectList = inspectElementList.slice(0, middleStepNo);
							secondHalfInspectList = inspectElementList.slice(middleStepNo, inspectElementList.length);
							finalInspectList = [...firstHalfInspectList, ...middleInspectedList, ...secondHalfInspectList];
							localStore?.set({inspectList: finalInspectList}, () => {});
							tableFromJson();
						});
					});
				} else {
					tableFromJson();
				}
				localStore?.set({isInspectInMiddle: 'false'}, () => {});
			});
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
let selectPrefrences = document.getElementById('selectPrefrences');
let backArrow = document.getElementById('backArrow');
let submitPrefrences = document.getElementById('submitPrefrences');
let allButtonForSelectorPreference = document.getElementById('all');

pauseInspect.addEventListener(
	clickEvt,
	function () {
		pauseInspect.classList.toggle('btn-default');
		pauseInspect.classList.toggle('btn-primary');
		if (pauseInspect.value === 'Pause') {
			pauseInspect.value = 'Resume';
			chrome.runtime.sendMessage({cmd: STATUS_PAUSE}, (response) => {});
		} else {
			pauseInspect.value = 'Pause';
			start();
			chrome.runtime.sendMessage({cmd: STATUS_START}, (response) => {});
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
	chrome.runtime.sendMessage({cmd: STATUS_START, url}, (response) => {});
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
					chrome.runtime.sendMessage({cmd: STATUS_START}, (response) => {});
				}
			} else {
				start(null);
				chrome.runtime.sendMessage({cmd: STATUS_START}, (response) => {});
			}
		});
	},
	false
);
nowInspect.addEventListener('mouseover', () => setClasses('nowInspectInfo', 'badge badge-focus'));
nowInspect.addEventListener('mouseout', () => setClasses('nowInspectInfo', 'badge'));

stopInspect.addEventListener(clickEvt, function () {
	stop();
	$('#bottomRow').removeClass('alignToBottom');
	chrome.runtime.sendMessage({cmd: STATUS_STOP}, (response) => {});
});

selectPrefrences.addEventListener(clickEvt, function () {
	$('.row.content').css('display', 'none');
	$('.selectPrefrencesDiv').css('display', 'block');
	localStore?.get(['preferences'], (result) => {
		$('#waitTime').val(
			result?.preferences?.waitTimeSetInPreference == ''
				? 2500
				: result?.preferences?.waitTimeSetInPreference == 'clearedwaittime'
				? ''
				: result?.preferences?.waitTimeSetInPreference
		);
		$('#varNameWaitTime').val(
			result?.preferences?.varName == ''
				? 'defaultWaitTime'
				: result?.preferences?.varName == 'clearedvarname'
				? ''
				: result?.preferences?.varName
		);
	});
});

backArrow.addEventListener(clickEvt, function () {
	if (document.getElementById('inspect_table')) {
		document.getElementById('inspect_table').remove();
		tableFromJson();
	}

	$('.row.content').css('display', 'block');
	$('.selectPrefrencesDiv').css('display', 'none');
});

submitPrefrences.addEventListener(clickEvt, function (event) {
	if ($('#varNameWaitTime').val() == '' && $('#waitTime').val() != '') {
		alert('Var name for wait time is mandatory.');
		return;
	} else if ($('#varNameWaitTime').val() != '' && $('#waitTime').val() == '') {
		alert('Wait time is mandatory.');
		return;
	}
	let value = [];
	let varName = $('#varNameWaitTime').val() == '' ? 'clearedvarname' : $('#varNameWaitTime').val();
	let waitTime = $('#waitTime').val() == '' ? 'clearedwaittime' : $('#waitTime').val();

	$('#sortable')
		.children()
		.each(function () {
			value.push($(this).text());
		});

	let obj = {waitTimeSetInPreference: waitTime, varName: varName, selectors: value};

	localStore?.set({'preferences': obj}).then(() => {});

	alert('Preferences saved successfully.');
});

// allButtonForSelectorPreference.addEventListener(clickEvt, function (event) {
// 	if ($(this).prop('checked')) {
// 		$('#id,#css,#xpath').prop('checked', false);
// 	}
// })

// $('#id,#css,#xpath').click((event) => {
// 	if ($('#id').prop('checked') || $('#css').prop('checked') || $('#xpath').prop('checked')) {
// 		$('#all').prop('checked', false);
// 	}
// })

showHelp.addEventListener(
	clickEvt,
	function () {
		openDocLink(`${HELP_URL}`);
	},
	false
);

maximizePopup.addEventListener(clickEvt, async () => {
	await chrome.tabs.create({url: chrome.runtime.getURL('NexialWebEZ.html')});
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

document.getElementById('selectPrefrencesInfo').addEventListener(
	clickEvt,
	function () {
		info(
			'Preferences',
			'Various settings to control the behavior of Nexial WebEZ. Settings will be saved only to this computer; ' +
				'not synchronized across Chrome browsers on other devices.'
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
	localStore?.get(['inspectStatus'], (result) => {
		let inspectStatus = result?.inspectStatus;
		if (inspectStatus === STATUS_START || inspectStatus === STATUS_MIDDLE_START) start();
		else if (inspectStatus === STATUS_PAUSE) pause();
		else if (inspectStatus === STATUS_STOP) stop();
	});

	localStore?.get(['preferences'], (result) => {
		let temp = result?.preferences ? result?.preferences : {waitTimeSetInPreference: '', varName: '', selectors: []};
		let obj = temp ? JSON.parse(JSON.stringify(temp)) : temp;
		if (obj?.selectors.length > 0) {
			$('#sortable').html('');
			let selectorsHtml = [];

			obj?.selectors?.forEach((item) => {
				selectorsHtml.push(`<li class="list-group-item"> ${item} </li>`);
			});
			$('#sortable').append(selectorsHtml);
		}

		let waitTimeSetInPreference =
			obj?.waitTimeSetInPreference == '' ? 2500 : obj?.waitTimeSetInPreference == 'clearedwaittime' ? '' : '';
		let varName = obj?.varName == '' ? 'defaultWaitTime' : obj?.varName == 'clearedvarname' ? '' : '';

		$('#waitTime').val(waitTimeSetInPreference);
		$('#varNameWaitTime').val(varName);
		localStore.set({'preferences': obj}, (result) => {});
	});

	chrome?.runtime?.onMessage?.addListener((action, sender, sendResponse) => {
		if (action?.startInspectingInMiddle == 'CallInMiddle') {
			start();
		}
		sendResponse();
		return true;
	});

	setTimeout(() => {
		$('#sortable').sortable();
	}, 1000);
	localStore?.get(['inspectList'], (result) => {
		if (result?.inspectList?.length == 0) {
			$('#bottomRow').addClass('alignToBottom');
		} else {
			$('#bottomRow').removeClass('alignToBottom');
		}
	});
};
