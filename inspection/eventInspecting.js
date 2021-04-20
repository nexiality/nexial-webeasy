// class EventRecorder {
function start() {
  // step = 2;
  // console.log('start Todo: checkbox radio password file')

  const typeableElements = document.querySelectorAll('input:not([type=submit]), textarea')
  const clickableElements = document.querySelectorAll('a, button')
  const changeableElement = document.querySelectorAll('select')
  const submitableEvent = document.querySelectorAll('input[type=submit], form')

  for (let i = 0; i < typeableElements.length; i++) {
    typeableElements[i].addEventListener('focusout', this.handleFocusout)
  }

  for (let i = 0; i < clickableElements.length; i++) {
    clickableElements[i].addEventListener('click', this.handleClick)
  }

  for (let i = 0; i < submitableEvent.length; i++) {
    submitableEvent[i].addEventListener('submit', this.handleClick)
  }

  for (let i = 0; i < changeableElement.length; i++) {
    changeableElement[i].addEventListener('change', this.handleChangeEvent)
  }
}

function handleFocusout(e) {
  // console.log(e, '---------------INPUT TEXTAREA------------')
  sendInspectInfo(e)
}

function handleClick(e) {
  // console.log(e, '---------------A BUTTON------------')
  if (e.target.href) {
    if (chrome && chrome.runtime) chrome.runtime.sendMessage({action: 'url', value: e.target.href});
  } else {
    sendInspectInfo(e);
  }
}

function handleChangeEvent(e) {
  // console.log(e, '---------------SELECT------------')
  // console.log('selected value', e.target[e.target.selectedIndex].text)
  sendInspectInfo(e)
}

function getDomPath(el) {
  var stack = [];
  while (el.parentNode != null) {
    // console.log(el.nodeName);
    var sibCount = 0;
    var sibIndex = 0;
    for (var i = 0; i < el.parentNode.childNodes.length; i++) {
      var sib = el.parentNode.childNodes[i];
      if (sib.nodeName == el.nodeName) {
        if (sib === el) { sibIndex = sibCount; }
        sibCount++;
      }
    }
    if (el.hasAttribute('id') && el.id != '') {
      stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
    } else if (el.hasAttribute('class') && el.className != '') {
      stack.unshift(el.nodeName.toLowerCase() + '.' + el.className);
    } else if (sibCount > 1) {
      stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
    } else {
      stack.unshift(el.nodeName.toLowerCase());
    }
    el = el.parentNode;
  }
  return stack.slice(1); // removes the html element
}

function createLocator(e, parentTag, parentNode, tag, identifiedBy, xpath, css) {

  if (e.name) {                                               // element has name attribute
    xpath.push('xpath=//' + parentTag + "[@id='" + parentNode + "']//" + tag + "[@name='" + e.name + "']");
    css.push('css=' + parentTag + identifiedBy + parentNode + ' > ' + tag + "[name='" + e.name + "']")
  }
  if (e.id) {                                                 // element has Id
    css.push('css=' + parentTag + identifiedBy + parentNode + ' > ' + tag + identifiedBy + e.id)
    xpath.push('xpath=//' + parentTag + "[@id='" + parentNode + "']//" + tag + "[@id='" + e.id + "']")
  }
}

function getLocator(e, paths) {
  // console.log(e)
  var locator = [], xpath = [], css = [], hasParent = false;
  const tag = (e.tagName).toLowerCase();

  if (e.id) {                                                     // element has Id
    locator.push("id='" + e.id + "'")
  }
  if (e.name) {                                                   // element has name attribute
    locator.push("name='" + e.name + "'");
  }
  for (var i = (paths.length - 1); i >= 0; i--) {
    var parentNode = parentNode = paths[i].split('#'), identifiedBy = '#';
    if (paths[i].includes(".")) {
      parentNode = paths[i].split('.');
      identifiedBy = '.';
    }

    if (parentNode.length > 1) {
      if (parentNode[0] === 'form') {      // parent element is form
        hasParent = true;
        createLocator(e, 'form', parentNode[1], tag, identifiedBy, xpath, css);
      } else if (parentNode[0] === 'header' && !hasParent) {
        createLocator(e, 'header', parentNode[1], tag, identifiedBy, xpath, css);
      }
    }
  }
  return locator.concat(css, xpath);
}

function sendInspectInfo(e) {
  //Todo: Action
  let webCmd;
  // step = step + 1;
  if (e.type === 'submit') {
    webCmd = 'click(locator)'
  } else if (e.type === 'focusout' && e.target.tagName === 'INPUT') {
    webCmd = 'type(locator,value)'
  } else if (e.type === 'change') {
    webCmd = 'select(locator,text)'
  } else {
    // todo: need to decide what to do here
    webCmd = 'UNKNOWN';
  }

  // ToDo: for payload create user define datatype
  let payload = {
    cmd  : 'inspecting',
    value: {
      step   : (step++),
      command: webCmd,
      param  : {
        param1: getLocator(e.target, getDomPath(e.target)),
        param2: [e.target.value]
      },
      actions: {
        // tagName: e.target.tagName,
        // tagType: e.target.type,
        // path: paths.slice(-1),
        // parents: paths,
        // baseURI: e.target.baseURI,
        // id: e.target.id,
        // classList: e.target.className,
        // userAction: e.type,
        // value: e.target.value,
        // target: e.target
      }
    }
  };

  // if(e.type === 'change') {
  //   payload['selectedText'] = e.target[e.target.selectedIndex].text
  // }

  console.log(payload);

  if (!chrome || !chrome.runtime || !payload) return;
  chrome.runtime.sendMessage(payload);
}

var step = 2;
start();
