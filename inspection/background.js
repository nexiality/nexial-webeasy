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
	createOpenURLEntry(url);
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
 * add and remove badge from extension icon
 */
function updateBadge() {
	localStore?.get([INSPECT_STATUS], (result) => {
		let inspectStatus = result?.inspectStatus;
		localStore?.get([INSPECT_TAB], (result2) => {
			let inspectingTab = result2.inspectingTab ? result2.inspectingTab : null;
			if (inspectStatus === STATUS_START && inspectingTab) {
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
function loadListener(url) {
	printLog('log', 'CREATE OPEN URL ENTRY');
	localStore?.get([INSPECT_LIST], (result1) => {
		let inspectElementList = result1?.inspectList;
		localStore?.get([STEP], (result2) => {
			inspectElementList.push({
				step: result2?.step,
				command: 'open(url)',
				param: { url: url },
				actions: '',
			});
			localStore?.set({ inspectList: inspectElementList }, () => { });
		});
	});
}

/**
 * Open new tab if url exits and record inspecting tab
 * @param {*} url Its a web address
 */
function createOpenURLEntry(url) {
	if (url) {
		chrome.tabs.create({ url: url }, function (tab) {
			printLog('log', 'OPEN NEW PAGE');
			localStore?.set({ inspectingTab: JSON.parse(JSON.stringify(tab)) }, () => { });
			printLog(inspectingTab);
			updateBadge();
			loadListener(url);
		});
	} else {
		chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
			if (!tabs || tabs.length < 1) {
				return;
			}
			printLog('log', 'CURRENT PAGE');
			inspectingTab = JSON.parse(JSON.stringify(tabs[0]));
			localStore?.set({ inspectingTab: inspectingTab }, () => { });
			printLog(inspectingTab);
			loadListener(inspectingTab.url);
			updateBadge();
		});
	}
}

/**
 * Used to communicated
 * @param {*} message its a data that we want to pass
 */
function sendRunTimeMessage(message) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]) {
			chrome.tabs.sendMessage(tabs[0].id, message);
		}
	});
}

/**
 * fetch and return current active tab
 * @returns current tab
 */
async function getCurrentTab() {
	let queryOptions = { active: true, currentWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
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
chrome.runtime.onMessage.addListener((action, sender, sendResponse) => {
	switch (action.cmd) {
		case 'inspecting': {
			localStore?.get([INSPECT_LIST], function (result) {
				if (result?.inspectList !== undefined) {
					inspectElementList = result?.inspectList;
				}
				inspectElementList.push(action.value);
				localStore?.set({ inspectList: inspectElementList }, () => { });
			});
			break;
		}
		case 'console':
			printLog(action.type, action.msg, action.data);
			break;
		case STATUS_START:
			start(action?.url);
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
	return true;
});


