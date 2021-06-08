let contextMenus = chrome.contextMenus;

// contextMenus.removeAll(function () {
chrome.runtime.onInstalled.addListener(function() {
  contextMenus.create({
    title   : "Assert that...",
    id      : "assert...",
    contexts: ["all"]
  });
  contextMenus.create({
                        title   : "This element is present",
                        id      : "assertElementPresent",
                        parentId: "assert...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "This element has the text shown",
                        id      : "assertTextPresent",
                        parentId: "assert...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "This input element has the current value",
                        id      : "assertValue",
                        parentId: "assert...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "Wait until...",
                        id      : "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "This element is available",
                        id      : "waitForElementPresent",
                        parentId: "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "The selected text is found",
                        id      : "waitForText",
                        parentId: "wait...",
                        contexts: ["selection"]
                      });
  contextMenus.create({
                        title   : "This element is visible",
                        id      : "waitUntilVisible",
                        parentId: "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title   : "This element is enabled",
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

