/***************** popup to show locator list ********************/
const SHOW_LOCATOR_TAG = 'nexial-webez-show-locator';
const SELECTED_LOCATOR = "nexial-selected-locator";
const LOCATOR_LIST = "nexial-locator-list";
const COPY_BUTTON = "nexial-copybtn";
const CLOSE_BUTTON = "nexial-closebtn";
const HELP_BUTTON = "nexial-showHelp";

function copyLocator(str) {
  let dummy = document.getElementById(SELECTED_LOCATOR);
  dummy.focus();
  dummy.select();
  document.execCommand('copy');
}

function createSelectLocator(locator) {
  const locatorDropdown = createSelectElement(locator, 'nexial-locator-select');
  locatorDropdown.onchange = function (event) {
    document.getElementById(SELECTED_LOCATOR).value = event.target.selectedOptions[0].value;
  }

  let div = document.getElementById(LOCATOR_LIST);
  div.appendChild(locatorDropdown);

  document.getElementById(SELECTED_LOCATOR).value = locatorDropdown.selectedOptions[0].value;
}

function createUI(locator) {
  const ui = document.getElementsByTagName(SHOW_LOCATOR_TAG)[0];
  if (ui) { ui.remove(); }

  let showLocator = document.createElement(SHOW_LOCATOR_TAG);
  showLocator.innerHTML = `
      <div id="nexial-show-locator-header">
          Nexial WebEZ Locator
          <ul class="nav float-right headerOption">
              <li id="${HELP_BUTTON}" title="Click to here more about Nexial WebEZ Locator"> ? </li>
              <li id="${CLOSE_BUTTON}" title="Hide Nexial WebEZ Locator"> x </li>
          </ul>
      </div>
      <div class="locator_options">
        Locators derived for the selected element:<br/>
        <div id="${LOCATOR_LIST}"></div>
        <br/>
        Currently selected locator (editable):<br/>
        <textarea id="${SELECTED_LOCATOR}" spellcheck="false"></textarea>
        <button id="${COPY_BUTTON}" title="click to copy the above locator to clipboard">copy to clipboard</button>
      </div>
    `;
  document.body.appendChild(showLocator);

  createUIEvents();
  createSelectLocator(locator);
}

function createUIEvents() {
  document.getElementById(HELP_BUTTON).addEventListener("click", function () {
    window.open("https://nexiality.github.io/documentation/webez/ShowLocator.html", "_nexial_link");
  });

  document.getElementById(CLOSE_BUTTON).addEventListener("click", function () {
    document.getElementsByTagName(SHOW_LOCATOR_TAG)[0].remove();
  });

  document.getElementById(COPY_BUTTON).addEventListener("click", function () {
    copyLocator(document.getElementById(SELECTED_LOCATOR).value);
  });
}

function findLocator(clickedElement) {
  const paths = filterDomPath(clickedElement.target, '');
  let locator = getLocator(clickedElement.target, paths.domPaths, paths.isFiltered).locator;

  locator = validateLocators(locator);
  if (!locator.length) {
    locator = ["css=" + getCssPath(clickedElement.target), "xpath=" + getXPath(clickedElement.target)];
  }

  createUI(locator);
}