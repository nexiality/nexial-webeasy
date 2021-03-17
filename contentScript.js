console.log('Im foreground page');
// capture element of foreground page
// document.querySelector('.rSk4se').classList.add('spinspinspin')

// chrome.runtime.sendMessage({cmd: 'script_loaded', value: 'true'});
// var port = chrome.runtime.connect({name: "browser.nexialautomation"});
var clickedEl = null;
function getLocator(e) {
  return [
    ('xpath=//' + (e.tagName).toLowerCase() + '#' + e.id),
    ('xpath=//' + (e.tagName).toLowerCase() + '#' + e.id + '.' + e.classList[0]),
    ('id=' + e.id),
  ]
}

document.addEventListener("contextmenu", function(event){
  clickedEl = event;
  console.log('in side contentscript contextmenu', event)
}, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request, ' ---------------- request')
  if(request == "getClickedEl") {
    console.log(clickedEl, ' ---------------- clickedE1')
    sendResponse({
      command: "contextmenu",
      target: getLocator(clickedEl.target),
      input: ''
    });
  }
});

