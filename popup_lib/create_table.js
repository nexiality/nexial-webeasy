function createDuplicateButton() {

}

function createDeleteButton(i) {
  var button = document.createElement('button');
  button.setAttribute('class', 'btn text-dark delete-button ripple-surface')
  button.innerHTML = '<i class="fa fa-trash"></i>';
  button.onclick = function(e) {
    console.log(i, '  == i ')
    inspectElementList.splice(i-1, 1);
    table.deleteRow(i);
    console.log(inspectElementList, '  inspectElementList')
  };
  return button;
}

function createSelectElement(items) {
  // Create and append select list
  var selectList = document.createElement("select");
  selectList.id = "mySelect";
  // console.log(items)

  //Create and append the options
  for (var index = 0; index < items.length; index++) {
    var option = document.createElement("option");
    option.value = items[index];
    option.text = items[index];
    selectList.appendChild(option);
  }
  return selectList;
}

function tableFromJson(inspectElementList) {
  var col = [];
  for (var i = 0; i < inspectElementList.length; i++) {
    for (var key in inspectElementList[i]) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }
  }

  // Create a table.
  var table = document.createElement("table");
  table.setAttribute('class', 'table table-hover table-bordered table-responsive-md text-center');

  // Create table header row using the extracted headers above.
  var tr = table.insertRow(-1);                   // table row.

  for (var i = 0; i < col.length; i++) {
    var th = document.createElement("th");      // table header.
    th.innerHTML = col[i];
    tr.appendChild(th);
  }

  // add json data to the table as rows.
  for (var i = 0; i < inspectElementList.length; i++) {

    tr = table.insertRow(-1);

    for (var j = 0; j < col.length; j++) {
      var tabCell = tr.insertCell(-1);

      if (col[j] === "edits") {
        const button = createDeleteButton(i)
        tabCell.appendChild(button);
      } else if(col[j] === 'target') {
        const selectList = createSelectElement(inspectElementList[i][col[j]])
        tabCell.appendChild(selectList);
      } else {
        tabCell.setAttribute('class', 'pt-3-half');
        tabCell.setAttribute('contenteditable', 'true');
        tabCell.innerHTML = inspectElementList[i][col[j]];
      }
    }
  }

  // Now, add the newly created table with json data, to a container.
  var divShowData = document.getElementById('showData');
  divShowData.innerHTML = "";
  divShowData.appendChild(table);
      
  // document.getElementById('msg').innerHTML = '<br />You can later <a href="https://www.encodedna.com/javascript/dynamically-add-remove-rows-to-html-table-using-javascript-and-save-data.htm" target="_blank" style="color:#1464f4;text-decoration:none;">get all the data from table and save it in a database.</a>';
}