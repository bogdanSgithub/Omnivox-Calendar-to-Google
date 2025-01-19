import { getOmnivoxCalendar } from "./omnivoxScraper.js";

function getValueFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(result[key]);
      }
    });
  });
}

let token = null;

document.getElementById("login-button").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "loginWithGoogle" }, (response) => {
    if (response.success) {
      alert("Successfully authenticated with Google!");
      token = response.token;
    } else {
      alert("Authentication failed.");
    }
  });
});

document
  .getElementById("save-to-google")
  .addEventListener("click", saveToGoogle);

async function saveToGoogle() {
  let startTime = document.getElementById("start-date").value;
  let endTime = document.getElementById("end-date").value;
  if (!startTime || !endTime) {
    alert("Please fill out both start and end dates.");
    return;
  }
  if (!token) {
    alert("Please sign into Google.");
    return;
  }
  startTime = new Date(startTime);
  endTime = new Date(endTime);

  const baseUrl = await getValueFromStorage("baseUrl");

  while (startTime <= endTime) {
    const year = startTime.getFullYear();
    const month = startTime.getMonth() + 1;
    const calendarUrl = `${baseUrl}/cvir/clre/default.aspx?cal=somm&mode=liste&jour=1&annee=${year}&mois=${month}`;
    const items = await getOmnivoxCalendar(calendarUrl);
    items.forEach((item) => {});
    console.log(items);

    startTime.setMonth(startTime.getMonth() + 1);
  }
}
