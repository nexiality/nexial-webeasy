var clickedElement = null;

document.addEventListener("contextmenu", function (event) {
  clickedElement = event;
}, true);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === "getContextMenuElement") {
    const paths = getDomPath(clickedElement.target);
    const param = {
      locator: getLocator(clickedElement.target, paths),
      text: clickedElement.target.text,
      value: clickedElement.target.value
    };
    sendResponse({res: "contextmenu", step: step++, param: param});
  }
});
