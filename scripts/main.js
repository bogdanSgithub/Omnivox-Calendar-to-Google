import { getOmnivoxCalendar, getValueFromStorage } from "./omnivoxScraper.js";

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
  let startTime = new Date(
    `${document.getElementById("start-date").value}T00:00:00`
  );
  const endTime = new Date(
    `${document.getElementById("end-date").value}T00:00:00`
  );
  console.log(`start: ${startTime}, end: ${endTime}`);
  if (!startTime || !endTime) {
    alert("Please fill out both start and end dates.");
    return;
  }
  if (!token) {
    alert("Please sign into Google.");
    return;
  }

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
