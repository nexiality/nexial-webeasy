let clickedElement = null, selectionText = null;
let focusedInput = null;
let step = null;
const HAS_ATTRIBUTES = ["name", "id", "aria-label", "placeholder", "title", "alt", "class", "value", "type"]; //Order priority wise
const CLICKABLE_ELEMENT = ["button", "a", "li", "path", "svg", "i", "span", "h1", "h2", "h3", "h4", "h5", "label"];
const FIND_CLICKED_ELEMENT_PARENT = ["path", "svg", "i", "span"];
const FIND_PARENTS = ["form", "header", "main", "section", "footer"];
const INNER_TEXT_LENGTH = 100;
const NODE_LIST_HAS_TEXT = ["a", "h1", "h2", "h3", "h4", "h5", "h6"];
const INPUT_TAGS = ["INPUT", "TEXTAREA"];
const INPUT_TYPE_ELEMENT = ["text", "number", "email", "password", "search", "tel", "url"];
const INPUT_CLICKABLE_TYPES = ["submit", "reset", "image", "button"];
const INPUT_TOGGLE_TYPES = ["radio", "checkbox"];
const HAS_PARENT = ["i", "h1", "h2", "h3", "h4", "h5", "h6", "a", "button"];
const ATTRIB_HUMAN_READABLE = ["aria-label", "placeholder", "title", "alt"];

// Append Style on hover get element
let style = document.createElement("link");
style.rel = "stylesheet";
style.type = "text/css";
style.href = chrome.extension.getURL("resources/style/nexial.css");
(document.head || document.documentElement).appendChild(style);

function start(stepValue) {
  sendConsole("log", "BROWSER RECEIVED: START INSPECTING");
  step = stepValue + 1;
  focusedInput = null;
  clickedElement = null;
  document.addEventListener("focus", handleFocus, true);
  document.addEventListener("mousedown", onClickElement);
  document.addEventListener("change", handleChange);
}

function stop() {
  document.removeEventListener("focus", handleFocus, true);
  document.removeEventListener("mousedown", onClickElement);
  document.removeEventListener("change", handleChange);
}

function handleFocus(event) {
  if (event === undefined) event = window.event;
  let target = "target" in event ? event.target : event.srcElement;

  if (!INPUT_TAGS.includes(target.tagName)) return;

  if (INPUT_TYPE_ELEMENT.includes(target.type) || target.tagName === "TEXTAREA") {
    focusedInput = event;
    sendConsole("log", "INPUT FOCUS:", target);
  }

  target.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    // console.log(event, event.keyCode);
    if (event.keyCode === 13 && focusedInput && target.tagName !== "TEXTAREA") {
      event.preventDefault();
      focusedInput.target.value += "{ENTER}";
      sendConsole("log", "INPUT ENTER PRESS :", focusedInput.target.value);
      sendInspectInfo("typeKeys(locator,value)", focusedInput);
      focusedInput = null;
    }
  });
}

function onClickElement(event) {
  if (event === undefined) event = window.event;
  let target = "target" in event ? event.target : event.srcElement;

  sendConsole("log", "MOUSE CLICK : ", event.button);
  if (event.button === 2) {
    sendConsole("log", "RIGHT CLICK RETURN FROM onClickElement : ", event.button);
    return;
  }

  if (focusedInput && focusedInput.target.value) {
    sendConsole("log", "INPUT FOCUSOUT: ", focusedInput.target);
    sendInspectInfo("type(locator,value)", focusedInput);
    focusedInput = null;
  }

  if ((target.tagName === "DIV" && target.innerText) || CLICKABLE_ELEMENT.includes(target.tagName.toLowerCase())) {
    sendConsole("log", "CLICK: ", target.tagName);
    sendInspectInfo("click(locator)", event);
    return;
  }

  if (target.tagName === "INPUT") {
    if (INPUT_CLICKABLE_TYPES.includes(target.type)) {
      sendInspectInfo("click(locator)", event);
      return;
    }
    if (INPUT_TOGGLE_TYPES.includes(target.type)) {
      sendInspectInfo(target.checked ? "checkAll(locator,waitMs)" : "uncheckAll(locator,waitMs)", event);
      return;
    }
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

function hasNumbers(str) { return /\d/g.test(str); }

/** check that there's no special character and number i.e only alphabet */
function isAcceptableClass(str) {
  return !str.startsWith('ng_') && !str.startsWith('ng-') && /^[A-Za-z][\w\_\-]+[\w\_\-\d]$/.test(str);
}

function getElementByCss(cssPath) { return document.querySelectorAll(cssPath); }

function getElementByXpath(path) {
  // check id, name and xpath selector
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

/** trim extra space and replace new line with \n */
// todo: need to handle single and double quotes in `txt`
function updatingText(txt) { return "'" + txt.trim().replace(/\s+/g, " ") + "'"; }

function createPaths(el, baseXpathNode, baseCssPath, isFiltered) {
  let res = {
    xpath: [],
    css: [],
  };

  if (baseXpathNode) baseXpathNode = baseXpathNode.replace("xpath=", "");

  // TODO: not sure what this does...
  // if (baseCssPath && !isFiltered) {
  //   baseCssPath = baseCssPath.replace("css=", " > ");
  // } else baseCssPath = baseCssPath.replace("css=", " ");
  if (baseCssPath) { baseCssPath = baseCssPath.replace("css=", " "); }

  for (const attr in el.attribute) {
    let value = el.attribute[attr];
    if (attr === "class") {
      if (res["xpath"].length) return res;
      const classList = el.attribute["class"];
      for (let j = 0; j <= classList.length - 1; j++) {
        if (isAcceptableClass(classList[j])) {
          res["xpath"].push("xpath=//" + el.node + `[contains(@class,'${classList[j]}')]` + baseXpathNode);
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
  let locator         = [],
      xpath           = [],
      css             = [],
      selectedLocator = null;
  const activeElnode = paths[paths.length - 1].node;

  if (e.id) locator.push("id=" + e.id);
  if (e.name) locator.push("name=" + e.name);

  for (let i = paths.length - 1; i >= 0; i--) {
    const el = paths[i];
    if (el.attribute["class"]) { el.attribute["class"] = el.attribute["class"].split(" "); }
    if (i === paths.length - 1) {
      // Main Element with all attribute
      // Xpath=//tagname[@attribute='value']
      const path = createPaths(el, "", "", isFiltered);
      if (path) {
        xpath = path.xpath;
        css = path.css;
      }

      if (el.innerText && el.innerText.length <= INNER_TEXT_LENGTH) {
        let compareText = updatingText(el.innerText);
        // use `text()` when possible for added accuracy
        let xpathViaText = "xpath=//" + el.node +
                           (!el.children || el.children.length < 1 ?
                            `[normalize-space(text())=${compareText}]` :
                            `[normalize-space(string(.))=${compareText}]`);
        xpath.push(xpathViaText);
        // if (NODE_LIST_HAS_TEXT.includes(el.node)) { selectedLocator = xpathViaText; }
        if (!selectedLocator || (selectedLocator.length > xpathViaText.length && !selectedLocator.startsWith("css="))) {
          selectedLocator = xpathViaText;
        }
      }

      // special treatment for input element
      if (el.node && el.node === "input" && el.attribute["type"]) {
        let inputType = el.attribute["type"];
        let inputName = el.attribute["name"];
        let inputId = el.attribute["id"];

        let cssFragment = "[type='" + inputType + "']";
        let xpathFragment = "[@type='" + inputType + "'";
        // for input element, prefer name over id
        if (inputName) {
          cssFragment += "[name='" + inputName + "']";
          xpathFragment += " and @name='" + inputName + "'";
        } else if (inputId) {
          cssFragment = "#" + inputId + cssFragment;
          xpathFragment += " and @id='" + inputId + "'";
        }

        for (let j = 0; j < ATTRIB_HUMAN_READABLE; j++) {
          let attribName = ATTRIB_HUMAN_READABLE[j];
          let attribValue = el.attribute[attribName];
          if (attribValue) {
            cssFragment += "[" + attribName + "='" + attribValue + "']";
            xpathFragment += " and @" + attribName + "='" + attribValue + "'";
            break;
          }
        }

        if (INPUT_TOGGLE_TYPES.includes(inputType)) {
          let inputValue = el.attribute["value"];
          if (inputValue) {
            cssFragment += "[value='" + inputValue + "']";
            xpathFragment += " and @value='" + inputValue + "'";

            // for <input type='checkbox' ...> or <input type='radio' ...> we'd prefer the selector with `value`
            selectedLocator = "css=input" + cssFragment;
          }
        }

        xpath.push("xpath=//input" + xpathFragment + "]");
        css.push("css=input" + cssFragment);
      }
    } else {
      // Relative XPath: //div[@class='something']//h4[1]//b[1]
      let activeElxpath = xpath[0] ? xpath[0] : "xpath=//" + activeElnode;
      let activeElcss = css[0] ? css[0] : "css=" + activeElnode;

      const relativePaths = createPaths(el, activeElxpath, activeElcss, isFiltered);
      if (relativePaths) {
        xpath = xpath.concat(relativePaths.xpath);
        css = css.concat(relativePaths.css);
      }
    }
  }

  locator = locator.concat(css, xpath);
  if (!selectedLocator) { selectedLocator = locator[0]; }

  return {
    locator: locator,
    selectedLocator: selectedLocator,
  };
}

function getDomPath(el) {
  sendConsole("group", "DOM PATH LIST");
  let stack = [];
  while (el.parentNode != null) {
    let node = {};
    node["node"] = el.nodeName.toLowerCase();
    node["innerText"] = el.textContent || el.text || el.innerText ;
    node["attribute"] = [];

    if (["html", "body"].includes(node["node"])) {
      el = el.parentNode;
      continue;
    }
    if (el.hasAttributes()) {
      for (let i = 0; i <= HAS_ATTRIBUTES.length - 1; i++) {
        const attr = el.attributes[`${HAS_ATTRIBUTES[i]}`];
        if (attr && attr.name && attr.value) node["attribute"][attr.name] = attr.value;
      }
    }
    stack.unshift(node);
    sendConsole("log", "ENTRY NODE : ", node["node"]);
    el = el.parentNode;
  }
  sendConsole("groupEnd", "");
  return stack;
}

function filterDomPath(el) {
  let domPathList = getDomPath(el);
  let domFilterList = [];

  for (let i = 0; i < HAS_PARENT.length; i++) {
    const index = domPathList.findIndex((x) => x.node === HAS_PARENT[i]);
    // console.log(HAS_PARENT[i], index);
    if (index !== -1) {
      domPathList.length = index + 1;
      break;
    }
  }
  sendConsole("log", "DOM PATH FILTER : ", domPathList);
  for (let index = 0; index < domPathList.length; index++) {
    const node = domPathList[index];
    if (FIND_PARENTS.includes(node["node"]) || index === domPathList.length - 1) {
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
  if (element.id !== "") return '//*[@id="' + element.id + '"]';
  if (element === document.body) return element.tagName.toLowerCase();

  let ix = 0;
  let siblings = element.parentNode.childNodes;
  for (let i = 0; i < siblings.length; i++) {
    let sibling = siblings[i];
    if (sibling === element)
      return getXPath(element.parentNode) + "/" + element.tagName.toLowerCase() + "[" + (ix + 1) + "]";
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) { ix++; }
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
      let sib = el, nth = 1;
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() === selector) nth++;
      }
      selector += ':nth-of-type(' + nth + ')';
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" ");
}

// special case for label: label often has a target (attribute:for). we can use the target to derive locators
function resolveLabelTargetAsLocators(event, locatorList) {
  if (event.target.tagName.toLowerCase() === "label" && event.target.attributes && event.target.attributes["for"]) {
    let targetId = event.target.attributes['for'].value;
    let targetInput = document.getElementById(targetId);
    if (targetInput) {
      let targetTag = (targetInput.tagName || "").toLowerCase();
      let targetType = targetInput.attributes["type"].value;
      let targetValue = targetInput.attributes["value"].value;

      let targetCssPrefix = (targetTag || '') + "#" + targetId +
                            (targetType ? "[type='" + targetType + "']" : "") +
                            (targetValue ? "[value='" + targetValue + "']" : "");

      let targetXpathSuffix = "@id='" + targetId + "']";
      let targetXpathPrefix = "//" + (targetTag || "*") + "[" +
                              (targetType ? "@type='" + targetType + "' and " : "") +
                              (targetValue ? "@value='" + targetValue + "' and " : "");

      locatorList.selectedLocator = "css=" + targetCssPrefix;
      locatorList.locator.push("css=" + targetCssPrefix,
                               "css=#" + targetId,
                               "xpath=" + targetXpathPrefix + targetXpathSuffix,
                               "xpath=//*[" + targetXpathSuffix);
    }
  }
}

// test locators; remove invalid ones
function validateLocators(locatorList) {
  let filtered = locatorList.locator.filter(locator => {
    if (locator.startsWith("css=")) {
      let css = locator.substring(4);
      let matches = document.querySelectorAll(css);
      // sendConsole("log", "testing css selector " + css, matches);
      return matches && matches.length === 1;
    }
    if (locator.startsWith("xpath=")) {
      let xpath = locator.substring(6);
      let matches = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
      // sendConsole("log", "testing xpath selector " + xpath, matches);
      // must return exactly 1 result
      if (matches && matches.resultType === 4) {
        if (!matches.iterateNext()) return false;
        return !matches.iterateNext();
      } else {
        return false;
      }
    }
    if (locator.startsWith("name=")) {
      let name = locator.substring(5);
      let matches = document.getElementsByName(name);
      return matches && matches.length === 1;
    }
    if (locator.startsWith("id=")) { return document.getElementById(locator.substring(3)); }
    return true;
  });

  locatorList.locator = filtered;
  if (filtered && (!locatorList.selectedLocator || !filtered.includes(locatorList.selectedLocator))) {
    locatorList.selectedLocator = filtered[0];
  }
}

function getLocatorList(event) {
  const paths = filterDomPath(event.target);
  const locatorList = getLocator(event.target, paths.domPaths, paths.isFiltered);

  sendConsole("log", "DOM PATH LIST : ", paths.domPaths);
  sendConsole("log", "IS DOM-PATH-LIST FILTERED : ", paths.isFiltered);
  sendConsole("log", "LOCATOR LIST : ", locatorList);

  resolveLabelTargetAsLocators(event, locatorList);
  validateLocators(locatorList);
  if (!locatorList.locator.length) {
    locatorList.locator = ["css=" + getCssPath(event.target), "xpath=" + getXPath(event.target)];
    locatorList.selectedLocator = null;
  }
  return locatorList;
}

function sendInspectInfo(command, event) {
  let locatorList = getLocatorList(event);
  let locator = locatorList.locator;
  let selectedLocator = locatorList.selectedLocator;
  let data = {
    step:    step++,
    command: command,
    param:   {},
    actions: {
      selectedLocator: selectedLocator,
    },
  };

  switch (command) {
    case "click(locator)":
    case "assertElementPresent(locator)":
    case "assertChecked(locator)":
    case "assertNotChecked(locator)":
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
    case "waitForElementTextPresent(locator,text)":
      data.param["locator"] = locator;
      data.param["text"] = selectionText || event.target.innerText || "<MISSING>";
      break;
    case "waitForElementPresent(locator,waitMs)":
    case "waitUntilVisible(locator,waitMs)":
    case "waitUntilEnabled(locator,waitMs)":
      data.param["locator"] = locator;
      data.param["waitMs"] = "<MISSING>";
      break;
    case "checkAll(locator,waitMs)" :
    case "uncheckAll(locator,waitMs)" :
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
      if(!clickedElement) {
        console.error('No element found');
        break;
      }
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
      if(!clickedElement) {
        console.error('No element found');
        break;
      }
      createUI(getLocatorList(clickedElement).locator);
      clickedElement = null;
      break;
  }
  sendConsole("info", `BROWSER : ${request.action} INSPECTING`);
});
