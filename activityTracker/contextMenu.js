console.log('context menu')

chrome.contextMenus.create({
  'id': "nexialSelectText",
  "title": "Assert element preset",
  "contexts": ["selection"]
});

var clickHandler = function(e) {
  var url = e.pageUrl;
  console.log(e)
  if(e.menuItemId == "nexialSelectText" && e.selectionText) {
    //push to json
    // chrome.runtime.sendMessage({cmd:'contextmenu', type:'Assert element preset', value: e})
  }
}

chrome.contextMenus.onClicked.addListener(clickHandler);
