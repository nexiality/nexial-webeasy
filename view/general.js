function createSelectElement(items, id, editable = true) {
  // Create and append select list
  let selectList = document.createElement("select");
  selectList.setAttribute('class', 'form-control');
  selectList.setAttribute('id', id);
  if (!editable) selectList.setAttribute('disabled', 'true');

  //Create and append the options
  let optgroup = '', optgroupLabel = '';
  for (let index = 0; index < items.length; index++) {
    if ((items[index]).includes('=') && optgroupLabel !== items[index].split('=')[0]) {
      optgroupLabel = items[index].split('=')[0];
      optgroup = document.createElement("optgroup");
      optgroup.setAttribute('label', optgroupLabel.toUpperCase())
    }

    let optionText = items[index];
    let option = document.createElement("option");
    // todo: is this even possible?
    if (optionText && optionText.startsWith('xpath=')) { optionText = optionText.substring(6); }
    option.value = optionText;
    option.text = optionText;
    if (optgroup) {
      optgroup.appendChild(option);
      selectList.appendChild(optgroup);
    } else
      selectList.appendChild(option);
  }
  return selectList;
}