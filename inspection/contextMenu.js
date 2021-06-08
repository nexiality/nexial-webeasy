let contextMenus = chrome.contextMenus;

// contextMenus.removeAll(function () {
chrome.runtime.onInstalled.addListener(function() {
  contextMenus.create({
                        title   : "AssertElementPresent",
                        id      : "assertElementPresent",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "AssertTextPresent",
                        id      : "assertTextPresent",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "AssertValue",
                        id      : "assertValue",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "Wait...",
                        id      : "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "WaitForElementPresent",
                        id      : "waitForElementPresent",
                        parentId: "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "WaitForText",
                        id      : "waitForText",
                        parentId: "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "WaitUntilVisible",
                        id      : "waitUntilVisible",
                        parentId: "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "WaitUntilEnabled",
                        id      : "waitUntilEnabled",
                        parentId: "wait...",
                        contexts: ["all"]
                      });
});

function callbackContextmenu(info, tab, data) {
  chrome.tabs.sendMessage(tab.id, {action: "getContextMenuElement", command: data}, {frameId: info.frameId}, response => {
    if(response.res === 'contextmenu') { }
  });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  var command = null;
  console.log('command %%%%%%%%%%%   ', command)
  // Todo: text value presnet in Img
  switch(info.menuItemId) {
    case 'assertElementPresent':
      command = 'assertElementPresent(locator)';
      break;
    case 'assertTextPresent':
      command = 'assertTextPresent(text)';
      break;
    case 'assertValue':
      command = 'assertValue(locator,value)';    // Input, textare, selectbox, radio, checkbox, Img
      break;
    case 'waitForElementPresent':
      command = 'waitForElementPresent(locator,waitMs)';
      break;
    case 'waitForText':
      command = 'waitForTextPresent(text)';     // text in div, p, span, i
      break;
    case 'waitUntilVisible':
      command = 'waitUntilVisible(locator,waitMs)';
      break;
  }
  callbackContextmenu(info, tab, command);
});

