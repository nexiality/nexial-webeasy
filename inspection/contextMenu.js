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
  chrome.tabs.sendMessage(tab.id, {action: "getContextMenuElement", payload: data}, {frameId: info.frameId}, response => {
    if(response.res === 'contextmenu') {
      console.log('--------------------------------Final push for context menu ', response.data)
      inspectElementList.push(response.data);
      console.log('inspectElementList ----- ', inspectElementList)
      // data.step = response.step;
      // for (let key in response.param) {
      //   if ((data.param).hasOwnProperty(key)) {
      //     data.param[key] = response.param[key]
      //   }
      // }
    }
  });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  let data = {
      step   : '',
      command: '',
      param:   {},
      actions: {}
    };
  // Todo: text value presnet in Img
  switch(info.menuItemId) {
    case 'assertElementPresent':
      data.command = 'assertElementPresent(locator)';
      data.param['locator'] = '';
      break;
    case 'assertTextPresent':
      data.command = 'assertTextPresent(text)';
      data.param['text'] = '';
      break;
    case 'assertValue':
      data.command = 'assertValue(locator,value)';
      data.param['locator'] = '';         // Input, textare, selectbox, radio, checkbox, Img
      data.param['value'] = '';
      break;
    case 'waitForElementPresent':
      data.command = 'waitForElementPresent(locator,waitMs)';
      data.param['locator'] = '';
      data.param['waitMs'] = '';
      break;
    case 'waitForText':
      data.command = 'waitForTextPresent(text)';
      data.param['text'] = '';           // text in div, p, span, i
      break;
    case 'waitUntilVisible':
      data.command = 'waitUntilVisible(locator,waitMs)';
      data.param['locator'] = '';
      data.param['waitMs'] = '';
      break;
  }
  callbackContextmenu(info, tab, data);
});

