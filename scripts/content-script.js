const url = window.location.hostname;
if (url.endsWith("-lea.omnivox.ca")) {
  const baseUrl = window.location.origin;
  chrome.storage.local.set({ baseUrl });
}
