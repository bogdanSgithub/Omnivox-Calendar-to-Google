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
