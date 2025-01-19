let authToken = "";

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "loginWithGoogle") {
    authenticateUser(sendResponse);
    return true;
  }
});

function authenticateUser(sendResponse) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    if (chrome.runtime.lastError) {
      console.error("Error getting auth token: " + chrome.runtime.lastError);
      sendResponse({ success: false });
      return;
    }
    authToken = token;
    sendResponse({ success: true, token: authToken });
  });
}
