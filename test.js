import { getOmnivoxCalendar } from "./scripts/omnivoxScraper.js";

document
  .getElementById("save-to-google")
  .addEventListener("click", async () => {
    let startDate = document.getElementById("start-date").value;
    let endDate = document.getElementById("end-date").value;

    if (!startDate || !endDate) {
      alert("Please fill out both start and end dates.");
      return;
    }
    const year = startTime.getFullYear();
    const month = startTime.getMonth() + 1;
    const calendarUrl = `${baseUrl}/cvir/clre/default.aspx?cal=somm&mode=liste&jour=1&annee=${year}&mois=${month}`;
    const items = await getOmnivoxCalendar(calendarUrl);
    console.log(items);

    // Add time portion as midnight for Google Calendar
    const formattedStartDate = new Date(`${startDate}T00:00:00`)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const formattedEndDate = new Date(`${endDate}T23:59:59`)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
  });
