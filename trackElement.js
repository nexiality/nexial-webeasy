console.log('track element')
function getDomPath(el) {
  var stack = [];
  while ( el.parentNode != null ) {
    console.log(el.nodeName);
    var sibCount = 0;
    var sibIndex = 0;
    for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
      var sib = el.parentNode.childNodes[i];
      if ( sib.nodeName == el.nodeName ) {
        if ( sib === el ) {
          sibIndex = sibCount;
        }
        sibCount++;
      }
    }
    if ( el.hasAttribute('id') && el.id != '' ) {
      stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
    } else if ( sibCount > 1 ) {
      stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
    } else {
      stack.unshift(el.nodeName.toLowerCase());
    }
    el = el.parentNode;
  }
  return stack.slice(1); // removes the html element
}

document.addEventListener("click", function( event ) {
  // highlight the mouseenter target
  console.log((event), "-- CLICK---");
  var path = getDomPath(event.target);
  var xpath = path.join(' > ');
console.log(path.join(' > '));
  var target = (event.target);

  var elId = target.id;

  event.target.style.color = "purple";
  var data = {
    id: elId,
    tagName: target.tagName,
    parentElement:  target.parentElement,
    xpath: xpath
  }

  console.log(data)
  var command = 'element_click', commandValue = data;  
  chrome.runtime.sendMessage({cmd: command, value: commandValue}, function(response) {
    console.log(response, "  track element recv");
  });
  
}, true);

// This handler will be executed only once when the cursor
// moves over the unordered list
// document.addEventListener("mouseenter", function( event ) {
//   // highlight the mouseenter target
//   console.log((event.target), "-- enter");
//   // var target = $(event.target);
//   // var elId = target.attr('id');
//   // if( target.is(".el") ) {
//   //   alert('The mouse was over'+ elId );
//   // }
//   event.target.style.color = "purple";
//   // reset the color after a short delay
//   setTimeout(function() {
//     event.target.style.color = "";
//   }, 500);
// }, true);

// This handler will be executed every time the cursor
// is moved over a different list item
// window.onmouseover=function( event ) {
//   // highlight the mouseover target
//   event.target.style.color = "orange";
//   console.log((event.target), "-- onmouseover");
//   var path = getDomPath(event.target);
// console.log(path.join(' > '));
//   // reset the color after a short delay
//   setTimeout(function() {
//     event.target.style.color = "";
//   }, 500);
// };