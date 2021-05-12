var clickedElement = null;
var currentElement;
var step = 2;

function handleFocusout(event) {
  if (event === undefined) event = window.event;
  var target = "target" in event ? event.target : event.srcElement;
  
  if(target.tagName === 'INPUT' && target.type !== 'submit') {
    const command = 'type(locator,value)';
    sendInspectInfo(command, event);
  }
}

function onClickElement(event) {
  if (event === undefined) event = window.event;
  var target = "target" in event ? event.target : event.srcElement;

  const command = 'click(locator)';
  if(target.tagName === 'INPUT' && target.type === 'submit') {
    sendInspectInfo(command, event);
  } else if(target.tagName === 'DIV' && target.innerText) {
    sendInspectInfo(command, event);
  }
}

function handleChange(event) {
  if (event === undefined) event = window.event;
  var target = "target" in event ? event.target : event.srcElement;

  if(target.tagName === 'SELECT') {
    const command = 'select(locator,text)';
    sendInspectInfo(command, event);
  }
}

function getXPath(element) {
  if (element.id !== "") {
    var xpathWithId = '//*[@id="' + element.id + '"]';
    return xpathWithId;
  }
  if (element === document.body) return element.tagName.toLowerCase();
  var ix = 0;
  var siblings = element.parentNode.childNodes;
  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i];
    if (sibling === element)
      return (
        getXPath(element.parentNode) + "/" + element.tagName.toLowerCase() + "[" + (ix + 1) + "]"
      );
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix++;
    }
  }
}

function getCssPath(el) {
  if (!(el instanceof Element)) return;
  var path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    var selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += "#" + el.id;
      path.unshift(selector);
      break;
    } else {
      var sib = el,
        nth = 1;
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() == selector) nth++;
      }
      if (nth != 1) selector += ":nth-of-type(" + nth + ")";
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
}

function sendInspectInfo(command, event) {
  var data = {
    step   : step++,
    command: command,
    param:   {
      locator: [
        'css=' + getCssPath(event.target),
        'xpath=' + getXPath(event.target)
      ]
    },
    actions: {}
  };

  switch(command) {
    case 'click(locator)':
      break;
    case 'type(locator,value)':
      data.param['value'] = event.target.value;
      break;

    case 'select(locator,text)':
      data.param['text'] = event.target[event.target.selectedIndex].text;
      break;
  }

  // ToDo: for payload create user define datatype
  const payload = {
    cmd  : 'inspecting',
    value: data
  };

  if (!chrome || !chrome.runtime || !payload) return;
  chrome.runtime.sendMessage(payload);
}

document.addEventListener("contextmenu", function (event) {
  clickedElement = event;
}, true);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getContextMenuElement") {
    const paths = getDomPath(clickedElement.target);
    const param = {
      locator: getLocator(clickedElement.target, paths),
      text: clickedElement.target.text,
      value: clickedElement.target.value
    };
    console.log('context MEnu ', {res: "contextmenu", step: step++, param: param})
    sendResponse({res: "contextmenu", step: step++, param: param});
  } else if (request.action === 'start') {
    document.addEventListener("focusout", handleFocusout);
    document.addEventListener("mousedown", onClickElement);
    document.addEventListener("change", handleChange);
  } else if (request.action === 'stop' || request.action === 'paused') {
    document.removeEventListener("focusout", handleFocusout);
    document.removeEventListener("mousedown", onClickElement);
    document.removeEventListener("change", handleChange);
  }
});
