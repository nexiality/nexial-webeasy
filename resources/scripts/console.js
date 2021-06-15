function sendConsole(level, logging, data = null) {
  printLog(level, logging, data);
  const payload = {
    cmd : 'console',
    msg : logging,
    data: data,
    type: level
  };
  // if (!chrome || !chrome.runtime || !payload) return;
  // chrome.runtime.reload();  // Fall back to contentscript-only behavior
  chrome.runtime.sendMessage(payload);
}

function printLog(level, logging, data = null) {
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
      console.log(logging, data)
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