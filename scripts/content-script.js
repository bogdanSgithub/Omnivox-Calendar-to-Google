const url = window.location.hostname;
if (url.endsWith("-lea.omnivox.ca")) {
  const baseUrl = window.location.origin;
  chrome.storage.local.set({ baseUrl });

  CourseCodeToName();
}

function CourseCodeToName() {
  const courseCodeToName = {};
  const panels = Array.from(
    document.getElementsByClassName("card-panel-title")
  );

  panels.forEach((e) => {
    const text = e.textContent.trim();
    const match = text.match(/^(\S+)\s+(.+)$/);
    if (match) {
      const key = match[1];
      const value = match[2];
      courseCodeToName[key] = value;
    }
  });

  chrome.storage.local.set({ courseCodeToName });
}
