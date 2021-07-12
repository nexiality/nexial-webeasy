/***************** popup to show locator list ********************/
function copyLocator(str) {
  console.log(str);
  let dummy = document.getElementById("nexial-selected-locator");
  dummy.focus();
  dummy.select();
  document.execCommand('copy');
}

function createLocatorList(locator) {
  let ul = document.getElementById("nexial-locator-list");
  let selectedLocatorElement = document.getElementById("nexial-selected-locator");

  for (let index = 0; index < locator.length; index++) {
    let li = document.createElement("li");
    let copyBtn = document.createElement('button');

    li.appendChild(document.createTextNode(locator[index]));
    copyBtn.innerHTML = 'copy';
    copyBtn.addEventListener("click", function () {
      selectedLocatorElement.value = '';
      selectedLocatorElement.value = locator[index];
      copyLocator(locator[index]);
    });
    li.appendChild(copyBtn);
    ul.appendChild(li);      
  }
}

function createUI(locator) {
  if(!document.getElementById("mySidenavR")) {
    document.body.innerHTML += `
    <div id="mySidenavR" class="sidenavR">
      <button type="button" class="closebtn"> x </button>
      <ul id="nexial-locator-list">
      </ul>
      <div class="copy-content">
        <textarea id="nexial-selected-locator" spellcheck="false"> </textarea>
      </div>
    </div>
    `;
  } else {
    document.getElementById("nexial-locator-list").innerHTML = '';
  }
  createLocatorList(locator)
}

// function openNavR() {
//   document.getElementById("mySidenavR").style.width = "250px";
// }

function closeNavR() {
  document.getElementById("mySidenavR").querySelector("button").addEventListener("click", function() {
    // document.getElementById("mySidenavR").style.width = "0";
    document.getElementById("mySidenavR").remove();
    // document.getElementById("nexial-locator-select").remove();
  })
}

function createRightPannel(locator) {
  createUI(locator);
  // openNavR();
  closeNavR();
}

// function createLocatorDialog(locator) {
//   document.body.innerHTML += `
//   <dialog class="nexial-dialog-container">
//     <div class="show-locator-header">Show Selector</div>
//     <button type="button" class="close" data-dismiss="modal"> × </button>
//     <div class="locator-content">
//     </div>
//     <div class="copy-content">
//     <textarea class="form-control nexial-selected-locator"> </textarea>
//     </div>
//   </dialog>
//   `;

//   let dialog = document.getElementsByClassName("nexial-dialog-container")[0];
//   dialog.style.position = "absolute";
//   dialog.style.position = "relative";
//   dialog.style.border = "1px solid #999";
//   dialog.style.border = "1px solid rgba(0,0,0,.2)";
//   dialog.style.outline = "0";
//   dialog.getElementsByClassName("show-locator-header")[0].style.display = "inline-block";
//   dialog.getElementsByClassName("close")[0].style.float = "right";

//   const selectedLocator = dialog.getElementsByClassName("nexial-selected-locator")[0];
//   const cmdDropdown = createSelectElement(locator);
//   cmdDropdown.onchange = function (event) {
//     selectedLocator.value = '';
//     selectedLocator.value = event.target.value;
//     // console.log(event, '#############')
//   }
//   cmdDropdown.style.margin = "25px 0px";
//   selectedLocator.style.width = "100%";
//   dialog.getElementsByClassName("locator-content")[0].appendChild(cmdDropdown);
//   dialog.querySelector("button").addEventListener("click", function() {
//     cmdDropdown.remove();
//     dialog.close();
//   })
//   dialog.showModal();
// }

function findLocator() {
  const paths = filterDomPath(clickedElement.target, '');
  const locatorList = getLocator(clickedElement.target, paths.domPaths, paths.isFiltered);
  let locator = locatorList.locator;
  if (!locator.length) {
    locator = ["css=" + getCssPath(clickedElement.target), "xpath=" + getXPath(clickedElement.target)];
  }
  // createLocatorDialog(locator);
  createRightPannel(locator);
}