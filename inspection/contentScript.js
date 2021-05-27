var clickedElement = null;
var currentElement = null, focusedInput = null;
var step = 2;
const hasAttributes = ['alt', 'id', 'class', 'aria-label', 'name', 'title', 'type', 'placeholder'];

// Append Style
var style = document.createElement("link");
style.rel = "stylesheet";
style.type = "text/css";
style.href = chrome.extension.getURL("resources/style/nexial.css");
(document.head || document.documentElement).appendChild(style);

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
  if (event === undefined) event = window.event;
  var target = "target" in event ? event.target : event.srcElement;

  const command = 'click(locator)';

  if(focusedInput && target.value) {
    sendInspectInfo('type(locator,value)', focusedInput);
    focusedInput = null;
  }

  if(target.tagName === 'INPUT' && target.type === 'submit') {
    sendInspectInfo(command, event);
  } else if((target.tagName === 'DIV' && target.innerText) || target.tagName === 'BUTTON') {
    sendInspectInfo(command, event);
  }
}

function handleChange(event) {
  if (event === undefined) event = window.event;
  var target = "target" in event ? event.target : event.srcElement;

  if(target.tagName === 'SELECT') {
    const command = 'select(locator,text)';
    console.log('CHANGE event ====================================== ', event)
    sendInspectInfo(command, event);
  }
}

function onMouseHoverElement(event) {
  if (event === undefined) event = window.event;
  var target = "target" in event ? event.target : event.srcElement;
  console.log('hi', target.tagName)
  var tooltip = document.createElement("span");
  tooltip.setAttribute("nexial-locator-data-tooltip", target.tagName);
  target.appendChild(tooltip);
  // target.style.backgroundColor = "red";
  target.classList.add("nexial-hover");
  target.addEventListener("mouseout", function () {
    // console.log('bbye')
    if (tooltip.parentNode) {
      target.removeChild(tooltip);
      target.classList.remove("nexial-hover");
    }
  });
}

function hasNumbers(str) {
  var regex = /\d/g;
  return !(regex.test(str));
}

function validClassAndID(str) {
  // Not start with _ or contain  _ - . number(must)
  let result = ['_', '-'].some(isClassStartWith => isClassStartWith.startsWith(isClassStartWith));
  if (result) return result;
  return !hasNumbers(str)
}

function isUniqueID(id) {
  // document.getElementById
  // const el = document.getElementById(id);
  // if (el.length)
}

function isUniqueClass(className) {
  // document.getElementsByClassName("a4bIc");
}

function getLocator(e, paths) {
  var locator = [], xpath = [], css = [], hasParent = false ;
  const tag = (e.tagName).toLowerCase();
  const activeEl = paths[paths.length - 1];
  
  if (e.id) {                                                     // element has Id
    locator.push("id='" + e.id + "'")
  }
  if (e.name) {                                                   // element has name attribute
    locator.push("name='" + e.name + "'");
  }
  for (var i = (paths.length - 1); i >= 0; i--) {
    const el = paths[i];
    if(i === (paths.length - 1)) {                                  // Main Element with all attribute
      // Xpath=//tagname[@attribute='value']
      for (const attr in el.attribute) {
        var value = el.attribute[attr];
        if(attr === 'class') {
          // Todo : class
        } else {
          xpath.push('xpath=//' + el.node + `[@${attr}=${value}]`);
        }
      }
      if (el.innerText && el.innerText.length >= 15) {
        xpath.push('xpath=//' + el.node + `[normalize-space(text())='${el.innerText}']`);
      }
    } else {
      // Relative XPath: //div[@class='something']//h4[1]//b[1]
      for (const attr in el.attribute) {
        var value = el.attribute[attr];
        if(attr === 'class') {

        } else {
          for (const activeElAttr in activeEl.attribute) {
            const activeElValue = activeEl.attribute[activeElAttr];
            xpath.push('xpath=//' + el.node + `[@${attr}=${value}]//` + activeEl.node + `[@${activeElAttr}=${activeElValue}]`);

          }
        }
      }
    }
    // css.push('css=' +);
  }
  return locator.concat(css, xpath);
}

function getDomPath(el) {
  var stack = [];
  while (el.parentNode != null) {
    var sibCount = 0;
    var sibIndex = 0;
    var node = {};
    node['node'] = el.nodeName.toLowerCase();
    node['innerText'] = el.innerText;
    node['attribute'] = {};

    if (el.hasAttributes()) {
      var attrs = el.attributes;
      for(var i = attrs.length - 1; i >= 0; i--) {
        if(hasAttributes.includes(attrs[i].name)) {
          node['attribute'][attrs[i].name] = attrs[i].value;
        }
      }
    }
    if (sibCount > 1) { node['eq'] = ':eq(' + sibIndex + ')'; }
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
  const paths = getDomPath(event.target);
  var locator = getLocator(event.target, paths);
  // if (!locator.length) {
  //   locator =  [
  //     'css=' + getCssPath(event.target),
  //     'xpath=' + getXPath(event.target)
  //   ]
  // }
  // console.log('LOCATOR ###################', locator)
  var data = {
    step   : step++,
    command: command,
    param:   {
      locator: locator
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
    document.addEventListener("mouseover", onMouseHoverElement);
  } else if (request.action === 'stop' || request.action === 'paused') {
    document.removeEventListener("mouseover", onMouseHoverElement);
    document.removeEventListener("focusout", handleFocusout);
    document.removeEventListener("mousedown", onClickElement);
    document.removeEventListener("change", handleChange);
  }
});
