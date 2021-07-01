/***************** popup to show locator list ********************/

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
  const cmdDropdown = createSelectElement(locator);
  cmdDropdown.onchange = function (event) {
    selectedLocator.value = '';
    selectedLocator.value = event.target.value;
    // console.log(event, '#############')
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