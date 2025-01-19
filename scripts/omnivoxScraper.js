export async function getOmnivoxCalendar(url) {
  const baseUrl = new URL(url).origin;
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    return getItems(doc, baseUrl);
  } catch (error) {
    console.error("Request failed", error);
    return null;
  }
}

function getItems(document, baseUrl) {
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
      parseTask(element, item, aTag, baseUrl);
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

function parseTask(element, item, aTag, baseUrl) {
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