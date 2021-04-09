// class EventRecorder {
  function start () {
    step = 1;
    console.log('start Todo: checkbox radio password file')

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

  function handleFocusout (e) {
    console.log(e, '---------------INPUT TEXTAREA------------')    
    sendInspectInfo(e)
  }

  function handleClick (e) {
    console.log(e, '---------------A BUTTON------------')    
    if (e.target.href) {
      chrome.runtime.sendMessage({
        action: 'url',
        value: e.target.href
      })
    } else sendInspectInfo(e)
  }

  function handleChangeEvent(e) {
    console.log(e, '---------------SELECT------------')
    console.log('selected value', e.target[e.target.selectedIndex].text)
    sendInspectInfo(e)
  }
// }

function getDomPath(el) {
  var stack = [];
  while ( el.parentNode != null ) {
    // console.log(el.nodeName);
    var sibCount = 0;
    var sibIndex = 0;
    for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
      var sib = el.parentNode.childNodes[i];
      if ( sib.nodeName == el.nodeName ) {
        if ( sib === el ) {
          sibIndex = sibCount;
        }
        sibCount++;
      }
    }
    if ( el.hasAttribute('id') && el.id != '' ) {
      stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
    } else if ( sibCount > 1 ) {
      stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
    } else {
      stack.unshift(el.nodeName.toLowerCase());
    }
    el = el.parentNode;
  }
  return stack.slice(1); // removes the html element
}

function getLocator(e, paths) {
  // console.log(e)
  var locator = [], parentWithId;
  const tag = (e.tagName).toLowerCase();
  
  if(e.id) {         // element has Id
    locator.push('//' + tag + "[@id='"+  e.id + "']")
    // locator.push('//form' + "[@id='"+  parentNode[1] + "']//" + tag + "[@id='"+  e.id + "']")
  }
  if (e.name) {      // element has name attribute
    locator.push('//' + tag + "[@name='"+  e.name + "']");
  }
  paths.forEach(element => {
    const parentNode = element.split('#');
    if (parentNode[0] === 'form' && parentNode.length > 1) {            // parent element is form
      if (e.name) {      // element has name attribute
        locator.push('//form' + "[@id='"+  parentNode[1] + "']//" + tag + "[@name='"+  e.name + "']");
      }
      if(e.id) {         // element has Id
        locator.push('//form' + "[@id='"+  parentNode[1] + "']//" + tag + "[@id='"+  e.id + "']")
      }
    }
    if (parentNode.length > 1) {
      parentWithId = parentNode;
    }
  });
  
  return locator;
  // return [
  //   ('xpath=//' + (e.tagName).toLowerCase() + '#' + e.id),
  //   ('xpath=//' + (e.tagName).toLowerCase() + '#' + e.id + '.' + e.classList[0]),
  //   ('id=' + e.id),
  // ]
}

function sendInspectInfo(e) {
  //Todo: Action
  var webCmd;
  // step = step + 1;
  if(e.type === 'submit') {
    webCmd = 'click(locator)'
  } else if(e.type === 'focusout' && e.target.tagName == 'INPUT') {
    webCmd = 'type(locator,value)'
  } else if(e.type === 'change') {
    webCmd = 'select(locator,text)'
  }

  const paths = getDomPath(e.target)
  console.log('parents ', getLocator(e.target, paths))
  // ToDo: for payload create user define datatype
  var payload = {
    cmd: 'inspecting',
    value: {
      step: (step++),
      command: webCmd,
      param: {
        param1: getLocator(e.target, paths),
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
  }
  // if(e.type === 'change') {
  //   payload['selectedText'] = e.target[e.target.selectedIndex].text
  // }

  console.log(payload)
  chrome.runtime.sendMessage(payload)
}

var step = 1;
start()