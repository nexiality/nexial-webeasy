var clickedElement = null;
var focusedInput = null;
var step = null;
const hasAttributes = ['name', 'id', 'aria-label', 'placeholder', 'title', 'class', 'alt'];  //Order priority wise
const findClickedElementParent = ['path', 'svg', 'i', 'span'];

// Append Style
var style = document.createElement("link");
style.rel = "stylesheet";
style.type = "text/css";
style.href = chrome.extension.getURL("resources/style/nexial.css");
(document.head || document.documentElement).appendChild(style);

function start(stepValue) {
  step = stepValue + 1;
  focusedInput = null;
  document.addEventListener("focus", handleFocus, true);
  // document.addEventListener("focusout", handleFocusout);
  document.addEventListener("mousedown", onClickElement);
  document.addEventListener("change", handleChange);
  document.addEventListener("mouseover", onMouseHoverElement);
}

function stop() {
  step = null;
  document.removeEventListener("focus", handleFocus, true);
  // document.removeEventListener("focusout", handleFocusout);
  document.removeEventListener("mousedown", onClickElement);
  document.removeEventListener("change", handleChange);
  document.removeEventListener("mouseover", onMouseHoverElement);
}

function handleFocus(event) {
  if (event === undefined) event = window.event;
  var target = "target" in event ? event.target : event.srcElement;

  if(target.tagName === 'INPUT' && target.type !== 'submit') focusedInput = event;
}

function handleFocusout(event) {
  // if (event === undefined) event = window.event;
  // var target = "target" in event ? event.target : event.srcElement;
  
  // if(target.tagName === 'INPUT' && target.type !== 'submit') {
  //   const command = 'type(locator,value)';
  //   console.log('INPUT NOT SUBMIT EVENT ====================================== ', event)
  //   sendInspectInfo(command, event);
  // }
}

function onClickElement(event) {
  if(event.button === 1) return;
  if (event === undefined) event = window.event;
  var target = "target" in event ? event.target : event.srcElement;

  if(focusedInput && focusedInput.target.value) {
    sendInspectInfo('type(locator,value)', focusedInput);
    focusedInput = null;
  }

  if(target.tagName === 'INPUT' && target.type === 'submit') {
    sendInspectInfo('click(locator)', event);
  } else if((target.tagName === 'DIV' && target.innerText) || target.tagName === 'BUTTON') {
    sendInspectInfo('click(locator)', event);
  } else if (findClickedElementParent.includes(target.tagName)) {
    sendInspectInfo('click(locator)', event);
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

function onMouseHoverElement(event) {
  if (event === undefined) event = window.event;
  var target = "target" in event ? event.target : event.srcElement;

  var tooltip = document.createElement("span");
  tooltip.setAttribute("nexial-locator-data-tooltip", target.tagName);
  target.appendChild(tooltip);
  target.classList.add("_nexial-hover");
  target.addEventListener("mouseout", function () {
    if (tooltip.parentNode) {
      target.removeChild(tooltip);
      target.classList.remove("_nexial-hover");
    }
  });
}

function hasNumbers(str) {
  var regex = /\d/g;
  return (regex.test(str));
}

function hasOnlyAlphabet(str) {
  // No special character and number i.e only alphabet
  var regex = /^[A-Za-z]+$/;
  return (regex.test(str));
}

function isUniqueID(id) {
  // document.getElementById
  // const el = document.getElementById(id);
  // if (el.length)
}

function getElementByCss(cssPath) {
  return document.querySelectorAll(cssPath);
}

function getElementByXpath(path) {
  // check id, name and xpath selector
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function createPaths(el, baseXpathNode, baseCssPath) {
  var res = {
    'xpath': [],
    'css': []
  };
  if (baseXpathNode) baseXpathNode = baseXpathNode.replace("xpath=", "");
  if (baseCssPath) baseCssPath = baseCssPath.replace("css=", ">");
  for (const attr in el.attribute) {
    var value = el.attribute[attr];
    if(attr === 'class') {
      const classList = el.attribute['class'];
      for (var j = 0; j <= (classList.length - 1); j++) {
        if (hasOnlyAlphabet(classList[j])) {
          res['xpath'].push('xpath=//' + el.node + `[@${attr}='${classList[j]}']` + baseXpathNode);
          res['css'].push('css=' + el.node + `.${classList[j]}` + baseCssPath);
        }
      }
    } else if(attr === 'id') {
      res['xpath'].push('xpath=//' + el.node + `[@${attr}='${value}']` + baseXpathNode);
      res['css'].push('css=' + el.node + `#${value}` + baseCssPath);
    } else {
      res['xpath'].push('xpath=//' + el.node + `[@${attr}='${value}']` + baseXpathNode);
      res['css'].push('css=' + el.node + `[${attr}='${value}']` + baseCssPath);
    }
  }
  return res
}

function getLocator(e, paths) {
  var locator = [], xpath = [], css = [];
  const tag = (e.tagName).toLowerCase();
  const activeEl = paths[paths.length - 1];
  
  if (e.id) locator.push("id='" + e.id + "'");
  if (e.name) locator.push("name='" + e.name + "'");

  for (var i = (paths.length - 1); i >= 0; i--) {
    const el = paths[i];
    if(el.attribute['class']) el.attribute['class'] = el.attribute['class'].split(" ");
    if(i === (paths.length - 1)) {
      // Main Element with all attribute
      // Xpath=//tagname[@attribute='value']
      const path = createPaths(el, '', '');
      if (path) {
        xpath = path.xpath;
        css = path.css;
      }
      if (el.innerText && el.innerText.length <= 15) {
        xpath.push('xpath=//' + el.node + `[normalize-space(text())='${el.innerText}']`);
      }
    } else {
      // Relative XPath: //div[@class='something']//h4[1]//b[1]
      const relativePaths = createPaths(el, xpath[0], css[0]);
      if (relativePaths) {
        xpath = xpath.concat(relativePaths.xpath);
        css = css.concat(relativePaths.css);
      }
    }
  }
  return locator.concat(css, xpath);
}

function getDomPath(el, command) {
  var stack = [];
  while (el.parentNode != null) {
    // var sibCount = 0;
    // var sibIndex = 0;
    var node = {};
    node['node'] = el.nodeName.toLowerCase();
    node['innerText'] = el.innerText;
    node['attribute'] = [];
    if (findClickedElementParent.includes(node['node']) && command === 'click(locator)') {
      el = el.parentNode;
      continue;
    }
    if (el.hasAttributes()) {
      // var attrs = el.attributes;
      // for(var i = attrs.length - 1; i >= 0; i--) {
      //   if(hasAttributes.includes(attrs[i].name)) {
      //     node['attribute'][attrs[i].name] = attrs[i].value;
      //   }
      // }
      for(var i = 0; i <= (hasAttributes.length - 1); i++) {
        const attrs = el.attributes[`${hasAttributes[i]}`];
        if(attrs) node['attribute'][attrs.name] = attrs.value;
      }
    }
    // if (sibCount > 1) { node['eq'] = ':eq(' + sibIndex + ')'; }
    // removes the html & body element
    if (!['html', 'body'].includes(node['node'])) { stack.unshift(node) }
    el = el.parentNode;
  }
  return stack;
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
    param:   {},
    actions: {}
  };
  const paths = getDomPath(event.target, command);
  var locator = getLocator(event.target, paths);
  if (!locator.length) {
    locator =  [
      'css=' + getCssPath(event.target),
      'xpath=' + getXPath(event.target)
    ]
  }

  switch(command) {
    case 'click(locator)':
    case 'assertElementPresent(locator)':
      data.param['locator'] = locator;
      break;
    case 'type(locator,value)':
    case 'assertValue(locator,value)':
      data.param['locator'] = locator;
      data.param['value'] = event.target.value;
      break;
    case 'select(locator,text)':
      data.param['locator'] = locator;
      data.param['text'] = event.target[event.target.selectedIndex].text;
      break;
    case 'assertTextPresent(text)':
    case 'waitForTextPresent(text)':
      data.param['text'] = event.target.innerText;
      break;
    case 'waitForElementPresent(locator,waitMs)':
    case 'waitUntilVisible(locator,waitMs)':
      data.param['locator'] = locator;
      data.param['waitMs'] = '';
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
    sendInspectInfo(request.command, clickedElement);
    clickedElement = null;
    // sendResponse({res: "contextmenu", data: payload});
  }
  else if (request.action === 'start') start(request.startStep);
  else if (request.action === 'stop' || request.action === 'paused') stop();
});
