function sendConsole(level, logging, data = null) {
  const payload = {
    cmd: "console",
    msg: logging,
    data: data,
    type: level,
  };
  if (APP_ENV === "development") {
    printLog(level, logging, data);
    chrome.runtime.sendMessage(payload);
  }
}
// ToDo: create funtion fron error log of contenscript i.e browser

function printLog(level, logging, data = null) {
  switch (level) {
    case "group":
      console.group(logging);
      break;
    case "groupEnd":
      console.groupEnd(logging);
      break;
    case "time":
      console.time(logging);
      break;
    case "timeEnd":
      console.timeEnd(logging);
      break;
    case "log":
      console.log(logging, data);
      break;
    case "info":
      console.info(logging);
      break;
    case "warn":
      console.warn(logging);
      break;
    case "error":
      console.error(logging);
      break;
    case "table":
      console.table(logging);
      break;
  }
}
