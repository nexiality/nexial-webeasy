/***************** popup to show locator list ********************/
function copyLocator(str) {
  let dummy = document.getElementById("nexial-selected-locator");
  dummy.focus();
  dummy.select();
  document.execCommand('copy');
}

function createSelectLocator(locator) {
  let div = document.getElementById("nexial-locator-list");
  let selectedLocatorElement = document.getElementById("nexial-selected-locator");
  const locatorDropdown = createSelectElement(locator, 'nexial-locator-select');
  locatorDropdown.onchange = function (event) {
    selectedLocatorElement.value = '';
    selectedLocatorElement.value = event.target.value;
  }
  div.appendChild(locatorDropdown);
}

function createUI(locator) {
  const ui = document.getElementById("nexial-show-locator-sideNav");
  if(!ui) {
    document.body.innerHTML += `
    <div id="nexial-show-locator-sideNav" class="sidenavR">
    <div id="nexial-show-locator-header">
      Nexial Show Locator
      <ul class="nav float-right headerOption">
        <li id="nexial-showHelp" title="Click to here more about Nexial WebEZ"> ? </li>
        <li id="nexial-closebtn" title="Hide Nexial WebEZ"> x </li>
      </ul>
    </div>
      <!-- <button type="button" class="nexial-closebtn"> x </button> -->
      <div id="nexial-locator-list">
      </div>
      <div id="nexial-copy-container">
        <textarea id="nexial-selected-locator" spellcheck="false"> </textarea>
        <button id="nexial-copybtn"> copy </button>
      </div>
    </div>
    `;
    document.getElementById("nexial-copybtn").addEventListener("click", function() {
      copyLocator(document.getElementById("nexial-selected-locator").value);
    });
  } else {
    document.getElementById("nexial-locator-list").innerHTML = '';
  }
  createSelectLocator(locator);
  closeNavR();
}

function closeNavR() {
  document.getElementById("nexial-closebtn").addEventListener("click", function() {
    document.getElementById("nexial-show-locator-sideNav").remove();
  })
}

function createRightPannel(locator) {
  createUI(locator);
}

function findLocator(clickedElement) {
  const paths = filterDomPath(clickedElement.target, '');
  const locatorList = getLocator(clickedElement.target, paths.domPaths, paths.isFiltered);
  let locator = locatorList.locator;
  if (!locator.length) {
    locator = ["css=" + getCssPath(clickedElement.target), "xpath=" + getXPath(clickedElement.target)];
  }
  createRightPannel(locator);
}