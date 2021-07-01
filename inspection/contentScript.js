let clickedElement = null, selectionText = null;
let focusedInput = null;
let step = null;
const hasAttributes = ["name", "id", "aria-label", "placeholder", "title", "alt", "class"]; //Order priority wise
const clickableElement = ["button", "a", "li", "path", "svg", "i", "span", "h1", "h2", "h3", "h4", "h5"];
const findClickedElementParent = ["path", "svg", "i", "span"];
const findParents = ["form", "header", "main", "section", "footer"];
const innerTextLength = 100;
const nodeList = ["a", "h1", "h2", "h3", "h4", "h5", "h6"];

// Append Style on hover get element
// let style = document.createElement("link");
// style.rel = "stylesheet";
// style.type = "text/css";
// style.href = chrome.extension.getURL("resources/style/nexial.css");
// (document.head || document.documentElement).appendChild(style);

function start(stepValue) {
  sendConsole("log", "BROWSER RECEIVED: START INSPECTING");
  step = stepValue + 1;
  focusedInput = null;
  clickedElement = null;
  document.addEventListener("focus", handleFocus, true);
  // document.addEventListener("focusout", handleFocusout);
  document.addEventListener("mousedown", onClickElement);
  document.addEventListener("change", handleChange);
  // document.addEventListener("mouseover", onMouseHoverElement);
}

function stop() {
  document.removeEventListener("focus", handleFocus, true);
  // document.removeEventListener("focusout", handleFocusout);
  document.removeEventListener("mousedown", onClickElement);
  document.removeEventListener("change", handleChange);
  // document.removeEventListener("mouseover", onMouseHoverElement);
}

function handleFocus(event) {
  if (event === undefined) event = window.event;
  let target = "target" in event ? event.target : event.srcElement;
  //Todo:  Input TYpe Image, submit, button, reset
  if (target.tagName === "INPUT" && target.type !== "submit") {
    focusedInput = event;
    sendConsole("log", "INPUT FOCUS :", event.target.value);
  }
  target.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    console.log(event, event.keyCode);
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      focusedInput.target.value += "{ENTER}";
      sendConsole("log", "INPUT ENTER PRESS :", focusedInput.target.value);
      sendInspectInfo("typeKeys(locator,value)", focusedInput);
      focusedInput = null;
    }
  });
}

function handleFocusout(event) {
  // if (event === undefined) event = window.event;
  // let target = "target" in event ? event.target : event.srcElement;
  // if(target.tagName === 'INPUT' && target.type !== 'submit') {
  //   const command = 'type(locator,value)';
  //   console.log('INPUT NOT SUBMIT EVENT ====================================== ', event)
  //   sendInspectInfo(command, event);
  // }
}

function onClickElement(event) {
  sendConsole("log", "MOUSE CLICK : ", event.button);
  if (event.button === 2) {
    sendConsole("log", "RIGHT CLICK RETURN FROM onClickElement : ", event.button);
    return;
  }
  if (event === undefined) event = window.event;
  let target = "target" in event ? event.target : event.srcElement;

  if (focusedInput && focusedInput.target.value) {
    sendInspectInfo("type(locator,value)", focusedInput);
    sendConsole("log", "INPUT FOCUSOUT: ", focusedInput.target.value);
    focusedInput = null;
  }

  if (
    (target.tagName === "INPUT" && target.type === "submit") ||
    (target.tagName === "DIV" && target.innerText) ||
    clickableElement.includes(target.tagName.toLowerCase())
  ) {
    sendConsole("log", "CLICK: ", target.tagName);
    sendInspectInfo("click(locator)", event);
  }
}

function handleChange(event) {
  if (event === undefined) event = window.event;
  let target = "target" in event ? event.target : event.srcElement;

  if (target.tagName === "SELECT") {
    sendConsole("log", "SELECT: ", target.tagName);
    sendInspectInfo("select(locator,text)", event);
  }
}

function onMouseHoverElement(event) {
  // if (event === undefined) event = window.event;
  // let target = "target" in event ? event.target : event.srcElement;
  // let tooltip = document.createElement("span");
  // tooltip.setAttribute("nexial-locator-data-tooltip", target.tagName);
  // target.appendChild(tooltip);
  // target.classList.add("_nexial-hover");
  // target.addEventListener("mouseout", function () {
  //   if (tooltip.parentNode) {
  //     target.removeChild(tooltip);
  //     target.classList.remove("_nexial-hover");
  //   }
  // });
}

function hasNumbers(str) {
  let regex = /\d/g;
  return regex.test(str);
}

function hasOnlyAlphabet(str) {
  // No special character and number i.e only alphabet
  let regex = /^[A-Za-z]+$/;
  return regex.test(str);
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
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    .singleNodeValue;
}

function updatingText(txt) {
  txt = txt.replace(/\n/g, "'\\n'");   // replace new line with \n
  return txt.trim();  // trim extra space
}

function createPaths(el, baseXpathNode, baseCssPath, isFiltered) {
  let res = {
    xpath: [],
    css: [],
  };
  if (baseXpathNode) baseXpathNode = baseXpathNode.replace("xpath=", "");
  if (baseCssPath && !isFiltered) {
    baseCssPath = baseCssPath.replace("css=", " > ");
  } else baseCssPath = baseCssPath.replace("css=", " ");
  for (const attr in el.attribute) {
    let value = el.attribute[attr];
    if (attr === "class") {
      if (res["xpath"].length) return res;
      const classList = el.attribute["class"];
      for (let j = 0; j <= classList.length - 1; j++) {
        if (hasOnlyAlphabet(classList[j])) {
          res["xpath"].push("xpath=//" + el.node + `[@${attr}='${classList[j]}']` + baseXpathNode);
          res["css"].push("css=" + el.node + `.${classList[j]}` + baseCssPath);
        }
      }
    } else if (attr === "id") {
      res["xpath"].push("xpath=//" + el.node + `[@${attr}='${value}']` + baseXpathNode);
      res["css"].push("css=" + el.node + `#${value}` + baseCssPath);
    } else {
      res["xpath"].push("xpath=//" + el.node + `[@${attr}='${value}']` + baseXpathNode);
      res["css"].push("css=" + el.node + `[${attr}='${value}']` + baseCssPath);
    }
  }
  return res;
}

function getLocator(e, paths, isFiltered) {
  let locator = [],
    xpath = [],
    css = [],
    selectedLocator = null;
  // const tag = (e.tagName).toLowerCase();
  const activeElnode = paths[paths.length - 1].node;

  if (e.id) locator.push("id=" + e.id);
  if (e.name) locator.push("name=" + e.name);

  for (let i = paths.length - 1; i >= 0; i--) {
    const el = paths[i];
    if (el.attribute["class"]) el.attribute["class"] = el.attribute["class"].split(" ");
    if (i === paths.length - 1) {
      // Main Element with all attribute
      // Xpath=//tagname[@attribute='value']
      const path = createPaths(el, "", "", isFiltered);
      if (path) {
        xpath = path.xpath;
        css = path.css;
      }
      if (el.innerText && el.innerText.length <= innerTextLength) {
        xpath.push(
          "xpath=//" + el.node + `[normalize-space(string(.))=normalize-space('${updatingText(el.innerText)}')]`
        );
        if (nodeList.includes(el.node))
          selectedLocator =
            "xpath=//" +
            el.node +
            `[normalize-space(string(.))=normalize-space('${el.innerText}')]`;
      }
    } else {
      // Relative XPath: //div[@class='something']//h4[1]//b[1]
      let activeElxpath = xpath[0] ? xpath[0] : "xpath=//" + activeElnode,
        activeElcss = css[0] ? css[0] : "css=" + activeElnode;

      const relativePaths = createPaths(el, activeElxpath, activeElcss, isFiltered);
      if (relativePaths) {
        xpath = xpath.concat(relativePaths.xpath);
        css = css.concat(relativePaths.css);
      }
    }
  }
  return {
    locator: locator.concat(css, xpath),
    selectedLocator: selectedLocator,
  };
}

function getDomPath(el) {
  sendConsole("group", "DOM PATH LIST");
  let stack = [];
  while (el.parentNode != null) {
    let node = {};
    node["node"] = el.nodeName.toLowerCase();
    node["innerText"] = el.innerText;
    node["attribute"] = [];

    if (["html", "body"].includes(node["node"])) {
      el = el.parentNode;
      continue;
    }
    if (el.hasAttributes()) {
      for (let i = 0; i <= hasAttributes.length - 1; i++) {
        const attrs = el.attributes[`${hasAttributes[i]}`];
        if (attrs) node["attribute"][attrs.name] = attrs.value;
      }
    }
    stack.unshift(node);
    sendConsole("log", "ENTRY NODE : ", node["node"]);
    el = el.parentNode;
  }
  sendConsole("groupEnd", "");
  return stack;
}

function filterDomPath(el, command) {
  // [1, 2, 3].forEach((element) => {
  //   console.log(element);
  // });
  let domPathList = getDomPath(el);
  let domFilterList = [];
  if (command === "click(locator)") {
    const index = domPathList.findIndex((x) => x.node === "button");
    if(index !== -1) domPathList.length = index + 1;
  }
  sendConsole("log", "DOM PATH FILTER BUTTON : ", domPathList);
  for (let index = 0; index < domPathList.length; index++) {
    const node = domPathList[index];
    if (findParents.includes(node["node"]) || index === domPathList.length - 1) {
      domFilterList.push(node);
    }
  }
  if (domFilterList.length > 1)
    return {
      domPaths: domFilterList,
      isFiltered: true
    };
  return {
    domPaths: domPathList,
    isFiltered: false
  };
}

function getXPath(element) {
  //Todo: sort in simple form
  if (element.id !== "") {
    let xpathWithId = '//*[@id="' + element.id + '"]';
    return xpathWithId;
  }
  if (element === document.body) return element.tagName.toLowerCase();
  let ix = 0;
  let siblings = element.parentNode.childNodes;
  for (let i = 0; i < siblings.length; i++) {
    let sibling = siblings[i];
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
  //Todo: sort in simple form
  if (!(el instanceof Element)) return;
  let path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += "#" + el.id;
      path.unshift(selector);
      break;
    } else {
      let sib = el,
        nth = 1;
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() == selector) nth++;
      }
      if (nth != 1) selector += ':eq(' + nth + ')';
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
}

function sendInspectInfo(command, event) {
  const paths = filterDomPath(event.target, command);
  const locatorList = getLocator(event.target, paths.domPaths, paths.isFiltered);
  let locator = locatorList.locator;
  if (!locator.length) {
    locator = ["css=" + getCssPath(event.target), "xpath=" + getXPath(event.target)];
  }
  sendConsole("log", `COMMAND : ${command}`);
  sendConsole("log", "DOM PATH LIST : ", paths.domPaths);
  sendConsole("log", "IS DOM-PATH-LIST FILTERED : ", paths.domPaths);
  sendConsole("log", "LOCATOR LIST : ", locatorList);

  let data = {
    step: step++,
    command: command,
    param: {},
    actions: {
      selectedLocator: locatorList.selectedLocator,
    },
  };
  switch (command) {
    case "click(locator)":
    case "assertElementPresent(locator)":
      data.param["locator"] = locator;
      break;
    case "type(locator,value)":
    case "typeKeys(locator,value)":
    case "assertValue(locator,value)":
      data.param["locator"] = locator;
      data.param["value"] = event.target.value || "(empty)";
      break;
    case "assertText(locator,text)":
      data.param["locator"] = locator;
      if (event.target.tagName === "SELECT") data.param["text"] = event.target[event.target.selectedIndex].text;
      else data.param["text"] = event.target.textContent || event.target.innerText || "<MISSING>";
      break;
    case "select(locator,text)":
      data.param["locator"] = locator;
      data.param["text"] = event.target[event.target.selectedIndex].text;
      break;
    case "assertTextPresent(text)":
    case "waitForTextPresent(text)":
      data.param["text"] = selectionText || event.target.innerText || "<MISSING>";
      break;
    case "waitForElementPresent(locator,waitMs)":
    case "waitUntilVisible(locator,waitMs)":
    case "waitUntilEnabled(locator,waitMs)":
      data.param["locator"] = locator;
      data.param["waitMs"] = "<MISSING>";
      break;
  }

  // ToDo: for payload create user define datatype
  const payload = {
    cmd: "inspecting",
    value: data,
  };

  if (!chrome || !chrome.runtime || !payload) return;
  sendConsole("log", "SEND PAYLOAD :", payload);
  chrome.runtime.sendMessage(payload);
}

/***************** popup to show locator list ********************/

function getLocatorElement(items, editable = true) {
  let selectList = document.createElement("select");
  selectList.setAttribute('class', 'form-control')
  if (!editable) selectList.setAttribute('disabled', 'true')

  //Create and append the options
  let optgroup = '', optgroupLabel = '';
  for (let index = 0; index < items.length; index++) {
    if ((items[index]).includes('=') && optgroupLabel !== items[index].split('=')[0]) {
      optgroupLabel = items[index].split('=')[0];
      optgroup = document.createElement("optgroup");
      optgroup.setAttribute('label', optgroupLabel.toUpperCase())
    }
    let option = document.createElement("option");
    option.value = items[index];
    option.text = items[index];
    if (optgroup) {
      optgroup.appendChild(option);
      selectList.appendChild(optgroup);
    } else {
      selectList.appendChild(option);
    }
  }
  return selectList;
}

function createLocatorDialog(locator) {
  document.body.innerHTML += `
  <dialog class="nexial-dialog-container">
    <div class="show-locator-header">Show Selector</div>
    <button type="button" class="close" data-dismiss="modal"> × </button>
    <div class="locator-content">
    </div>
    <div class="copy-content">
    <textarea class="form-control nexial-selected-locator"> </textarea>
    </div>
  </dialog>
  `;

  let dialog = document.getElementsByClassName("nexial-dialog-container")[0];
  dialog.style.position = "absolute";
  dialog.style.position = "relative";
  dialog.style.border = "1px solid #999";
  dialog.style.border = "1px solid rgba(0,0,0,.2)";
  dialog.style.outline = "0";
  dialog.getElementsByClassName("show-locator-header")[0].style.display = "inline-block";
  dialog.getElementsByClassName("close")[0].style.float = "right";

  const selectedLocator = dialog.getElementsByClassName("nexial-selected-locator")[0];
  const cmdDropdown = getLocatorElement(locator);
  cmdDropdown.onchange = function (event) {
    selectedLocator.value = '';
    selectedLocator.value = event.target.value;
    console.log(event, '#############')
  }
  cmdDropdown.style.margin = "25px 0px";
  selectedLocator.style.width = "100%";
  dialog.getElementsByClassName("locator-content")[0].appendChild(cmdDropdown);
  dialog.querySelector("button").addEventListener("click", function() {
    cmdDropdown.remove();
    dialog.close();
  })
  dialog.showModal();
}

function findLocator() {
  const paths = filterDomPath(clickedElement.target, '');
  const locatorList = getLocator(clickedElement.target, paths.domPaths, paths.isFiltered);
  let locator = locatorList.locator;
  if (!locator.length) {
    locator = ["css=" + getCssPath(clickedElement.target), "xpath=" + getXPath(clickedElement.target)];
  }
  createLocatorDialog(locator);
}
/**************************************************************************/

document.addEventListener(
  "contextmenu",
  function (event) {
    clickedElement = event;
  },
  true
);

chrome.runtime.onMessage.addListener(function (request) {
  switch (request.action) {
    case "getContextMenuElement":
      selectionText = request.selectionText;
      sendInspectInfo(request.command, clickedElement);
      clickedElement = null;
      break;
    case "start":
      start(request.startStep);
      break;
    case "stop":
      stop();
      step = null;
      focusedInput = null;
      clickedElement = null;
      break;
    case "paused":
      stop();
      break;
    case "findLocator":
      findLocator();
      break;
  }
  sendConsole("info", `BROWSER : ${request.action} INSPECTING`);
});
