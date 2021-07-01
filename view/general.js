function createSelectElement(items, editable = true) {
  // Create and append select list
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