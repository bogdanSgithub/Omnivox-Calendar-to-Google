chrome.runtime.sendMessage({ type: "contentReady" });
const baseUrl = window.location.origin;

async function main() {
  const startDate = "2024-10-01";
  const endDate = "2025-12-18";

  let start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (start <= end) {
    const year = start.getFullYear();
    const month = start.getMonth() + 1;
    const calendarUrl = `${baseUrl}/cvir/clre/default.aspx?cal=somm&mode=liste&jour=1&annee=${year}&mois=${month}`;
    const doc = await getHtmlPage(calendarUrl);
    const items = getItems(doc);
    console.log(items);

    start.setMonth(start.getMonth() + 1);
  }
}

main();

async function getHtmlPage(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    return doc;
  } catch (error) {
    console.error("Request failed", error);
    return null;
  }
}

function getItems(document) {
  let dateElement = null;
  const monthYear = document
    .querySelector(".NomMoisMiniature")
    .innerText.trim();
  const items = [];
  const tdAfficheListeElements = document.querySelectorAll(".tdAfficheListe");

  tdAfficheListeElements.forEach((element) => {
    const item = {
      summary: "",
      location: "",
      description: "",
      start: {
        dateTime: "",
        timeZone: "America/New_York",
      },
      end: {
        dateTime: "",
        timeZone: "America/New_York",
      },
    };

    const aTag = element.querySelector("a");
    if (aTag) {
      parseTask(element, item, aTag);
    } else {
      parseEvent(element, item);
    }

    const newDateElement =
      element.previousElementSibling?.previousElementSibling;
    if (
      newDateElement &&
      newDateElement.innerHTML.trim() !== "&nbsp;" &&
      newDateElement.classList.contains("tdAfficheListeDate")
    ) {
      dateElement = newDateElement;
    }
    if (dateElement == null) return;
    const dayMatch = dateElement.innerText.match(/\d+/);

    if (dayMatch) {
      const day = dayMatch[0];
      const [monthName, year] = monthYear.split(" ");

      const dateStr = `${monthName} ${day}, ${year}`;
      const startDate = new Date(dateStr);

      item.start.dateTime = startDate;
      item.end.dateTime = new Date(startDate);
    }

    items.push(item);
  });

  return items;
}

function parseTask(element, item, aTag) {
  let hourInfo = null;
  const onclickAttr = aTag.getAttribute("onclick");
  let url = null;
  if (onclickAttr) {
    url = onclickAttr.match(/'([^']+)'/)[1];
  } else {
    url = aTag.getAttribute("href");
  }

  item.description = baseUrl + url;
  const classText = aTag.innerText.replace("Class:", "").trim();
  const text = element.innerHTML.replace(aTag.outerHTML, "").trim();
  const hourSpan = element.querySelector(".tdAfficheListeHeure");

  if (hourSpan) {
    hourInfo = hourSpan.innerText.trim();
  }

  const cleanedText = hourInfo
    ? text.replace(hourSpan.outerHTML, "").trim()
    : text;

  const details = cleanedText.split("<br>");
  details.shift();
  const mainSummary = details.splice(0, 2);
  mainSummary.reverse();
  item.summary = hourInfo
    ? `${mainSummary} (${hourInfo}) - ${classText}`
    : `${mainSummary} - ${classText}`;
  item.description += `\n${details.join("\n").trim()}`;
}

function parseEvent(element, item) {
  let hourInfo = null;
  const text = element.innerHTML.replace("Class:", "").trim();
  const hourSpan = element.querySelector(".tdAfficheListeHeure");

  if (hourSpan) {
    hourInfo = hourSpan.innerText.trim();
  }

  const cleanedText = hourInfo
    ? text.replace(hourSpan.outerHTML, "").trim()
    : text;

  const [classText, mainSummary, ...details] = cleanedText.split("<br>");

  item.summary = hourInfo
    ? `${mainSummary} (${hourInfo}) - ${classText}`
    : `${mainSummary} - ${classText}`;

  const filteredDetails = details.filter((line) => !line.includes(hourInfo));
  item.description = `${filteredDetails.join("\n").trim()}`;
}

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.type === "authCompleted" && message.authenticated) {
    const token = message.token;
    /*const items = getItems();
    const existingItems = await fetchExistingItems(token);
    items.forEach((item) => {
      console.log(item);
      saveCalendarItem(token, item, existingItems);
    });*/
  }
});

async function saveCalendarItem(token, item, existingItems) {
  let isAlreadySaved = false;

  for (let i = 0; i < existingItems.length; i++) {
    const element = existingItems[i];
    if (
      (element.hasOwnProperty("summary") && element.summary === item.summary) ||
      (element.hasOwnProperty("title") && element.title === item.summary)
    ) {
      isAlreadySaved = element;
      break;
    }
  }

  if (isAlreadySaved) {
    return;
  }

  if (item.description == "") {
    await saveAsEvent(token, item);
  } else {
    await saveAsTask(token, item);
  }
}

async function saveAsEvent(token, event) {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    console.log("Error saving event:", await response.text(), event);
  } else {
    console.log("Event saved successfully!");
  }
}

async function saveAsTask(token, event) {
  const task = {
    title: event.summary,
    notes: event.description,
    due: event.start.dateTime,
  };

  const response = await fetch(
    "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    }
  );

  if (!response.ok) {
    console.error("Error saving task:", await response.text());
  } else {
    console.log("Task saved successfully!");
  }
}

async function fetchExistingItems(token, timeMin, timeMax) {
  /*
  const [monthName, year] = monthYear.split(" ");
  const month = new Date(`${monthName} 1, ${year}`).getMonth();

  const startOfMonth = new Date(Date.UTC(year, month, 1));
  const endOfMonth = new Date(Date.UTC(year, month + 1, 0));

  const timeMin = new Date(
    startOfMonth.getTime() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const timeMax = new Date(
    endOfMonth.getTime() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  */
  const eventsResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const eventsData = await eventsResponse.json();

  const tasksResponse = await fetch(
    "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const tasksData = await tasksResponse.json();

  const combinedItems = [
    ...(eventsData.items || []),
    ...(tasksData.items || []),
  ];

  return combinedItems;
}
