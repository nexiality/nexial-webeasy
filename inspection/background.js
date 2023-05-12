importScripts('../env.js');
importScripts('../resources/scripts/console.js');
importScripts('./contextMenu.js');

const INSPECT_LIST = 'inspectList';
const INSPECT_STATUS = 'inspectStatus';
const STEP = 'step';
const INSPECT_TAB = 'inspectingTab';

const STATUS_START = 'start';
const STATUS_PAUSE = 'paused';
const STATUS_STOP = 'stop';
const STATUS_CLEAR = 'clear';
const STATUS_MIDDLE_START = 'middle_start';

let localStore = chrome?.storage?.local;

localStore?.get([INSPECT_STATUS], (result) => {
	localStore?.set({ inspectStatus: result?.inspectStatus || STATUS_STOP }, () => { });
});

localStore?.get([INSPECT_LIST], (result) => {
	localStore?.set({ inspectList: result?.inspectList ? result?.inspectList : [] }, () => { });
});

localStore?.get([INSPECT_TAB], (result) => {
	localStore?.set({ inspectingTab: result?.inspectingTab ? result?.inspectingTab : null }, () => { });
});

localStore?.get([STEP], (result) => {
	localStore?.set({ step: result?.step ? result?.step : '1' }, () => { });
});

/**
 * Send message to start Inspection
 * @param {*} url Its a web address
 */
function start(url) {
	printLog('group', `BACKGROUND RECEIVED START INSPECTING`);
	localStore?.get([INSPECT_LIST], (result) => {
		localStore?.set({ inspectList: result?.inspectList ? result?.inspectList : [] }, () => { });
	});

	localStore?.set({ inspectStatus: STATUS_START }, () => { });
	createOpenURLEntry(url, false);
	sendRunTimeMessage({ action: STATUS_START, startStep: 1 });
}

/**
 * Send message to stop inspection
 */
function stop() {
	printLog('groupend', `BACKGROUND RECEIVED STOP INSPECTING`);
	localStore?.set({ inspectStatus: STATUS_STOP }, () => { });
	sendRunTimeMessage({ action: STATUS_STOP });
	updateBadge();

}

/**
 * Send message to pause inspection
 */
function pause() {
	printLog('log', `BACKGROUND RECEIVED PAUSE INSPECTING`);
	localStore?.set({ inspectStatus: STATUS_PAUSE }, () => { });
	sendRunTimeMessage({ action: STATUS_PAUSE });
	updateBadge();
}

/**
 * clear inspected list
 */
function clear() {
	localStore?.set({ inspectList: [] }, () => { });
	updateBadge();
}

/** 
	Start Inspection in middle of step
**/
function startInMiddle(url, step) {
	printLog('group', `BACKGROUND RECEIVED START INSPECTING IN MIDDLE`);

	localStore?.get([INSPECT_LIST], (result) => {
		localStore?.set({ inspectList: result?.inspectList ? result?.inspectList : [] }, () => { });
	});

	localStore?.get(['isInspectInMiddle'], (result) => {
		if (result?.isInspectInMiddle == 'true') {
			chrome.runtime.sendMessage({ startInspectingInMiddle: "CallInMiddle" });

			localStore?.set({ inspectStatus: STATUS_MIDDLE_START }, () => { });
			createOpenURLEntry(url, true);
			sendRunTimeMessage({ action: STATUS_MIDDLE_START, startStep: step });

		}
	});
}

/**
 * add and remove badge from extension icon
 */
function updateBadge() {
	localStore?.get([INSPECT_STATUS], (result) => {
		let inspectStatus = result?.inspectStatus;
		localStore?.get([INSPECT_TAB], (result2) => {
			let inspectingTab = result2.inspectingTab ? result2.inspectingTab : null;
			if ((inspectStatus === STATUS_START && inspectingTab) || (inspectStatus === STATUS_MIDDLE_START && inspectingTab)) {
				chrome.action.setBadgeBackgroundColor({ color: 'red' });
				chrome.action.setBadgeText({ tabId: inspectingTab.tabId, text: ' ' });
			} else {
				chrome.action.setBadgeText({
					tabId: inspectingTab ? inspectingTab.tabId : null,
					text: '',
				});
			}
		});
	});
}

/**
 * add open url inspection in inspectElementList
 * @param {*} url Its a web address
 */
function loadListener(url, isInspectInMiddle) {
	printLog('log', 'CREATE OPEN URL ENTRY');
	console.log(isInspectInMiddle);
	if (!isInspectInMiddle)
		localStore?.get([INSPECT_LIST], (result1) => {
			let inspectElementList = result1?.inspectList;
			localStore?.get([STEP], (result2) => {
				localStore?.get(['preferences'], (result3) => {
					let step = result2?.step;
					if (result3.preferences?.varName && result3.preferences?.waitTimeSetInPreference) {
						inspectElementList.push({
							step: step,
							command: 'save(var,value)',
							param: { value: result3.preferences?.waitTimeSetInPreference, locator: result3.preferences?.varName },
							actions: '',
						})
					}

					inspectElementList.push({
						step: step++,
						command: 'open(url)',
						param: { url: url },
						actions: '',
					});
					localStore?.set({ inspectList: inspectElementList }, () => { });
				})
			});
		});
}

/**
 * Open new tab if url exits and record inspecting tab
 * @param {*} url Its a web address
 */
async function createOpenURLEntry(url, isInspectInMiddle) {
	if (url && !isInspectInMiddle) {
		chrome.tabs.create({ url: url }, function (tab) {
			printLog('log', 'OPEN NEW PAGE');
			localStore?.set({ inspectingTab: JSON.parse(JSON.stringify(tab)) }, () => { });
			loadListener(url);
			updateBadge();
		});
	}
	else if (isInspectInMiddle) {
		let queryOptions = { active: true, currentWindow: true };
		let [tabs] = await chrome.tabs.query(queryOptions);
		await localStore?.set({ inspectingTab: tabs }, () => { });
		await loadListener((tabs?.url ? tabs?.url : url), true);
		updateBadge();

	}
	else {
		chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
			if (!tabs || tabs.length < 1) {
				return;
			}
			printLog('log', 'CURRENT PAGE');
			localStore?.set({ inspectingTab: JSON.parse(JSON.stringify(tabs[0])) }, () => { });
			loadListener(JSON.parse(JSON.stringify(tabs[0])).url);
			updateBadge();
		});
	}
}

/**
 * Used to communicated
 * @param {*} message its a data that we want to pass
 */
async function sendRunTimeMessage(message) {

	let queryOptions = { active: true, currentWindow: true };
	let [tabs] = await chrome.tabs.query(queryOptions);
	await localStore?.set({ inspectingTab: tabs }, () => { });
	// console.log(await tabs);
	//chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	if (tabs) {
		chrome.tabs.sendMessage(tabs.id, message);
	}
	//});
}

/**
 * fetch and return current active tab
 * @returns current tab
 */
async function getCurrentTab() {
	let queryOptions = { active: true, currentWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return await tab;
}

/**
 * Chrome Extension Api for more help https://developer.chrome.com/docs/extensions/mv3/content_scripts/
 */
let injectIntoTab = function (tab) {
	let scripts = chrome.manifest.content_scripts[0].js;
	for (const item of scripts) {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			file: [item],
		});
	}
};

// Get all windows
/**
 * Chrome Extension Api for more help https://developer.chrome.com/docs/extensions/reference/windows/
 */
chrome.windows.getAll({ populate: true }, function (windows) {
	for (let i = 0; i < windows.length; i++) {
		let currentTabs = getCurrentTab();
		for (let j = 0; j < currentTabs.length; j++) {
			let currentWindowTab = currentTabs[j];
			// Skip chrome:// and https:// pages
			if (currentWindowTab.url && !currentWindowTab.url.match(/(chrome|https):\/\//gi)) {
				injectIntoTab(currentWindowTab);
			}
		}
	}
});

/**
 * Chrome Extension Api for more help https://developer.chrome.com/docs/extensions/reference/tabs/
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	localStore?.get([INSPECT_STATUS], (result1) => {
		let inspectStatus = result1?.inspectStatus;
		localStore?.get([STEP], (result2) => {
			if (inspectStatus === STATUS_START && changeInfo.status === 'complete') {
				sendRunTimeMessage({ action: inspectStatus, startStep: result2?.step });
				updateBadge();
			}
		});
	});

});

/**
 * Chrome Extension Api for more help https://developer.chrome.com/docs/extensions/reference/runtime/
 */
chrome.runtime.onMessage.addListener(async (action, sender, sendResponse) => {

	switch (action.cmd) {
		case 'inspecting': {

			localStore?.get([INSPECT_LIST], async function (result) {
				let inspectElementList = [];
				localStore?.get(['isInspectInMiddle'], async function (result2) {

					localStore?.get(["middleStepList"], async function (result4) {
						let middleInspectedList = await result4?.middleStepList ? result4?.middleStepList : [];
						if (result?.inspectList != undefined) {
							inspectElementList = await result?.inspectList;
						}

						if (result2.isInspectInMiddle == "true") {
							middleInspectedList.push(action?.value);
							localStore?.set({ "middleStepList": middleInspectedList }, () => { });
						}
						else {
							await inspectElementList.push(action.value);

						}

						await localStore?.set({ inspectList: inspectElementList }, () => { });
					});
				});
			});
			break;
		}
		case 'console':
			printLog(action.type, action.msg, action.data);
			break;
		case STATUS_START:
			start(action?.url);
			break;
		case STATUS_MIDDLE_START:
			startInMiddle(action?.url, action?.step);
			break;
		case STATUS_STOP:
			stop();
			break;
		case STATUS_CLEAR:
			clear();
			break;
		case STATUS_PAUSE:
			pause();
			break;
	}
	updateBadge();
	sendResponse();
	return await true;
});
