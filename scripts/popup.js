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

  const baseUrl = await getValueFromStorage("baseUrl");
  console.log(baseUrl);
  startTime = new Date(startTime);
  endTime = new Date(endTime);
  console.log("hello?");
  while (startTime <= endTime) {
    const year = startTime.getFullYear();
    const month = startTime.getMonth() + 1;
    const calendarUrl = `${baseUrl}/cvir/clre/default.aspx?cal=somm&mode=liste&jour=1&annee=${year}&mois=${month}`;
    const items = await getOmnivoxCalendar(calendarUrl);
    console.log(items);

    startTime.setMonth(startTime.getMonth() + 1);
  }
}
