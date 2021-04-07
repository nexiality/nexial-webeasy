console.log('context menu')
var currentContextmenu = '';

function getElement(info,tab) {
  console.log("Word " + info.selectionText + " was clicked.");
  console.log(info, tab)

}

chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({
    id: "nexialElementPresent",
    title: "Assert element preset",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "nexialTextPresent",
    title: "Assert Text preset",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "nexialAttributePresent",
    title: "Assert attribute preset",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "nexialValuePresent",
    title: "Assert value preset",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "nexialWaitUntill",
    title: "Waituntil",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "nexialWaitUntillVisible",
    title: "visible/enable",
    parentId: "nexialWaitUntill",
    contexts:["selection"],
    // onclick: theFirstFunction
  });

  chrome.contextMenus.create({
    id: "nexialWaitUntillLoaded",
    title: "Loaded",
    parentId: "nexialWaitUntill",
    contexts:["selection"],
    // onclick: theSecondFunction
  });
});

function getLocator(e) {
  console.log(e, 'context meny get locator')
  return [
  ]
}
var clickHandler = function(info,tab) {
   currentContextmenu = info.menuItemId;
  // var url = e.pageUrl;
  console.log(info.menuItemId,' ==== info.menuItemId')
  if(info.menuItemId === "nexialElementPresent" && info.selectionText) {
    // console.log(info)

    console.log('--------------nexialElementPresent---------------')
    callbackContextmenu(info,tab)
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
      data['Actions'] = ''
    }
    console.log(data, '--- callback ---', currentContextmenu)
    inspectElementList.push(data)
    console.log(inspectElementList)
  });
}

chrome.contextMenus.onClicked.addListener(clickHandler);
