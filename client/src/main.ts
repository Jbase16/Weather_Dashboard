import "./styles/jass.css";

const searchForm = document.getElementById(
  "search-form"
) as HTMLFormElement | null;
const searchInput = document.getElementById(
  "search-input"
) as HTMLInputElement | null;
const todayContainer = document.querySelector(
  "#today"
) as HTMLDivElement | null;
const forecastContainer = document.querySelector(
  "#forecast"
) as HTMLDivElement | null;
const searchHistoryContainer = document.getElementById(
  "history"
) as HTMLDivElement | null;
const heading = document.getElementById(
  "search-title"
) as HTMLHeadingElement | null;
const weatherIcon = document.getElementById(
  "weather-img"
) as HTMLImageElement | null;
const tempEl = document.getElementById("temp") as HTMLParagraphElement | null;
const windEl = document.getElementById("wind") as HTMLParagraphElement | null;
const humidityEl = document.getElementById(
  "humidity"
) as HTMLParagraphElement | null;

/*

API Calls

*/

const fetchWeather = async (city: string): Promise<void> => {
  try {
    const response = await fetch("/api/weather/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const weatherData = await response.json();

    console.log("weatherData: ", weatherData);

    if (Array.isArray(weatherData) && weatherData.length > 0) {
      renderCurrentWeather(weatherData[0]);
      renderForecast(weatherData.slice(1));
    } else {
      console.error("Invalid weather data received:", weatherData);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};

const fetchSearchHistory = async (): Promise<Response> => {
  try {
    const response = await fetch("/api/weather/history", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch search history");
    }

    return response;
  } catch (error) {
    console.error("Error fetching search history:", error);
    throw error; // Rethrow so the caller knows it failed
  }
};

const deleteCityFromHistory = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/weather/history/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete city from history");
    }
  } catch (error) {
    console.error("Error deleting city from history:", error);
  }
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: any): void => {
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } =
    currentWeather;

  if (heading && weatherIcon && tempEl && windEl && humidityEl) {
    heading.textContent = `${city} (${date})`;
    weatherIcon.setAttribute(
      "src",
      `https://openweathermap.org/img/w/${icon}.png`
    );
    weatherIcon.setAttribute("alt", iconDescription);
    weatherIcon.setAttribute("class", "weather-img");
    heading.append(weatherIcon);
    tempEl.textContent = `Temp: ${tempF}°F`;
    windEl.textContent = `Wind: ${windSpeed} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;

    if (todayContainer) {
      todayContainer.innerHTML = "";
      todayContainer.append(heading, tempEl, windEl, humidityEl);
    }
  }
};

const renderForecast = (forecast: any[]): void => {
  const headingCol = document.createElement("div");
  const heading = document.createElement("h4");

  headingCol.setAttribute("class", "col-12");
  heading.textContent = "5-Day Forecast:";
  headingCol.append(heading);

  if (forecastContainer) {
    forecastContainer.innerHTML = "";
    forecastContainer.append(headingCol);
  }

  for (let i = 0; i < forecast.length; i++) {
    renderForecastCard(forecast[i]);
  }
};

const renderForecastCard = (forecast: any): void => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  // Add content to elements
  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    "src",
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute("alt", iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

const renderSearchHistory = async (searchHistory: Response): Promise<void> => {
  try {
    const historyList = await searchHistory.json();

    if (searchHistoryContainer) {
      searchHistoryContainer.innerHTML = "";

      if (!historyList.length) {
        searchHistoryContainer.innerHTML =
          '<p class="text-center">No Previous Search History</p>';
      }

      // * Start at end of history array and count down to show the most recent cities at the top.
      for (let i = historyList.length - 1; i >= 0; i--) {
        const historyItem = buildHistoryListItem(historyList[i]);
        searchHistoryContainer.append(historyItem);
      }
    }
  } catch (error) {
    console.error("Error rendering search history:", error);
  }
};

/*

Helper Functions

*/

const createForecastCard = (): {
  col: HTMLDivElement;
  cardTitle: HTMLHeadingElement;
  weatherIcon: HTMLImageElement;
  tempEl: HTMLParagraphElement;
  windEl: HTMLParagraphElement;
  humidityEl: HTMLParagraphElement;
} => {
  const col = document.createElement("div");
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const cardTitle = document.createElement("h5");
  const weatherIcon = document.createElement("img");
  const tempEl = document.createElement("p");
  const windEl = document.createElement("p");
  const humidityEl = document.createElement("p");

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add("col-auto");
  card.classList.add(
    "forecast-card",
    "card",
    "text-white",
    "bg-primary",
    "h-100"
  );
  cardBody.classList.add("card-body", "p-2");
  cardTitle.classList.add("card-title");
  tempEl.classList.add("card-text");
  windEl.classList.add("card-text");
  humidityEl.classList.add("card-text");

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

const createHistoryButton = (city: string): HTMLButtonElement => {
  const btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.setAttribute("aria-controls", "today forecast");
  btn.classList.add("history-btn", "btn", "btn-secondary", "col-10");
  btn.textContent = city;

  return btn;
};

const createDeleteButton = (): HTMLButtonElement => {
  const delBtnEl = document.createElement("button");
  delBtnEl.setAttribute("type", "button");
  delBtnEl.classList.add(
    "fas",
    "fa-trash-alt",
    "delete-city",
    "btn",
    "btn-danger",
    "col-2"
  );

  delBtnEl.addEventListener("click", handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = (): HTMLDivElement => {
  const div = document.createElement("div");
  div.classList.add("display-flex", "gap-2", "col-12", "m-1");
  return div;
};

const buildHistoryListItem = (city: any): HTMLDivElement => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/*
Initial Render
*/

const getAndRenderHistory = (): void => {
  fetchSearchHistory()
    .then(renderSearchHistory)
    .catch((error) => {
      console.error("Error rendering search history:", error);
    });
};

/*
Event Handlers
*/

const handleSearchFormSubmit = (event: Event): void => {
  event.preventDefault();

  if (searchInput && !searchInput.value) {
    console.error("City cannot be blank");
    return;
  }

  const search: string = searchInput?.value.trim() || "";
  fetchWeather(search)
    .then(() => {
      return getAndRenderHistory();
    })
    .catch((error) => {
      console.error("Error during search form submission:", error);
    });

  if (searchInput) {
    searchInput.value = "";
  }
};

const handleSearchHistoryClick = (event: Event): void => {
  const target = event.target as HTMLElement;
  if (target.matches(".history-btn")) {
    const city = target.textContent || "";
    fetchWeather(city)
      .then(getAndRenderHistory)
      .catch((error) => {
        console.error("Error fetching weather from search history:", error);
      });
  }
};

const handleDeleteHistoryClick = (event: Event): void => {
  const target = event.target as HTMLElement;
  const cityID = JSON.parse(target.getAttribute("data-city") || "{}").id;

  deleteCityFromHistory(cityID)
    .then(getAndRenderHistory)
    .catch((error) => {
      console.error("Error deleting city from history:", error);
    });
};

// Add event listeners with proper error handling
searchForm?.addEventListener("submit", handleSearchFormSubmit);
searchHistoryContainer?.addEventListener("click", handleSearchHistoryClick);

// Initialize with proper error handling
getAndRenderHistory();
