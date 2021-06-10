function sendConsole(level, logging) {
  printLog(level, logging);
  const payload = {
    cmd  : 'console',
    data: logging,
    type: level
  };
  // if (!chrome || !chrome.runtime || !payload) return;
  // chrome.runtime.reload();  // Fall back to contentscript-only behavior
  chrome.runtime.sendMessage(payload);
}

function printLog(level, logging) {
  switch (level) {
    case 'group':
      console.group(logging)
      break;
    case 'groupEnd':
      console.groupEnd(logging)
      break;
    case 'time':
      console.time(logging)
      break;
    case 'timeEnd':
      console.timeEnd(logging)
      break;
    case 'log':
      console.log(logging)
      break;
    case 'info':
      console.info(logging)
      break;
    case 'warn':
      console.warn(logging)
      break;
    case 'error':
      console.error(logging)
      break;
    case 'table':
      console.table(logging)
      break;
  }
}