document.getElementById("save-to-google").addEventListener("click", () => {
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;

  if (!startTime || !endTime) {
    alert("Please fill out both start and end times.");
    return;
  }

  // Format the times for Google Calendar URL
  const formattedStartTime = new Date(startTime)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, "");
  const formattedEndTime = new Date(endTime)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, "");
});
