let contextMenus = chrome.contextMenus;


chrome.runtime.onInstalled.addListener(function () {
  contextMenus.create({
                        title:    "Assert that...",
                        id:       "assert...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title:    "this element is present",
                        id:       "assertElementPresent",
                        parentId: "assert...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title:    "this element has the text as shown",
                        id:       "assertText",
                        parentId: "assert...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title:    "this input element has the current value",
                        id:       "assertValue",
                        parentId: "assert...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title:    "the selected text is present",
                        id:       "assertTextPresent",
                        parentId: "assert...",
                        contexts: ["selection"]
                      });

  contextMenus.create({
                        title:    "Wait until...",
                        id:       "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title:    "this element is available",
                        id:       "waitForElementPresent",
                        parentId: "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title:    "this element is visible",
                        id:       "waitUntilVisible",
                        parentId: "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title:    "this element is enabled",
                        id:       "waitUntilEnabled",
                        parentId: "wait...",
                        contexts: ["all"]
                      });
  contextMenus.create({
                        title:    "the selected text is found",
                        id:       "waitForText",
                        parentId: "wait...",
                        contexts: ["selection"]
                      });
});

function callbackContextmenu(info, tab, data) {
  chrome.tabs.sendMessage(tab.id,
                          {action: "getContextMenuElement", command: data},
                          {frameId: info.frameId},
                          response => { if (response && response.res && response.res === 'contextmenu') { } });
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  let command = null;
  console.log('command %%%%%%%%%%%   ', command)
  // Todo: text value presnet in Img
  switch (info.menuItemId) {
    case 'assertElementPresent':
      command = 'assertElementPresent(locator)';
      break;
    case 'assertText':
      command = 'assertText(locator,text)';
      break;
    case 'assertValue':
      command = 'assertValue(locator,value)';    // Input, textarea, select, radio, checkbox, Img
      break;
    case 'assertTextPresent':
      command = 'assertTextPresent(text)';
      break;
    case 'waitForElementPresent':
      command = 'waitForElementPresent(locator,waitMs)';
      break;
    case 'waitUntilVisible':
      command = 'waitUntilVisible(locator,waitMs)';
      break;
    case 'waitUntilEnabled':
      command = 'waitUntilEnabled(locator,waitMs)';
      break;
    case 'waitForText':
      command = 'waitForTextPresent(text)';     // text in div, p, span, i
      break;
  }
  callbackContextmenu(info, tab, command);
});
