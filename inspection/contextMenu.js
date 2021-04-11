let contextMenus = chrome.contextMenus;
var currentContextmenu = '';

function getElement(info, tab) {
  Logger.debug("Word " + info.selectionText + " was clicked.");
  Logger.debug(info, tab);
}

contextMenus.removeAll(function () {
  // cm.create({title: "assertAttribute", id: "attributePresent", contexts: ["selection"]});
  contextMenus.create({
                        title   : "assertElementPresent",
                        id      : "assertElementPresent",
                        contexts: ["selection"]
                      });
  contextMenus.create({
                        title   : "assertTextPresent",
                        id      : "assertTextPresent",
                        contexts: ["selection"]
                      });
  contextMenus.create({
                        title   : "assertValue",
                        id      : "assertValue",
                        contexts: ["selection"]
                      });
  contextMenus.create({
                        title   : "wait...",
                        id      : "wait...",
                        contexts: ["selection"]
                      });
  contextMenus.create({
                        title   : "waitForElementPresent",
                        id      : "waitForElementPresent",
                        parentId: "wait...",
                        contexts: ["selection"]
                      });
  contextMenus.create({
                        title   : "waitForText",
                        id      : "waitForText",
                        parentId: "wait...",
                        contexts: ["selection"]
                      });
  contextMenus.create({
                        title   : "waitUntilVisible",
                        id      : "waitUntilVisible",
                        parentId: "wait...",
                        contexts: ["selection"],
                        // onclick: theFirstFunction
                      });
  contextMenus.create({
                        title   : "waitUntilEnabled",
                        id      : "waitUntilEnabled",
                        parentId: "wait...",
                        contexts: ["selection"],
                        // onclick: theSecondFunction
                      });
});

function getLocator(e) {
  Logger.debug(e, 'context menu get locator')
  return []
}

let clickHandler = function (info, tab) {
  currentContextmenu = info.menuItemId;
  // var url = e.pageUrl;
  Logger.debug(info.menuItemId, ' ==== info.menuItemId')

  if (info.menuItemId === "assertElementPresent" && info.selectionText) {
    callbackContextmenu(info, tab)
    //push to json
    // chrome.runtime.sendMessage({cmd:'contextmenu', value: {
    //   step: 0,
    //   command: 'assertElementPresent(locator)',
    //   target: getLocator(e.target),
    //   input: '',
    //   Actions: ''
    // }})
  }
}

function callbackContextmenu(info, tab) {
  chrome.tabs.sendMessage(tab.id, "getClickedEl", {frameId: info.frameId}, data => {
    // elt.value = data.value;
    if (currentContextmenu === 'nexialElementPresent') {
      data.command = 'assertElementPresent(locator)';
      data['Actions'] = '';
    }
    Logger.debug(data, '--- callback ---', currentContextmenu)
    inspectElementList.push(data);
    Logger.debug(inspectElementList);
  });
}

contextMenus.onClicked.addListener(clickHandler);
