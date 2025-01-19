let authToken = "";

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "contentReady") {
    authenticateUser();
  }
});

function authenticateUser() {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    if (chrome.runtime.lastError) {
      console.error("Error getting auth token: " + chrome.runtime.lastError);
      return;
    }

    authToken = token;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        console.log("sending events");
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "authCompleted",
          authenticated: true,
          token: authToken,
        });
      } else {
        console.error("No active tab found.");
      }
    });
  });
}
