"use strict";

// global
const LOG_DEBUG = true;
const LOG_ERROR = true;

let Logger = {
  debug: function (/*any?*/message, /*...any*/data) {
    if (!LOG_DEBUG) { return; }
    console.log(message, data);
  },

  error: function (/*any?*/message, /*...any*/data) {
    if (!LOG_ERROR) { return; }
    console.error(message, data);
  }
}

let Messenger = {

  sendInternalMessage: function (/*any*/message, /*function?*/callback) {
    if (!message) { return; }

    let runtime = chrome.runtime;
    if (!runtime) { Logger.error(`UNABLE TO OBTAIN CHROME RUNTIME; MESSAGE NOT SEND: ${message}`); }

    runtime.sendMessage(
      message,
      callback || function (response) { Logger.debug(`MESSAGE SENT: ${message}\nRESPONSE RECEIVED: ${response}`); }
    );
  }
}
